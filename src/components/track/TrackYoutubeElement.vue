<template>
    <div ref="youtubePlayer" id="custom-track-id"></div>
    <button @click="togglePlay">Pause / Unpause</button>
    <button @click="toggleMute">Mute / Unmute</button>
    <button @click="toggleLoop">Loop / No loop</button>
    <button @click="instance?.seekTo(10, true)">Seek to 10</button>

    Duration: {{ duration }} Current Time: {{ currentTime }}
</template>

<script setup lang="ts">
import { PlayerState, usePlayer } from '@vue-youtube/core';
import { onMounted, onUnmounted, ref } from 'vue';
import { getCurrentInstance } from 'vue';
import { createManager } from '@vue-youtube/core';

// Locally register the create manager plugin (avoiding vue instance pollution and
// unnecessary data disclosure, when this component is not used)
const app = getCurrentInstance();
if (app) {
    app.appContext.app.use(createManager());
}

// Use a template ref to reference the target element
const youtubePlayer = ref();

// Call the 'usePlayer' function with the desired video ID and target ref
const {
    onReady,
    onStateChange,
    onError,
    togglePlay,
    toggleMute,
    toggleLoop,
    instance,
} = usePlayer('DkYPge6ZKSQ', youtubePlayer, {
    playerVars: {
        autoplay: 0,
        disablekb: 1 /* replayer handles keyboard events on it's own*/,
        enablejsapi: 1,
        origin: 'https://localhost:8080',
    },
});

onStateChange((event) => {
    if (event.data == PlayerState.UNSTARTED) {
        console.debug('TrackYoutubeElement::onStateChange:UNSTARTED');
    }
    if (event.data == PlayerState.ENDED) {
        /* occurs when the video has ended */
        console.debug('TrackYoutubeElement::onStateChange:ENDED');
    }
    if (event.data == PlayerState.PLAYING) {
        console.debug('TrackYoutubeElement::onStateChange:PLAYING');
    }
    if (event.data == PlayerState.PAUSED) {
        console.debug('TrackYoutubeElement::onStateChange:PAUSED');
    }
    if (event.data == PlayerState.BUFFERING) {
        console.debug('TrackYoutubeElement::onStateChange:BUFFERING');
    }
    if (event.data == PlayerState.VIDEO_CUED) {
        console.debug('TrackYoutubeElement::onStateChange:VIDEO_CUED');
    }
});

onError((event) => {
    console.error('TrackYoutubeElement::onStateChange:onError:', event);
});

onMounted(() => {
    console.log('TrackYoutubeElement::mounted');
});

/// --- updating time (when ready) ---

const currentTime = ref(0);
const duration = ref(0);
const isReady = ref(false);
onReady((event) => {
    isReady.value = true;
    updateCurrentTime();

    duration.value = instance.value?.getDuration() ?? 0;
});
onUnmounted(() => {
    isReady.value = false;
});
function updateCurrentTime() {
    if (isReady.value) {
        currentTime.value = instance.value?.getCurrentTime() ?? 0;
        window.requestAnimationFrame(updateCurrentTime);
    }
}

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
