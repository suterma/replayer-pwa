<template>
    <div
        class="container"
        :class="{
            paused: isPaused,
            fading: isFading,
        }"
    >
        <video
            controls
            :id="mediaElementId"
            :src="props.mediaUrl"
            ref="videoElement"
            :class="{
                paused: isPaused,
                fading: isFading,
            }"
            title="Click to play/pause"
        ></video>
    </div>
</template>

<script setup lang="ts">
import {
    computed,
    onUnmounted,
    ref,
    shallowRef,
    ShallowRef,
    watchEffect,
} from 'vue';
//TOOD fix import { useAudioStore } from '@/store/audio';
import { IMediaHandler } from '@/code/media/IMediaHandler';
import MediaHandler from '@/code/media/MediaHandler';
import { useAudioStore } from '@/store/audio';

/** A simple vue video player element, for a single track, with associated visuals, using an {HTMLVideoElement}.
 * @devdoc Intentionally, the memory-consuming buffers from the Web Audio API are not used.
 * This has some implications for looping and transport.
 * @remarks Repeatedly emits 'timeupdate' with the current playback time, during playback.
 * @remarks Emits 'durationChanged' with the track duration in seconds, once after
 * successful load of the metadata of the track's media file
 * @devdoc Autoplay after load is intentionally not supported, as this is of no use for the Replayer app.
 */

const emit = defineEmits(['ready']);

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

    /** Whether to show the component in a disabled state
     * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
     */
    disabled: Boolean,
});

// --- Media Setup ---

const audio = useAudioStore();

//let handler: MediaHandler | null = null;

/** Video element to use
 * @devdoc The element is only available after the component has been mouted
 */
const videoElement: ShallowRef<HTMLVideoElement | null> = shallowRef(null);
watchEffect(() => {
    if (videoElement.value) {
        emitHandler(videoElement.value);
    }
    //TODO maybe later use cleanup?
});

const isPaused = ref(true);
const isFading = ref(false);

function emitHandler(video: HTMLVideoElement) {
    const mediaHandler = new MediaHandler(video) as IMediaHandler;

    console.log('TrackVideoElement:ready');
    emit('ready', mediaHandler);
    audio.addMediaHandler(mediaHandler);
    //TODO is this really necessary?this.handler = handler;

    // Internally handle some events of our own
    mediaHandler.onPausedChanged.subscribe((paused) => {
        isPaused.value = paused;
    });
    mediaHandler.onFadingChanged.subscribe((fading) => {
        isFading.value = fading;
    });
}

/** Handles the teardown of the audio graph outside the mounted lifespan.
 */
onUnmounted(() => {
    // if (handler) {
    //     audio.removeMediaHandler(handler);
    //     //properly destroy the audio element and the audio context
    //     handler.stop();
    //     handler.pause();
    //     if (videoElement.value) {
    //         videoElement.value.removeAttribute('src'); // empty resource
    //     }
    // }
});

const mediaElementId = computed(() => {
    return 'video-track-' + props.trackId;
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
    filter: brightness(1);
    animation-name: unfade-from-grey;
    animation-duration: 0.2s;
}
video.paused {
    animation-name: fade-to-grey;
    animation-duration: 0.2s;
    filter: brightness(40%);
}

/**
 * Adding an overlay for plabyck indication.
  * @remarks Requires a surrounding div to have the positioning working
  * (does not work directly on the the video element)
 */

.container {
    position: relative;
    background-color: black;
}

.container:after {
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

.container.paused:after {
    opacity: 0.8;
}

/**
 * Video hover similar to button hover (except background, since there is already one with the svg)
 */
.container:hover:after {
    border-color: #7a8288;
    border-width: 1px;
    border-style: solid;
    text-shadow: 1px 1px 1px rgba(10, 10, 10, 0.3);
}
</style>
