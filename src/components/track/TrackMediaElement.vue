<template>
    <div
        v-if="
            mediaElement &&
            isTrackEditable &&
            showWaveformsOnEdit &&
            !FileHandler.isValidHttpUrl(mediaUrl)
        "
        class="block"
    >
        <!-- Waveforms are automatially only revealed for short audio files -->
        <CoveredPanel
            :reveal-for="[isShortDuration && !props.enableVideo]"
            :dismissible="false"
            :disabled="disabled || !(mediaElement || audioSource)"
            title="Waveform"
            transition-name="item-expand"
            :icon-path="mdiChevronDown"
        >
            <template #caption
                ><span class="has-opacity-half">
                    <BaseIcon v-once :path="mdiWaveform" /> </span
            ></template>
            <TrackAudioPeaks
                v-if="mediaElement"
                :key="mediaUrl"
                :media-element="mediaElement"
                :show-overview="showOverviewWaveformOnEdit"
            ></TrackAudioPeaks>
        </CoveredPanel>
    </div>
    <template v-if="props.enableVideo">
        <!-- use the video element -->
        <div
            v-show="showVideo && props.enableVideo"
            class="block video-container"
            :class="{
                'is-small': smallVideo,
                'is-loading': isLoading,
                paused: isPaused,
                seeking: isSeeking,
                fading: isFading !== FadingMode.None,
                'fade-out': isFading == FadingMode.FadeOut,
                'fade-in': isFading == FadingMode.FadeIn,
            }"
        >
            <video
                :id="mediaElementId"
                ref="mediaElement"
                :key="trackId"
                controls
                playsInline
                preload="metadata"
                :src="mediaUrlWithFragment"
                class="video"
                :class="{
                    'is-small': smallVideo,
                    'is-loading': isLoading,
                    paused: isPaused,
                    seeking: isSeeking,
                    fading: isFading !== FadingMode.None,
                    'fade-out': isFading == FadingMode.FadeOut,
                    'fade-in': isFading == FadingMode.FadeIn,
                }"
                title="Click to play/pause"
                @click="$emit('click')"
            ></video>
        </div>
    </template>
    <template v-else>
        <!-- use the audio element -->
        <audio
            :id="mediaElementId"
            ref="mediaElement"
            :key="trackId"
            preload="metadata"
            :src="mediaUrlWithFragment"
            class="video"
            :class="{
                'is-small': smallVideo,
                'is-loading': isLoading,
                paused: isPaused,
                seeking: isSeeking,
                fading: isFading !== FadingMode.None,
                'fade-out': isFading == FadingMode.FadeOut,
                'fade-in': isFading == FadingMode.FadeIn,
            }"
            title="Click to play/pause"
            @click="$emit('click')"
        ></audio>
    </template>
    <!-- NOTE: the rendering of the AudioLevelMeter _might_ affect badly the 
         synchronous start of the multitrack playback, 
         but only the first time after a page reload/player instantiation.
         It's currently not consistently reproducible and goes away after a 
         subsequent sync (e.g. after pause/play) -->
    <!-- NOTE: Teleportation of the AudioLevelMeter fails with a warning when 
         the parent track component has not yet been mounted.
         This situation is addressed with the isParentMounted flag. It's 
         working for loading/unloading/reloading compilation and
         adding new tracks.
         Disabling the teleportation does not work currently: When the 
         application settings change to show the meter, produces a warning. 
         The solution for this is using a v-if instead of disableing. -->
    <div
        v-if="
            ((isTrackEditable && showLevelMeterForEdit) || isTrackMixable) &&
            audioSource &&
            audioContext &&
            isContextRunning &&
            isParentMounted &&
            mediaUrl
        "
        class="block"
    >
        <!-- Show possibly large meters only on edit -->
        <AudioLevelMeter
            v-if="levelMeterSizeIsLarge && isTrackEditable"
            ref="audioLevelMeter"
            :key="trackId"
            :vertical="false"
            :disabled="disabled || isPaused"
            :audio-source="audioSource"
            :audio-context="audioContext"
            :show-text="false"
            :running="!isPaused && isAppVisible && audioLevelMeterIsVisible"
        >
        </AudioLevelMeter>
        <Teleport v-else :to="`#track-${trackId}-HeaderLevelPlaceholder`">
            <AudioLevelMeter
                ref="audioLevelMeter"
                :key="trackId"
                :vertical="true"
                :disabled="disabled || isPaused"
                :audio-source="audioSource"
                :audio-context="audioContext"
                :show-text="false"
                :running="!isPaused && isAppVisible && audioLevelMeterIsVisible"
            >
            </AudioLevelMeter>
        </Teleport>
    </div>

    <VideoTextTrackController
        v-if="isParentMounted && mediaUrl && props.enableVideo"
        v-model="showVideo"
        class="block"
        :cues="cues"
        :video-element="videoElement"
        :disabled="!mediaElement"
    ></VideoTextTrackController>
