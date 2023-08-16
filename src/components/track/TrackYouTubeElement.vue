<template>
    //TODO use global styles //Make fader overlay working
    <div
        v-show="showVideo"
        :id="'track-youtube-element-' + trackId"
        class="block video-container youtube"
        :class="{
            paused: isPaused,
            fading: isFading !== FadingMode.None,
            'fade-out': isFading == FadingMode.FadeOut,
            'fade-in': isFading == FadingMode.FadeIn,
        }"
        @click="$emit('click')"
        title="Click to play/pause"
    >
        <div ref="youtubePlayerElement" class="video youtube"></div>
    </div>
</template>

<script setup lang="ts">
import { PlayerStateChangeCallback, usePlayer } from '@vue-youtube/core';
import { PropType, Ref, computed, onUnmounted, ref } from 'vue';
import { getCurrentInstance } from 'vue';
import { createManager } from '@vue-youtube/core';
import type { Player } from '@vue-youtube/shared';
import { IMediaHandler } from '@/code/media/IMediaHandler';
import YouTubeMediaHandler from '@/code/media/YoutubeMediaHandler';
import { useAudioStore } from '@/store/audio';
import { ICue } from '@/store/compilation-types';
import { FadingMode } from '@/code/media/IAudioFader';
import { Subscription } from 'sub-events';

/** A simple vue YouTube player, for a single track, using VueYoutube.
 * @remarks Repeatedly emits 'timeupdate' with the current playback time, during playback.
 * @remarks Emits 'durationChanged' with the track duration in seconds, once after
 * successful load of the video
 * @devdoc Autoplay is intentionally not supported, as this is of no use for the Replayer app.
 */

const emit = defineEmits(['ready', 'click']);

const props = defineProps({
    /** The title of the track */
    title: {
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

    /** The YouTube video URL
     * @remark This URL can point to an online resource or be a local object URL
     */
    url: {
        type: String,
        default: '',
        required: true,
    },
});

// --- visibility ---

const showVideo = ref(true);

// --- player setup ---

// Locally register the create manager plugin (avoiding vue instance pollution and
// unnecessary data disclosure, when this component is not used)
const app = getCurrentInstance();
if (app) {
    app.appContext.app.use(createManager());
}

// Use a template ref to reference the target element
const youtubePlayerElement = ref();

const videoId = computed(() => {
    //taken from https://stackoverflow.com/a/8260383/79485
    var regExp =
        /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = props.url.match(regExp);
    return match && match[7]?.length == 11 ? match[7] : '';
});

// Call the 'usePlayer' function with the desired video ID and target ref
const {
    onReady,
    onStateChange,
    onError,
    togglePlay,
    toggleMute,
    toggleLoop,
    instance,
} = usePlayer(videoId.value, youtubePlayerElement, {
    playerVars: {
        autoplay: 0,
        disablekb: 1 /* replayer handles keyboard events on it's own*/,
        enablejsapi: 1,
        origin: 'https://localhost:8080',
    },
});

onError((event) => {
    console.error('TrackYoutubeElement::onStateChange:onError:', event);
});

/// --- create handler (when ready) ---

const mediaHandler: Ref<IMediaHandler | null> = ref(null);

const audio = useAudioStore();

onReady(() => {
    if (instance.value) {
        mediaHandler.value = createAndEmitHandler(
            onStateChange,
            instance.value,
        );
    }
});

function createAndEmitHandler(
    onStateChange: (...cb: PlayerStateChangeCallback[]) => void,
    player: Player,
): IMediaHandler {
    const handler = new YouTubeMediaHandler(
        onStateChange,
        player,
        //TODO use track volume
        0.5,
        props.trackId,
    ) as IMediaHandler;

    console.log('TrackYouTubeElement:ready');
    emit('ready', handler);
    audio.addMediaHandler(handler);

    // Internally handle some events of our own
    onPauseChangedSubsription = handler.onPausedChanged.subscribe((paused) => {
        isPaused.value = paused;
    });
    onFadingChangedSubsription = handler.fader.onFadingChanged.subscribe(
        (fading) => {
            isFading.value = fading;
        },
    );

    return handler;
}

const isPaused = ref(true);
const isFading = ref(FadingMode.None);
let onPauseChangedSubsription: Subscription;
let onFadingChangedSubsription: Subscription;

/** Teardown of the YouTube player and handler.
 */
onUnmounted(() => {
    destroyHandler();
});

/** Properly destroy the handler, and abandon the YouTube player, including it's handlers */
function destroyHandler(): void {
    if (mediaHandler.value) {
        audio.removeMediaHandler(mediaHandler.value);
        //properly destroy the audio element and the audio context
        mediaHandler.value.stop();
        mediaHandler.value.pause();
    }

    // cancel the internal event handlers
    onPauseChangedSubsription.cancel();
    onFadingChangedSubsription.cancel();

    if (instance.value) {
        instance.value.destroy();
    }
    console.log('TrackYouTubeElement:destroyed');
}
</script>
<style>
/** Make the YouTube IFrame player responsive 
* See https://webmasterin.net/youtube-videos-responsive-einbinden/
* This exact padding value is required to make the 
* video fully visible, with the aspect ratio of 16:9  
*/
.video-container.youtube {
    position: relative;
    padding-bottom: 56.25%;
    padding-top: 0;
    height: 0;
    overflow: hidden;
}

.video-container.youtube .video.youtube {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/** For the edit view, limit the height */
.track.is-editable .video-container.youtube .video.youtube,
.track.is-editable .video.youtube::after {
    max-height: 33vh;
}

@media screen and (min-width: 848px) {
    .track.is-editable .video-container.youtube {
        padding-bottom: 33vh;
    }
}
</style>
