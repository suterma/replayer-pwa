<template>
    <div
        v-show="showVideo && props.enableVideo"
        class="block video-container"
        :class="{
            paused: isPaused,
            seeking: isSeeking,
            fading: isFading !== FadingMode.None,
            'fade-out': isFading == FadingMode.FadeOut,
            'fade-in': isFading == FadingMode.FadeIn,
        }"
    >
        <video
            controls
            :id="mediaElementId"
            :src="props.mediaUrl"
            ref="videoElement"
            :class="{
                paused: isPaused,
                seeking: isSeeking,
                fading: isFading !== FadingMode.None,
                'fade-out': isFading == FadingMode.FadeOut,
                'fade-in': isFading == FadingMode.FadeIn,
            }"
            @click="$emit('click')"
            title="Click to play/pause"
        ></video>
    </div>
    <!-- NOTE: the rendering of the AudioLevelMeter _might_ affect badly the synchronous start of the multitrack playback, 
         but only the first time after a page reload/player instantiation.
         It's currently not consistently reproducible and goes away after a subsequent sync (e.g. after pause/play) -->
    <!-- NOTE: Teleportation fails with a warning when the parent track component has not yet been mounted.
         This situation is addressed with the isParentMounted flag. It's working for loading/unloading/reloading compilation and
         adding new tracks.
         Disabling the teleportation does not work currently: When the application settings change to show the meter, produces a warning. 
         The solution for this is using a v-if instead of disableing. -->

    <div
        v-if="
            showLevelMeter &&
            audioSource &&
            audio.context &&
            isParentMounted &&
            mediaUrl
        "
        class="block"
    >
        <AudioLevelMeter
            v-if="levelMeterSizeIsLarge"
            :vertical="false"
            :disabled="disabled"
            :audioSource="audioSource"
            :audioContext="audio.context"
            :showText="false"
        >
        </AudioLevelMeter>
        <Teleport v-else :to="`#track-${trackId}-HeaderLevelPlaceholder`">
            <AudioLevelMeter
                :vertical="true"
                :disabled="disabled"
                :audioSource="audioSource"
                :audioContext="audio.context"
                :showText="false"
            >
            </AudioLevelMeter>
        </Teleport>
    </div>

    <div v-if="isParentMounted && mediaUrl && props.enableVideo" class="block">
        <VideoTextTrackController
            v-model="showVideo"
            :trackId="trackId"
            :cues="cues"
            :title="title"
            :videoElement="videoElement"
            :disabled="!videoElement"
        ></VideoTextTrackController>
    </div>
</template>

<script setup lang="ts">
import {
    computed,
    nextTick,
    onActivated,
    onBeforeUnmount,
    onDeactivated,
    onMounted,
    onUnmounted,
    PropType,
    Ref,
    ref,
    shallowRef,
    ShallowRef,
    watch,
} from 'vue';

import { IMediaHandler } from '@/code/media/IMediaHandler';
import HtmlMediaHandler from '@/code/media/HtmlMediaHandler';
import { useAudioStore } from '@/store/audio';
import { Subscription } from 'sub-events';
import { FadingMode } from '@/code/media/IAudioFader';
import AudioLevelMeter from 'vue-audio-level-meter/src/components/AudioLevelMeter.vue';
import VideoTextTrackController from '@/components/track/VideoTextTrackController.vue';
import FileHandler from '@/store/filehandler';
import { ICue } from '@/store/compilation-types';

/** A simple vue video player element, for a single track, with associated visuals, using an {HTMLVideoElement}.
 * @devdoc Intentionally, the memory-consuming buffers from the Web Audio API are not used.
 * This has some implications for looping and transport.
 * @remarks Repeatedly emits 'timeupdate' with the current playback time, during playback.
 * @remarks Emits 'durationChanged' with the track duration in seconds, once after
 * successful load of the metadata of the track's media file
 * @devdoc Autoplay after load is intentionally not supported, as this is of no use for the Replayer app.
 */

const emit = defineEmits(['ready', 'click']);

