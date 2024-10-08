<template>
    <Transition name="item-expand">
        <div
            v-show="showVideo && !playerErrorCode"
            class="block video-container youtube"
            :class="{
                'is-small': smallVideo,
                'is-loading': isLoading,
                paused: isPaused,
                fading: isFading !== FadingMode.None,
                'fade-out': isFading == FadingMode.FadeOut,
                'fade-in': isFading == FadingMode.FadeIn,
                /** using an overlay is not allowed per https://developers.google.com/youtube/terms/required-minimum-functionality#overlays-and-frames */
                'use-overlay-icon': false,
            }"
            title="Click to play/pause"
            @click="
                {
                    emit('click');
                    mediaHandler?.play();
                }
            "
        >
            <div
                class="video youtube"
                :class="{
                    'is-small': smallVideo,
                    'is-loading': isLoading,
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
    </Transition>

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

    <YoutubeTextTrackController
        v-if="url && !hasNotAllowedError"
        v-model="showVideo"
        class="block"
        :track-id="trackId"
        :cues="cues"
        :title="title"
        :disabled="isLoading"
    ></YoutubeTextTrackController>
</template>

<script setup lang="ts">
import {
    PlayerError,
    type PlayerStateChangeCallback,
} from '@vue-youtube/shared';
import { usePlayer } from '@vue-youtube/core';
import type { ErrorEvent } from '@vue-youtube/shared';
import {
    type PropType,
    type Ref,
    computed,
    onBeforeUnmount,
    ref,
    watch,
} from 'vue';
import type { Player } from '@vue-youtube/shared';
import type { IMediaHandler } from '@/code/media/IMediaHandler';
import YouTubeMediaHandler from '@/code/media/YoutubeMediaHandler';
import YoutubeTextTrackController from '@/components/track/YoutubeTextTrackController.vue';
import { useAudioStore } from '@/store/audio';
import { FadingMode } from '@/code/media/IAudioFader';
import { Subscription } from 'sub-events';
import type { ICue } from '@/store/ICue';
import Constants from '@/code/media/Constants';
import { PlaybackState } from '@/code/media/PlaybackState';

/** A simple vue YouTube player, for a single track, using VueYoutube.
 * @remarks Repeatedly emits 'timeupdate' with the current playback time, during playback.
 * @remarks Emits 'durationChanged' with the track duration in seconds, once after
 * successful load of the video
 * @devdoc Autoplay is intentionally not supported, as this is of no use for the Replayer app.
 */

const emit = defineEmits(['click']);

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
    cues: {
        type: Array as PropType<Array<ICue>>,
        required: true,
    },

    /** Whether to show the component in a disabled state
     * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
     */
    disabled: Boolean,

    /** The full YouTube video URL
     */
    url: {
        type: String,
        default: '',
        required: true,
    },

    /** The start time
     * @remark If set, the initial playback position is set to this time, in [seconds], after the resource can be played.
     */
    start: {
        type: null as unknown as PropType<number | null>,
        default: null,
        required: false,
    },

    /** Whether to show a height-limited video canvas
     */
    smallVideo: {
        type: Boolean,
        default: true,
        required: false,
    },
});

console.debug(
    `TrackYouTubeElement:setup:using url '${props.url}' for trackId '${props.trackId}' at start '${props.start}'`,
);

// --- visibility ---

const showVideo = ref(true);

// --- player setup ---

// Use a template ref to reference the target element
const youtubePlayerElement = ref();

/** Gets the YouTube unique video id
 * @remarks This id is extracted from the URL
 */
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

