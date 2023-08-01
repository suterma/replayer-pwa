<template>
    <video
        controls
        :id="mediaElementId"
        :src="props.mediaUrl"
        ref="videoElement"
    ></video>
</template>

<script setup lang="ts">
import {
    computed,
    onUnmounted,
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

function emitHandler(video: HTMLVideoElement) {
    const mediaHandler = new MediaHandler(video) as IMediaHandler;

    console.log('TrackVideoElement:ready');
    emit('ready', mediaHandler);
    audio.addMediaHandler(mediaHandler);
    //TODO is this really necessary?this.handler = handler;
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