</template>

<script setup lang="ts">
import {
    computed,
    nextTick,
    onActivated,
    onBeforeUnmount,
    onDeactivated,
    onMounted,
    type PropType,
    type Ref,
    ref,
    shallowRef,
    type ShallowRef,
    watch,
} from 'vue';

import type { IMediaHandler } from '@/code/media/IMediaHandler';
import HtmlMediaHandler from '@/code/media/HtmlMediaHandler';
import { useAudioStore } from '@/store/audio';
import { Subscription } from 'sub-events';
import { FadingMode } from '@/code/media/IAudioFader';
import AudioLevelMeter from '@/components/displays/AudioLevelMeter.vue';
import VideoTextTrackController from '@/components/track/VideoTextTrackController.vue';
import FileHandler from '@/store/filehandler';
import CoveredPanel from '@/components/CoveredPanel.vue';
import TrackAudioPeaks from './TrackAudioPeaks.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiChevronDown, mdiWaveform } from '@mdi/js';
import { useDocumentVisibility } from '@vueuse/core';
import { useElementVisibility } from '@vueuse/core';
import { storeToRefs } from 'pinia';
import type { ICue } from '@/store/ICue';
import { useAppStore } from '@/store/app';

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
    /** The media file URL
     * @remark This URL can point to an online resource or be a local object URL
     */
    mediaUrl: {
        type: String,
        default: '',
        required: false,
    },

    /** The initial playback position
     * @remark If set, the initial playback position is set to this time, in [seconds], after the resource can be played.
     */
    start: {
        type: null as unknown as PropType<number | null>,
        default: null,
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
    cues: {
        type: Array as PropType<Array<ICue>>,
        required: true,
    },

    /** Whether to show the component in a disabled state
     * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
     */
    disabled: Boolean,

    /** Whether to enable the display of video.
     * @remarks If true, shows the video canvas and the video controls, and uses the HTML video element. VTT is generated.
     * If set to false, just uses the HTML audio element.
     * In any case, if enabled, the audio peak level control is rendered.
     */
    enableVideo: Boolean,

    /** Whether to show the audio level meter
     * @remarks Default is true
     */
    showLevelMeterForEdit: Boolean,

    /** Whether to show the waveforms (in the edit view)
     */
    showWaveformsOnEdit: Boolean,

    /** Whether to show the overview waveform (in the edit view)
     */
    showOverviewWaveformOnEdit: Boolean,

    /** Whether the audio level meter size is large */
    levelMeterSizeIsLarge: Boolean,

    /** Whether to show a height-limited video canvas
     */
    smallVideo: {
        type: Boolean,
        default: true,
        required: false,
    },
});

console.debug(
    `TrackMediaElement:setup:using mediaUrl '${props.mediaUrl}' for trackId '${props.trackId}' at start '${props.start}'`,
);

const app = useAppStore();
const { isTrackEditable, isTrackMixable } = storeToRefs(app);

// --- visibility ---

const showVideo = ref(true);
const visibility = useDocumentVisibility();
const isAppVisible = computed(() => {
    return visibility.value === 'visible';
});
const audioLevelMeter = ref(null);
const audioLevelMeterIsVisible = useElementVisibility(audioLevelMeter);

// --- Media Setup ---

const isLoading = computed(() => {
    return props.mediaUrl && mediaHandler.value == null;
});

const isShortDuration = computed(() => {
    return (
        mediaDuration.value != null && mediaDuration.value < 600
    ); /* 10 minutes*/
});

const audio = useAudioStore();

/** Audio or Video element to use
 * @devdoc Note: the element is only available after the component has been mouted
 */