const isLoading = computed(() => {
    return videoId.value && mediaHandler.value == null;
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
} = usePlayer(videoId, youtubePlayerElement, {
    /** See https://developers.google.com/youtube/player_parameters#Parameters */
    playerVars: {
        autoplay: 0,
        disablekb: 1 /* replayer handles keyboard events on it's own*/,
        enablejsapi: 1,
        color: 'white',
        controls: 1,
        // Setting the playlist to the one video enables looping the single video itself
        // See https://stackoverflow.com/a/25781957/79485
        playlist: videoId.value,
        // MUST be an integer number, otherwise the video starts from the beginning
        start: props.start ? Math.round(props.start) : undefined,
        rel: 0,
    },
    cookie: true,
});

/// --- create handler (when ready) ---

const mediaHandler: Ref<IMediaHandler | null> = ref(null);

const audio = useAudioStore();

onReady(() => {
    if (instance.value) {
        mediaHandler.value = createAndProvideHandler(
            onStateChange,
            instance.value,
        );
    }
});

/** Create a new media handler for this YouTube video */
function createAndProvideHandler(
    onStateChange: (...cb: PlayerStateChangeCallback[]) => void,
    player: Player,
): IMediaHandler {
    const handler = new YouTubeMediaHandler(
        onStateChange,
        player,
        Constants.MEDIATRACK_ID_PREFIX + props.trackId,
    ) as IMediaHandler;

    audio.addMediaHandler(handler);
    console.log('TrackYouTubeElement:ready');

    // Internally handle some events of our own
    onFadingChangedSubsription =
        handler.fader.onFadingChanged.subscribeImmediate(
            (fading: FadingMode) => {
                isFading.value = fading;
            },
        );

    onPlaybackStateChangedSubsription =
        handler.onPlaybackStateChanged.subscribeImmediate(
            (state: PlaybackState) => {
                isPaused.value = state !== PlaybackState.Playing;
            },
        );

    return handler;
}

const isPaused = ref(true);

let onPlaybackStateChangedSubsription: Subscription;

const isFading = ref(FadingMode.None);

let onFadingChangedSubsription: Subscription;

/** Teardown of the YouTube player and handler.
 */
onBeforeUnmount(() => {
    console.debug('TrackYouTubeElement:onBeforeUnmount');
    destroyHandler();
});

/** Properly destroy the handler, and abandon the YouTube player, including it's handlers */
function destroyHandler(): void {
    // cancel the internal event handlers
    onFadingChangedSubsription?.cancel();
    onPlaybackStateChangedSubsription?.cancel();

    if (mediaHandler.value) {
        audio.removeMediaHandler(mediaHandler.value);

        mediaHandler.value.destroy();
        mediaHandler.value = null;
    }
    try {
        // stopVideo may fail with "not a function" when this method is
        // called very early in the loading process
        instance.value?.stopVideo();
    } catch {
        console.warn('YouTube stopVideo did not execute as espected.');
    } finally {
        instance.value?.destroy();
        instance.value = undefined;

        console.log('TrackYouTubeElement:destroyed');
    }
}

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

// --- error handling ---

const playerErrorCode: Ref<PlayerError | null> = ref(null);
const playerErrorMessage: Ref<string | null> = ref(null);

const hasNotAllowedError = computed(() => {
    return (
        playerErrorCode.value == PlayerError.NOT_ALLOWED ||
        playerErrorCode.value == PlayerError.NOT_ALLOWED_DISGUISE
    );
});

/** Handle YouTube IFrame player errors
 * See https://developers.google.com/youtube/iframe_api_reference#Events for details
 */
onError((event: ErrorEvent) => {
    const error = Number(event.data) as PlayerError;
    playerErrorCode.value = error;
    switch (error) {
        case null:
            break;
        case PlayerError.INVALID_PARAMETER:
            playerErrorMessage.value = `The request contains an invalid parameter value. Is the given YouTube URL '${videoUrl.value}' working on youtube.com?`;
            throw new Error(playerErrorMessage.value);
        case PlayerError.HTML5_ERROR:
            playerErrorMessage.value = `The requested content from YouTube URL '${videoUrl.value}' cannot be played in Replayer. Try another video.`;
            throw new Error(playerErrorMessage.value);
        case PlayerError.NOT_FOUND:
            playerErrorMessage.value = `The requested video from YouTube URL '${videoUrl.value}' was not found. This error occurs when a video has been removed (for any reason) or has been marked as private. Try another video.`;
            throw new Error(playerErrorMessage.value);
        case PlayerError.NOT_ALLOWED:
        case PlayerError.NOT_ALLOWED_DISGUISE:
            // NOTE: This error will be handeled inline
            playerErrorMessage.value = `The owner of the requested video from YouTube URL '${videoUrl.value}' does not allow it to be played in embedded players like Replayer. Try another video or watch it online on YouTube (without Replayer).`;
            console.error(playerErrorMessage.value);
            break;
        default:
            playerErrorMessage.value = `YouTube IFrame player error for YouTube URL '${videoUrl.value}' with code '${event.data}'.`;
            throw new Error(playerErrorMessage.value);
    }
});

/** Clear errors for a new video */
watch(
    videoId,
    () => {
        playerErrorCode.value = null;
        playerErrorMessage.value = null;
    },
    { immediate: true },
);
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

/** For the small video view (on larger screens), limit the height */
@media screen and (min-width: 654px) {
    /** For the small video view, limit the height */
    .video-container.youtube .video.youtube.is-small iframe,
    .video.youtube.is-small::after {
        max-height: 33vh;
    }

    .video-container.youtube .video.youtube.is-small {
        padding-bottom: 33vh;
    }
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
