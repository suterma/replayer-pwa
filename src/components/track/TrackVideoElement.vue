<template>
    TrackVideoElement
    <video
        :id="'track-' + props.trackId"
        :src="props.mediaUrl"
        ref="videoElement"
    ></video>
</template>

<script setup lang="ts">
import { onUnmounted, ref, shallowRef, ShallowRef, onMounted } from 'vue';
//TOOD fix import { useAudioStore } from '@/store/audio';
import MediaHandler from '@/code/media/MediaHandler';
import { IMediaHandler } from '@/code/media/IMediaHandler';

/** A simple vue video player element, for a single track, with associated visuals, using an {HTMLVideoElement}.
 * @devdoc Intentionally, the memory-consuming buffers from the Web Audio API are not used.
 * This has some implications for looping and transport.
 * @remarks Repeatedly emits 'timeupdate' with the current playback time, during playback.
 * @remarks Emits 'durationChanged' with the track duration in seconds, once after
 * successful load of the metadata of the track's media file
 * @devdoc Autoplay after load is intentionally not supported, as this is of no use for the Replayer app.
 */

defineExpose({
    /* the media handler */
    video,
});

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

// --- Audio Setup ---

//TOOD fix const audio = useAudioStore();

/** Video element to use
 * @devdoc The element is only available after the component has been mouted
 */
const videoElement: ShallowRef<HTMLVideoElement | null> = shallowRef(null);

/** The media handler to use */
const mediaHandler = ref<IMediaHandler | null>(null);

onMounted(() => {
    /** The media handler to use */
    if (videoElement.value) {
        mediaHandler.value = new MediaHandler(videoElement.value);
        //TOOD fix audio.addMediaHandler(mediaHandler.value);
        //TODO emit the mediahandler to the parent
    }
});
onUnmounted(() => {
    if (mediaHandler.value) {
        //TOOD fix audio.removeMediaHandler(mediaHandler.value);
    }
});

/** Handles the teardown of the audio graph outside the mounted lifespan.
 * @devdoc The audio element is intentionally not added to the DOM, to keep it unaffected of unmounts during vue-router route changes.
 */

onUnmounted(() => {
    if (mediaHandler.value) {
        //properly destroy the audio element and the audio context
        mediaHandler.value.stop();
        mediaHandler.value.pause();
        if (videoElement.value) {
            videoElement.value.removeAttribute('src'); // empty resource
        }
    }
});

// --- providing the handler ---

function video() /*: Ref<IMediaHandler | null>*/ {
    return mediaHandler;
}
</script>