const mediaElement: ShallowRef<HTMLMediaElement | null> = shallowRef(null);

/** The mediaElement casted as concrete HTMLVideoElement
 * @devdoc This allows proper use in the template
 */
const videoElement = computed(() => {
    return mediaElement?.value as HTMLVideoElement | null;
});

watch(mediaElement, async (newMediaElement, oldMediaElement) => {
    if (oldMediaElement !== null) {
        destroyHandler(oldMediaElement);
    }
    if (newMediaElement !== null) {
        mediaHandler.value = createAndEmitHandler(newMediaElement);
    }
});

const isPaused = ref(true);
const isSeeking = ref(false);
const mediaDuration: Ref<number | null> = ref(null);
const isFading = ref(FadingMode.None);
let onPauseChangedSubsription: Subscription;
let onSeekingChangedSubsription: Subscription;
let onDurationChangedSubsription: Subscription;
let onCanPlaySubsription: Subscription;
let onFadingChangedSubsription: Subscription;

const mediaHandler: Ref<IMediaHandler | null> = ref(null);

/** Properly destroy the handler, and abandon the media element, including it's handlers */
function destroyHandler(mediaElement: HTMLMediaElement): void {
    if (mediaHandler.value) {
        audio.removeMediaHandler(mediaHandler.value);
        //properly destroy the audio element and the audio context
        mediaHandler.value.stop();
        mediaHandler.value.pause();

        // cancel the internal event handlers
        onPauseChangedSubsription?.cancel();
        onSeekingChangedSubsription?.cancel();
        onDurationChangedSubsription?.cancel();
        onCanPlaySubsription?.cancel();
        onFadingChangedSubsription?.cancel();
    }

    if (mediaElement) {
        mediaElement.removeAttribute('src'); // empty resource
    }
    console.log('TrackMediaElement:destroyed');
}

function createAndEmitHandler(mediaElement: HTMLMediaElement): IMediaHandler {
    const handler = new HtmlMediaHandler(mediaElement) as IMediaHandler;

    console.log('TrackMediaElement:ready');
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
    onDurationChangedSubsription = handler.onDurationChanged.subscribe(
        (duration) => {
            mediaDuration.value = duration;
        },
    );
    onCanPlaySubsription = handler.onCanPlay.subscribe(() => {
        if (isInitialPositionToBeApplied) {
            handler.seekTo(props.start ?? 0);
            console.debug('onCanPlaySubsription:seekTo', props.start ?? 0);
            isInitialPositionToBeApplied = false;
        }
    });

    onFadingChangedSubsription = handler.fader.onFadingChanged.subscribe(
        (fading) => {
            isFading.value = fading;
        },
    );

    return handler;
}

/** Teardown of the element and handler.
 */
onBeforeUnmount(() => {
    console.debug('TrackMediaElement:onBeforeUnmount');
    if (mediaElement.value) {
        destroyHandler(mediaElement.value);
    }
});

const mediaElementId = computed(() => {
    return 'media-track-' + props.trackId;
});

// --- visual fading ---

/** Gets the fade-in duration in seconds, as string
 * @remarks Provision of dynamic CSS for visual fade-in according to audio fading */
const fadeInDuration = computed(() => {
    const fader = mediaHandler.value?.fader;
    const duration =
        fader?.isFadingEnabled && !mediaHandler.value?.omitsNextFadeIn
            ? fader?.fadeInDuration
                ? fader?.fadeInDuration / 1000
                : 0
            : 0;

    return `${duration}s`;
});

/** Gets the fade-out duration in seconds, as string
 * @remarks Provision of dynamic CSS for visual fade-in according to audio fading */
const fadeOutDuration = computed(() => {
    const fader = mediaHandler.value?.fader;
    const duration = fader?.isFadingEnabled
        ? fader?.fadeOutDuration
            ? fader?.fadeOutDuration / 1000
            : 0
        : 0;
    return `${duration}s`;
});

// --- Transport ---

/** Whether the initial position needs to be applied. The initial
 * position should get applied only once for each new media URL.
 */
let isInitialPositionToBeApplied = true;

/** The applicable mediaUrl with a possible fragment for the start time
 */
const mediaUrlWithFragment = ref('');

