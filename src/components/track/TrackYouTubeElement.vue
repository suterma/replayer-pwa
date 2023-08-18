<template>
    <div
        v-show="showVideo && !playerErrorCode"
        :id="'track-youtube-element-' + trackId"
        class="block video-container youtube"
        :class="{
            paused: isPaused,
            fading: isFading !== FadingMode.None,
            'fade-out': isFading == FadingMode.FadeOut,
            'fade-in': isFading == FadingMode.FadeIn,
        }"
        @click="
            {
                $emit('click');
                mediaHandler?.play();
            }
        "
        title="Click to play/pause"
    >
        <div
            class="video youtube"
            :class="{
                paused: isPaused,
                fading: isFading !== FadingMode.None,
                'fade-out': isFading == FadingMode.FadeOut,
                'fade-in': isFading == FadingMode.FadeIn,
            }"
        >
            <!-- The following div will be replaced by the IFrame player -->
            <div ref="youtubePlayerElement"></div>
        </div>
    </div>
    <div v-if="hasNotAllowedError" class="block notification is-danger">
        <p>
            The owner of this video does not allow it to be played in embedded
            players like Replayer.
        </p>
        <p>
            <a :href="videoUrl" target="_blank">Watch this video on YouTube</a>
            instead, without Replayer.
        </p>
    </div>
</template>

<script setup lang="ts">
import {
    PlayerError,
    PlayerStateChangeCallback,
    usePlayer,
} from '@vue-youtube/core';
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

// Locally (instead of globally) register the create manager plugin.
// This avoids vue instance pollution and
// unnecessary data disclosure, when this component is not used.
const youTubeManagerAlreadyExists =
    document.querySelectorAll(
        `script[src="https://www.youtube.com/player_api"]`,
    ).length > 0;

if (!youTubeManagerAlreadyExists) {
    const app = getCurrentInstance();
    if (app) {
        app.appContext.app.use(createManager());
    }
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

const videoUrl = computed(() => {
    return instance.value?.getVideoUrl();
});

// Call the 'usePlayer' function with the desired video ID and target ref
const {
    onReady,
    onStateChange,
    onError,
    // togglePlay,
    // toggleMute,
    // toggleLoop,
    instance,
} = usePlayer(videoId.value, youtubePlayerElement, {
    /** See https://developers.google.com/youtube/player_parameters#Parameters */
    playerVars: {
        autoplay: 0,
        disablekb: 1 /* replayer handles keyboard events on it's own*/,
        enablejsapi: 1,
        color: 'white',
        controls: 1,
        //TODO no effect is visible here:
        // origin: 'http://localhost:8080/',
        //origin: 'http://127.0.0.0:8080/',
        rel: 0,
    },
});

// --- error handling ---

const playerErrorCode: Ref<string | null> = ref(null);
const playerErrorMessage: Ref<string | null> = ref(null);

const hasNotAllowedError = computed(() => {
    return (
        playerErrorCode.value == PlayerError[PlayerError.NOT_ALLOWED] ||
        playerErrorCode.value == PlayerError[PlayerError.NOT_ALLOWED_DISGUISE]
    );
});

/** Handle YouTube IFrame player errors
 * See https://developers.google.com/youtube/iframe_api_reference#Events for details
 */
onError((event) => {
    //TODO set eror code
    // the handle error message instead of video player locally
    playerErrorCode.value = PlayerError[event.data];
    switch (playerErrorCode.value) {
        case null:
            break;
        case PlayerError[PlayerError.INVALID_PARAMETER]:
            playerErrorMessage.value = `The request contains an invalid parameter value. Is the given YouTube URL '${videoUrl.value}' working on youtube.com?`;
            throw new Error(playerErrorMessage.value);
        case PlayerError[PlayerError.HTML5_ERROR]:
            playerErrorMessage.value = `The requested content from YouTube URL '${videoUrl.value}' cannot be played in Replayer. Try another video.`;
            throw new Error(playerErrorMessage.value);
        case PlayerError[PlayerError.NOT_FOUND]:
            playerErrorMessage.value = `The requested video from YouTube URL '${videoUrl.value}' was not found. This error occurs when a video has been removed (for any reason) or has been marked as private. Try another video.`;
            throw new Error(playerErrorMessage.value);
        case PlayerError[PlayerError.NOT_ALLOWED]:
        case PlayerError[PlayerError.NOT_ALLOWED_DISGUISE]:
            // NOTE: This error will be handeled inline
            playerErrorMessage.value = `The owner of the requested video from YouTube URL '${videoUrl.value}' does not allow it to be played in embedded players like Replayer. Try another video or watch it online on YouTube (without Replayer).`;
            console.error(playerErrorCode.value);
            break;
        default:
            playerErrorMessage.value = `YouTube IFrame player error for YouTube URL '${videoUrl.value}' with code '${event.data}'.`;
            throw new Error(playerErrorMessage.value);
    }
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

// --- visual fading ---

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
</script>
<style>
/** Make the YouTube IFrame player responsive 
* See https://webmasterin.net/youtube-videos-responsive-einbinden/
* This exact padding value is required to make the 
* video fully visible, with the aspect ratio of 16:9  
*/
.video-container.youtube .video.youtube {
    position: relative;
    padding-bottom: 56.25%;
    padding-top: 0;
    height: 0;
    overflow: hidden;
}

.video-container.youtube .video.youtube iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

/** For the edit view, limit the height */
.track.is-editable .video-container.youtube .video.youtube iframe,
.track.is-editable .video.youtube::after {
    max-height: 33vh;
}
</style>

<style scoped>
/** Match the animation duration to the fade duration
* @devdoc NOTE: The animation is defined in _replayer-video.scss
*/
.video {
    animation-duration: v-bind('fadeInDuration');
}

/** During fading, slowly adapt the brightness 
* @devdoc NOTE: The animation is defined in _replayer-video.scss
*/
.video.fade-out {
    animation-duration: v-bind('fadeOutDuration');
}
/** When paused, immediately reduce the brightness */
.video.paused {
    animation-duration: 0s;
}
</style>

<style scoped>
/** Handle pointer events directly on the the container, if paused, to avoid 
unintended manipulation of the YouTube player behind the container overlay */
.video-container.paused:after {
    pointer-events: all;
}
</style>