const props = defineProps({
    /** The title of the track */
    title: {
        type: String,
        default: '',
        required: false,
    },
    /** The media file URL
     * @remark This URL can point to an online resource or be a local object URL
     */
    mediaUrl: {
        type: String,
        default: '',
        required: false,
    },

    /** The track id
     * @remarks Used to have a unique id on the encapsulated video element
     */
    trackId: {
        type: String,
        required: true,
    },

    /** The cues to show
     * @remarks The cue descriptions are shown as VTT cues.
     */
    cues: Array as PropType<Array<ICue>>,

    /** Whether to show the component in a disabled state
     * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
     */
    disabled: Boolean,

    /** Whether to enable the video output
     * @remarks If true, shows the video canvas and the video controls.
     * If set to false, hides the video canvas and the video controls.
     * In any case the VTT is generated and, if enabled, the audio peak level control is rendered.
     */
    enableVideo: Boolean,

    /** Whether to show the audio level meter
     * @remarks Default is true
     */
    showLevelMeter: Boolean,

    /** EXPERIMENTAL: Whether to show the waveforms
     * @remarks Default is false
     */
    experimentalShowWaveforms: Boolean,

    /** Whether the audio level meter size is large */
    levelMeterSizeIsLarge: Boolean,
});

// --- visibility ---

const showVideo = ref(true);

// --- Media Setup ---

const audio = useAudioStore();

/** Video element to use
 * @devdoc Note: the element is only available after the component has been mouted
 */
const videoElement: ShallowRef<HTMLVideoElement | null> = shallowRef(null);

watch(videoElement, async (newVideoElement, oldVideoElement) => {
    if (oldVideoElement !== null) {
        destroyHandler(oldVideoElement);
    }
    if (newVideoElement !== null) {
        mediaHandler.value = createAndEmitHandler(newVideoElement);
    }
});

const isPaused = ref(true);
const isSeeking = ref(false);
const isFading = ref(FadingMode.None);

const mediaHandler: Ref<IMediaHandler | null> = ref(null);

let onPauseChangedSubsription: Subscription;
let onSeekingChangedSubsription: Subscription;
let onFadingChangedSubsription: Subscription;

/** Properly destroy the handler, and abandon the video element, including it's handlers */
function destroyHandler(video: HTMLVideoElement): void {
    if (mediaHandler.value) {
        audio.removeMediaHandler(mediaHandler.value);
        //properly destroy the audio element and the audio context
        mediaHandler.value.stop();
        mediaHandler.value.pause();

        // cancel the internal event handlers
        onPauseChangedSubsription.cancel();
        onSeekingChangedSubsription.cancel();
        onFadingChangedSubsription.cancel();

        if (video) {
            video.removeAttribute('src'); // empty resource
        }
        console.log('TrackVideoElement:destroyed');
    }
}

function createAndEmitHandler(video: HTMLVideoElement): IMediaHandler {
    const handler = new HtmlMediaHandler(video) as IMediaHandler;

    console.log('TrackVideoElement:ready');
    emit('ready', handler);
    audio.addMediaHandler(handler);

    // Internally handle some events of our own
    onPauseChangedSubsription = handler.onPausedChanged.subscribe((paused) => {
        isPaused.value = paused;
    });
    onSeekingChangedSubsription = handler.onSeekingChanged.subscribe(
        (seeking) => {
            isSeeking.value = seeking;
        },
    );
    onFadingChangedSubsription = handler.fader.onFadingChanged.subscribe(
        (fading) => {
            isFading.value = fading;
        },
    );

    return handler;
}

/** Teardown of the element and handler.
 */
onUnmounted(() => {
    if (videoElement.value) {
        destroyHandler(videoElement.value);
    }
});

const mediaElementId = computed(() => {
    return 'video-track-' + props.trackId;
});

/** Gets the fade-in duration in seconds, as string
 * @remarks Provision of dynamic CSS for visual fade-in according to audio fading */
const fadeInDuration = computed(() => {
    const fader = mediaHandler.value?.fader;
    const duration = fader?.fadeInDuration ? fader?.fadeInDuration / 1000 : 0;
    return `${duration}s`;
});

/** Gets the fade-out duration in seconds, as string
 * @remarks Provision of dynamic CSS for visual fade-in according to audio fading */
const fadeOutDuration = computed(() => {
    const fader = mediaHandler.value?.fader;
    const duration = fader?.fadeOutDuration ? fader?.fadeOutDuration / 1000 : 0;
    return `${duration}s`;
});

// --- Audio Metering Setup---

/** The optional audio source node, required when metering is requested
 */
const audioSource: ShallowRef<InstanceType<
    typeof MediaElementAudioSourceNode
> | null> = shallowRef(null);

/** Watch the showLevelMeter setting and media url changes, and act accordingly
 * @remarks This handles the audio setup for metering
 * @devdoc Handle the value also immediately at mount time
 */