/** Whether media fragments can be used to set the initial starting position.
 * @remarks See https://replayer.app/de/blog/using-media-fragments-to-start-playback-from-a-specific-point-in-time
 * @remarks For online URL's this always works. However for blob URL's, there are issues
 * with iOS/WebKit, giving "The operation couldn’t be completed. (WebKitBlobResource error 1.)"
 * when media fragments are applied to blob URL's.
 */
function canUseMediaFragment(): boolean {
    return !props.mediaUrl.startsWith('blob:');
}

/** Handles initial and changed mediaUrls.
 * @remarks For online URL's,
 * applies a fragment to allow ranged loading and as the initial playback position.
 * For blob URL's, the start position must be applied explicitly after loading
 * @remarks See https://replayer.app/de/blog/using-media-fragments-to-start-playback-from-a-specific-point-in-time
 * @remarks The change of the start property is explicitly only handeled
 * together with the change of the media URL. Otherwise, each start change
 * would trigger an actual URL update. This would disturb playback handling.
 */
watch(
    () => props.mediaUrl,
    (mediaUrl) => {
        if (mediaUrl) {
            isInitialPositionToBeApplied = true;
            if (canUseMediaFragment()) {
                const fragment = props.start ? '#t=' + props.start : '';
                const fragmentedUrl = props.mediaUrl + fragment;
                console.debug(
                    `Applying url '${fragmentedUrl}' as mediaUrlWithFragment for trackId '${props.trackId}' at start '${props.start}'`,
                );
                mediaUrlWithFragment.value = fragmentedUrl;
                isInitialPositionToBeApplied = false;
            } else {
                mediaUrlWithFragment.value = props.mediaUrl;
            }
        }
    },
    { immediate: true /* to handle it at least once after mount time */ },
);

// --- Audio Metering Setup---

const { audioContext, isContextRunning } = storeToRefs(audio);

/** The optional audio source node, required when metering is requested
 */
const audioSource: ShallowRef<InstanceType<
    typeof MediaElementAudioSourceNode
> | null> = shallowRef(null);

/** Watch the showLevelMeterForEdit setting and media url changes, and act accordingly
 * @remarks This handles the audio setup for metering
 * @devdoc Handle the value also immediately at mount time
 */
watch(
    [
        () => props.showLevelMeterForEdit,
        () => props.mediaUrl,
        () => mediaElement.value,
        () => isTrackEditable.value,
        () => isTrackMixable.value,
        () => isPaused.value /* only used as trigger */,
        () => isContextRunning.value /* only used as trigger */,
    ],
    ([
        showLevelMeterForEdit,
        mediaUrl,
        mediaElement,
        isTrackEditable,
        isTrackMixable,
    ]) => {
        if (showLevelMeterForEdit) {
            // Metering is only used in edit or mix mode
            if (isTrackEditable || isTrackMixable) {
                if (audioContext.value && isContextRunning.value) {
                    // Create the level meter and associated routing only when requested, and only for local files
                    if (
                        showLevelMeterForEdit &&
                        mediaUrl &&
                        mediaElement &&
                        !FileHandler.isValidHttpUrl(mediaUrl)
                    ) {
                        if (audioSource.value === null) {
                            audioSource.value =
                                audioContext.value.createMediaElementSource(
                                    mediaElement,
                                );
                        }
                        audioSource.value.connect(
                            audioContext.value.destination,
                        );
                    } else {
                        //NOTE: a MediaElementAudioSourceNode can not get destroyed, so this will be reused if later required
                        //See https://stackoverflow.com/a/38631334/79485
                        audioSource.value?.disconnect(/* from analyser */);
                        audioSource.value?.connect(
                            audioContext.value.destination,
                        );
                    }
                } else {
                    console.warn(
                        'Audio context is not available or not (yet) running. Audio Level Meter remains disconnected.',
                    );
                }
            }
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

<style scoped>
/** Match the animation duration to the fade duration
* @devdoc NOTE: The animation is defined in _replayer-video.scss
*/
audio,
video {
    animation-duration: v-bind('fadeInDuration');
}

/** During fading, slowly adapt the brightness 
* @devdoc NOTE: The animation is defined in _replayer-video.scss
*/
audio.fade-out,
video.fade-out {
    animation-duration: v-bind('fadeOutDuration');
}
/** When paused, immediately reduce the brightness */
audio.paused,
video.paused {
    animation-duration: 0s;
}
</style>
