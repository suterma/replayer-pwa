<template>
    mediaelement!
    <!-- <youtube-iframe video-id="dQw4w9WgXcQ" @ready="onReady" /> -->
    <div ref="player"></div>

    endMediaElement!
</template>

<script setup lang="ts">
// Import the 'usePlayer' function
import { usePlayer } from '@vue-youtube/core';
import { onMounted, ref } from 'vue';
import { getCurrentInstance } from 'vue';
import { createManager } from '@vue-youtube/core';

// Locally register the create manager plugin (avoid vue instance pollution and
// data disclosure, when this component is not used)
const app = getCurrentInstance();
if (app) {
    app.appContext.app.use(createManager());
}

// Use a template ref to reference the target element
const player = ref();

// Call the 'usePlayer' function with the desired video ID and target ref
const { onReady } = usePlayer('sKGoqpqJ-MM', player, {
    playerVars: {
        autoplay: 0,
        disablekb: 1 /* replayer handles keyboard events on it's own*/,
        enablejsapi: 1,
        origin: 'https://localhost:8080',
    },
});

// Provide multiple event callbacks at once
onReady(
    (event) => {
        console.log('I will get triggered when the player is ready');
    },
    (event) => {
        console.log('You will see this message as well!');
    },
);

onMounted(() => {
    console.log('TrackYoutubeElement::mounted');
});

/** A simple vue youtube player element, for a single track, without further visuals, using an {mediaelement.js}.
 * @remarks Repeatedly emits 'timeupdate' with the current playback time, during playback.
 * @remarks Emits 'durationChanged' with the track duration in seconds, once after
 * successful load of the metadata of the track's media file
 * @devdoc Autoplay after load is intentionally not supported, as this is of no use for the Replayer app.
 */

//const emit = defineEmits(['ready', 'click']);

const props = defineProps({
    /** The media file URL
     * @remark This URL can point to an online resource or be a local object URL
     */
    mediaUrl: {
        type: String,
        default: '',
        required: false,
    },
});
</script>