watch(
    [
        () => props.showLevelMeter,
        () => props.mediaUrl,
        () => videoElement.value,
    ],
    (
        [showLevelMeter, mediaUrl, newVideoElement],
        [
            wasShowingLevelMeter /* old mediaUrl and old vidoe element is not used */,
        ],
    ) => {
        console.debug(
            `TrackAudioElement(${props.title})::watch:mediaUrl:${props.mediaUrl} for title ${props.title}:showLevelMeter${showLevelMeter}`,
        );
        // Create the level meter and associated routing only when requested, and only for local files
        if (
            showLevelMeter &&
            mediaUrl &&
            newVideoElement &&
            !FileHandler.isValidHttpUrl(mediaUrl)
        ) {
            if (audioSource.value === null) {
                audioSource.value = audio.context.createMediaElementSource(
                    newVideoElement as HTMLMediaElement,
                );
            }
            audioSource.value.connect(audio.context.destination);
            console.debug(
                `TrackAudioElement(${props.title})::watch:mediaUrl:${props.mediaUrl} for title ${props.title}:connected`,
            );
        } else {
            audioSource.value?.disconnect(audio.context.destination);
            audioSource.value?.disconnect();
            //NOTE: a MediaElementAudioSourceNode can not get destroyed, so this will be reused if later required
            //See https://stackoverflow.com/a/38631334/79485
        }
        if (wasShowingLevelMeter === true && !showLevelMeter) {
            // reconnect the just lost connection to the output
            audioSource.value?.connect(audio.context.destination);
        }
    },
    { immediate: true },
);

// --- Mounted check ---

/** A fully mounted parent is required for the complete lifetime
 *  for a properly working level meter with it's teleportation
 * @devdoc To cater for a use with KeepAlive, the activated/deactivated events are also handled
 *  */
const isParentMounted = ref(false);
onMounted(() => {
    nextTick(() => {
        // Now also the parent track is completely mounted
        isParentMounted.value = true;
    });
});
onActivated(() => {
    nextTick(() => {
        // Now also the parent track is completely mounted
        isParentMounted.value = true;
    });
});

onBeforeUnmount(() => {
    isParentMounted.value = false;
});
onDeactivated(() => {
    isParentMounted.value = false;
});
</script>

<style>
/**
 * Fading to grey for paused state indication.
 * @remarks A simple transition does not work for filter functions
 */
@keyframes fade-to-grey {
    from {
        filter: brightness(1);
    }
    to {
        filter: brightness(0.4);
    }
}

@keyframes unfade-from-grey {
    from {
        filter: brightness(0.4);
    }
    to {
        filter: brightness(1);
    }
}

video {
    animation-name: unfade-from-grey;
    animation-duration: v-bind('fadeInDuration');
    filter: brightness(1);
}

/** During fading, slowly adapt the brightness */
video.fade-out {
    animation-name: fade-to-grey;
    animation-duration: v-bind('fadeOutDuration');
    filter: brightness(0.4);
}
/** When paused, immediately reduce the brightness */
video.paused {
    animation-name: fade-to-grey;
    animation-duration: 0s;
    filter: brightness(0.4);
}

/**
 * Adding an overlay for plabyck indication.
  * @remarks Requires a surrounding div to have the positioning working
  * (does not work directly on the the video element)
 */

.video-container {
    position: relative;
    background-color: black;
}

.video-container:after {
    content: '';
    position: absolute;
    color: #fafafa;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    pointer-events: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath fill='%23fafafa' d='M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M10,16.5L16,12L10,7.5V16.5Z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: center;
    background-size: 10vmax;

    opacity: 0;
    transition: opacity 200ms ease;
}

.video-container.paused:after {
    opacity: 0.8;
    transition: opacity 200ms ease;
}

/**
 * Video hover similar to button hover (except background, since there is already one with the svg)
 */
.video-container:hover:after {
    border-color: #7a8288;
    border-width: 1px;
    border-style: solid;
    text-shadow: 1px 1px 1px rgba(10, 10, 10, 0.3);
}

/** Use available horizontal space, but limit height */
.video-container,
video {
    width: 100%;
}

/** limit height on edit, by default */
.track.is-editable .video-container,
.track.is-editable video {
    height: 33vh;
}
</style>

<style>
/** Rotate the audio level meter according to it's DOM target */
.audio-level-meter.vertical {
    transform: rotate(-90deg);
    width: 2.5em;
}
.audio-level-container.vertical {
    width: 1.25em;
    margin-left: -0.75em;
    padding-left: -0.75em;
}
</style>
