<template>
    <TrackAudioPeaks
        v-experiment="experimentalShowWaveforms"
        v-if="experimentalShowWaveforms"
        :disabled="disabled"
        :mediaElement="audioElement"
        :key="props.mediaUrl"
        :showZoomView="true"
    />

    <!-- NOTE: the rendering of the AudioLevelMeter _might_ affect badly the synchronous start of the multitrack playback, 
         but only the first time after a page reload/player instantiation.
         It's currently not consistently reproducible and goes away after a subsequent sync (e.g. after pause/play) -->
    <!-- NOTE: Teleportation fails with a warning when the parent track component has not yet been mounted.
         This situation is addressed with the isParentMounted flag. It's working for loading/unloading/reloading compilation and
         adding new tracks.
         It's not working currently when the application settings change to show the meter, producing a warning. 
         A solution without a warning for this situation is not devised yet. -->
    <template v-if="showLevelMeter && isParentMounted && mediaUrl">
        <Teleport
            :to="`#track-${trackId}-HeaderLevelPlaceholder`"
            :disabled="levelMeterSizeIsLarge"
        >
            <AudioLevelMeter
                v-if="audioSource && audio.context"
                :disabled="disabled"
                :audioSource="audioSource"
                :audioContext="audio.context"
                :showText="false"
            >
            </AudioLevelMeter>
        </Teleport>
    </template>
    <slot></slot>
</template>

<script setup lang="ts">
import {
    computed,
    nextTick,
    onUnmounted,
    ref,
    watch,
    PropType,
    shallowRef,
    ShallowRef,
    onMounted,
    onBeforeUnmount,
} from 'vue';
import AudioFader from '@/code/media/AudioFader';
import { DefaultTrackVolume, PlaybackMode } from '@/store/compilation-types';
import TrackAudioPeaks from '@/components/track/TrackAudioPeaks.vue';
import AudioLevelMeter from 'vue-audio-level-meter/src/components/AudioLevelMeter.vue';
import { useAudioStore } from '@/store/audio';
import FileHandler from '@/store/filehandler';
import { useMessageStore } from '@/store/messages';
import MediaHandler from '@/code/media/MediaHandler';
import { IMediaHandler } from '@/code/media/IMediaHandler';

/** A simple vue audio player element, for a single track, with associated visuals, using an {HTMLAudioElement}.
 * @devdoc Intentionally, the memory-consuming buffers from the Web Audio API are not used.
 * This has some implications for looping and transport.
 * @remarks Repeatedly emits 'timeupdate' with the current playback time, during playback.
 * @remarks Emits 'durationChanged' with the track duration in seconds, once after
 * successful load of the metadata of the track's media file
 * @devdoc Autoplay after load is intentionally not supported, as this is of no use for the Replayer app.
 */

defineExpose({
    play,
    pause,
    seekTo,
    stop,
    togglePlayback,
    volumeDown,
    volumeUp,
    playFrom,
    pauseAndSeekTo,
    updateVolume,
});

const emit = defineEmits([
    'timeupdate',
    'durationChanged',
    'update:volume',
    'update:isTrackPlaying',
    'update:isFading',
    /** When the end of the track has been reached and playback has ended */
    'ended',
]);
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

    /** The start time of the selected cue. Used in conjunction with the playbackMode, when in cue loop mode or track play mode.
     */
    loopStart: {
        type: null as unknown as PropType<number | null>,
        default: null,
        required: false,
        validator: (v: unknown): boolean => typeof v === 'number' || v === null,
    },

    /** The end time of the selected cue. Used in conjunction with the playbackMode, when in cue loop mode.
     */
    loopEnd: {
        type: null as unknown as PropType<number | null>,
        default: null,
        required: false,
        validator: (v: unknown): boolean => typeof v === 'number' || v === null,
    },

    /** The track source description
     * @remarks This is a textual indication of the track media source. It's displayed as part of the timing display
     */
    sourceDescription: {
        type: String,
        default: '',
    },

    /** The playback mode
     * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
     */
    playbackMode: {
        type: String as () => PlaybackMode,
        required: true,
    },

    /** Whether playback is currently ongoing
     * @remarks Implements a two-way binding
     */
    isTrackPlaying: {
        type: Boolean,
        required: true,
        default: false,
    },

    /** Whether playback is currently soloed
     */
    isSoloed: {
        type: Boolean,
        required: false,
        default: false,
    },

    /** Whether playback is currently muted
     */
    isMuted: {
        type: Boolean,
        required: false,
        default: false,
    },

    /** Whether any track's playback is currently soloed
     */
    isAnySoloed: {
        type: Boolean,
        required: false,
        default: false,
    },

    /** The track volume in range of [0..1]
     * @remarks Implements a two-way binding
     */
    volume: {
        type: Number,
        required: true,
        default: DefaultTrackVolume,
    },

    /** The track id
     * @remarks Used to have a unique id on the encapsulated audio element
     */
    trackId: {
        type: String,
        required: true,
    },

    /** Whether this track is the active track
     * @remarks Determines looping behavior (only active tracks are looped)
     */
    //TODO maybe remove this, and only use the looping range?
    isActiveTrack: {
        type: Boolean,
        required: true,
    },

    /** Whether to show the component in a disabled state
     * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
     */
    disabled: Boolean,

    /** The fade-in duration in [milliseconds]. Use zero for no fading.
     */
    fadeInDuration: {
        type: Number,
        required: true,
    },

    /** The fade-out duration in [milliseconds]. Use zero for no fading.
     */
    fadeOutDuration: {
        type: Number,
        required: true,
    },

    /** Whether to apply an offset for fade-in operations, to compensate for the fading duration
     */
    applyFadeInOffset: {
        type: Boolean,
        required: false,
    },

    /** The Pre-roll duration in [seconds]. Use zero for no pre-roll.
     */
    preRollDuration: {
        type: Number,
        required: true,
    },

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

const mediaError = ref<MediaError | null>(null);

/** Flags, whether a playing request is currently outstanding. This is true after a play request was received, for as long
 * as playback has not yet started.
 * @remarks This is not equal to deferred loading with the isClickToLoadRequired flag.
 * @devdoc See https://developers.google.com/web/updates/2017/06/play-request-was-interrupted for more information
 */
const isPlayingRequestOutstanding = ref(false);

/** Writes a debug log message message for this component */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function debugLog(message: string, ...optionalParams: any[]): void {
    console.debug(
        `TrackAudioApiPlayer(${props.title})::${message}:`,
        optionalParams,
    );
}

// --- Mounted check ---

/** A fully mounted parent is required for the complete lifetime
 *  for a properly working level meter with it's teleportation */
const isParentMounted = ref(false);
onMounted(() => {
    nextTick(() => {
        // Now also the parent track is completely mounted
        isParentMounted.value = true;
    });
});
onBeforeUnmount(() => {
    isParentMounted.value = false;
});

// --- Audio Setup ---

const audio = useAudioStore();

/** Audio element to use
 * @devdoc The audio element is intentionally not added to the DOM, to keep it unaffected of unmounts during vue-router route changes.
 */
const audioElement = shallowRef(document.createElement('audio'));
audioElement.value.id = 'track-' + props.trackId;

/** The media handler to use */
const mediaHandler: IMediaHandler = new MediaHandler(
    audioElement.value,
    props.fadeInDuration,
    props.fadeOutDuration,
    props.applyFadeInOffset,
    props.volume,
);

mediaHandler.onDurationChanged.subscribe((durationSeconds: number | null) => {
    emit('durationChanged', durationSeconds);
});

mediaHandler.onCurrentTimeChanged.subscribe((currentTime: number) => {
    emit('timeupdate', currentTime);
});

mediaHandler.onEnded.subscribe(() => {
    emit('ended');
});

onMounted(() => {
    audio.addMediaHandler(mediaHandler);
});
onUnmounted(() => {
    audio.removeMediaHandler(mediaHandler);
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
    [() => props.showLevelMeter, () => props.mediaUrl],
    (
        [showLevelMeter, mediaUrl],
        [wasShowingLevelMeter /* old mediaUrl is not used */],
    ) => {
        console.debug(
            `TrackAudioApiPlayer(${props.title})::watch:mediaUrl:${props.mediaUrl} for title ${props.title}:showLevelMeter${showLevelMeter}`,
        );
        // Create the level meter and associated routing only when requested, and only for local files
        if (
            showLevelMeter &&
            mediaUrl &&
            !FileHandler.isValidHttpUrl(mediaUrl)
        ) {
            if (audioSource.value === null) {
                audioSource.value = audio.context.createMediaElementSource(
                    audioElement.value,
                );
            }
            audioSource.value.connect(audio.context.destination);
            console.debug(
                `TrackAudioApiPlayer(${props.title})::watch:mediaUrl:${props.mediaUrl} for title ${props.title}:connected`,
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

// ---  ---

/** Applies the muting state.
 * @remarks To effectively determine the applicable muting, the solo state is additionally considered.
 * @devdoc Since using the actual muted property of the audioElement causes considerable syncing issues
 * (due to unknown reasons however), the volume is controlled instead, via a fading handler feature.
 */
function applyMuting(): void {
    mediaHandler.muted =
        props.isMuted ||
        (props.isSoloed === false && props.isAnySoloed === true);
}

/** Set the track volume to a new value
 *  @remarks Limits the minimum level at -90dB Full Scale
 */
function updateVolume(volume: number): void {
    const limitedTrackVolume = mediaHandler.setMasterAudioVolume(volume);
    if (props.volume !== limitedTrackVolume) {
        emit('update:volume', limitedTrackVolume); //loop back the corrected value
    }
}

/** Updates the audio element source with the media source, if it's available
 * @devdoc To be used only privately. To change the source from the outside, use the mediaUrl property.
 */
function updateMediaSource(mediaUrl: string): void {
    debugLog(`UpdateMediaSource:${mediaUrl}`);
    mediaHandler.mediaSourceUrl = mediaUrl;
}

function seekTo(seconds: number): void {
    mediaHandler.seekTo(seconds);
}

function stop() {
    debugLog(`stop`);
    //If it's still playing (e.g. during a fade operation, still immediately stop)
    if (!mediaHandler.paused) {
        mediaHandler.stop();
    }
    mediaHandler.seekTo(0);
}

function togglePlayback() {
    debugLog(`togglePlayback`);
    if (mediaHandler.paused) {
        play();
    } else {
        mediaHandler.pause();
    }
}

/**Decreases the track audio volume level
 * @remarks Applies some limitation on the upper and lower end of the range
 */
function volumeDown() {
    debugLog(`volumeDown`, props.volume);
    updateVolume(Math.max(props.volume * 0.71, AudioFader.audioVolumeMin));
}
/**Increases the track audio volume level
 * @remarks Applies some limitation on the upper and lower end of the range
 */
function volumeUp() {
    debugLog(`volumeUp`, props.volume);
    updateVolume(
        Math.max(Math.min(props.volume * 1.41, 1), AudioFader.audioVolumeMin),
    );
}
/** Pauses playback. */
function pause(): void {
    mediaHandler.pause();
}

mediaHandler.onFadingChanged.subscribe((fading: boolean) => {
    emit('update:isFading', fading);
});

mediaHandler.onPausedChanged.subscribe((paused: boolean) => {
    emit('update:isTrackPlaying', !paused);
});

/** Pauses playback (with a subsequent seek operation) */
function pauseAndSeekTo(position: number): void {
    //TODO implement in the handler

    debugLog(`pauseAndSeekTo`);

    mediaHandler.fadeOut().then(() => {
        mediaHandler.pause();
        seekTo(position);
    });
}

/** Starts playback from the given temporal position
 * @remarks This first seeks to the position, then starts playing
 */
function playFrom(position: number): void {
    seekTo(position);
    play();
}

/** Asserts a running audio context by resuming if required (when this is the first time any track is playing)
 */
async function assertRunningAudioContext() {
    // resume audio context if required (when this is the first time any track is playing)
    if (audio.context.state === 'suspended') {
        await audio.context.resume();
    }
}

/** If not yet loaded, loads the media, then when it's playable, resolves. */
function loadAfterClick(): Promise<void> {
    debugLog(`loadAfterClick`);
    assertRunningAudioContext();

    return new Promise((resolve) => {
        //Is further loading required?
        const readyState = audioElement.value.readyState;
        if (
            readyState < HTMLMediaElement.HAVE_CURRENT_DATA &&
            //When nothing is buffered at this moment, we can assume that the phone is not currently trying to load further data,
            //most probably due to load restriction on an iOS device.
            audioElement.value &&
            audioElement.value.buffered &&
            audioElement.value.buffered.length === 0
        ) {
            debugLog(`loadAfterClick:load-with-handler`);
            //Trigger and observe further loading (only once, no event listener removal required)
            audioElement.value.addEventListener(
                'canplay',
                (event) => {
                    debugLog(`loadAfterClick:oncanplay`, event);
                    resolve(); //to play now
                },
                { once: true },
            );
            audioElement.value.load();
        } else {
            debugLog(`loadAfterClick:resolve-immediately`);
            resolve(); //immediately because there is nothing required to load
        }
    });
}
/** Starts playback at the current position
 * @remarks Asserts (and if necessary) resolves the playability of the track media
 */
async function play(): Promise<void> {
    if (mediaHandler.isClickToLoadRequired) {
        loadAfterClick().then(() => {
            debugLog(`loadAfterClick-then`);

            mediaHandler.isClickToLoadRequired = false;
            play();
        });
    } else {
        if (mediaHandler.paused) {
            if (!isPlayingRequestOutstanding.value) {
                isPlayingRequestOutstanding.value = true;

                assertRunningAudioContext();

                //Just BEFORE playback, apply the possible pre-roll
                applyPreRoll();

                audioElement.value
                    .play()
                    .catch((e) => {
                        console.error('Playback failed with message: ' + e);
                        emit('update:isTrackPlaying', false);
                    })
                    .finally(() => {
                        isPlayingRequestOutstanding.value = false;
                    });
            } else {
                console.warn(
                    'A play request is already outstanding. This request is discarded.',
                );
            }
        }
    }
}

/** Applies an offset according to required pre-roll and compensating for fade-in durations
 * @remarks At the beginning of tracks, the offset is cut off at zero.
 */
function applyPreRoll(): void {
    // The offset, in seconds
    let offset = 0;

    if (props.applyFadeInOffset && props.fadeInDuration) {
        offset = offset + props.fadeInDuration / 1000;
    }

    if (props.preRollDuration) {
        offset = offset + props.preRollDuration;
    }

    const time = audioElement.value.currentTime;
    const target = Math.max(0, time - offset);
    audioElement.value.currentTime = target;
}

//Preparing the audio element

//Register event handlers first, as per https://github.com/shaka-project/shaka-player/issues/2483#issuecomment-619587797
audioElement.value.onerror = () => {
    mediaError.value = audioElement.value?.error;
    console.debug(
        `TrackAudioApiPlayer(${props.title})::onerror:mediaError:`,
        mediaError.value,
    );

    // Use the message and add a descriptive remark.
    let errorMessage = mediaError.value?.message ?? 'Audio ERROR';
    if (mediaError.value?.code == MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED) {
        errorMessage =
            (errorMessage ? `${errorMessage}. ` : '') +
            `The media resource at '${audioElement.value.currentSrc}' is not supported. Use an URL to a resource of one of the supported media types.`;
    }

    //TODO Emit and handle an error event
    const message = useMessageStore();
    message.pushError(errorMessage);
};
audioElement.value.onabort = () => {
    debugLog(`onabort`);
};
audioElement.value.oncanplay = () => {
    debugLog(`oncanplay`);
};
audioElement.value.oncanplaythrough = () => {
    debugLog(`oncanplaythrough`);
};
audioElement.value.onloadstart = () => {
    debugLog(`onloadstart::src:${audioElement.value.src}`);
};
/** The progress event is fired periodically as the browser loads a resource.
 */
audioElement.value.onprogress = () => {
    debugLog(`onprogress`);
};
audioElement.value.onstalled = () => {
    debugLog(`onstalled`);
};
audioElement.value.onsuspend = () => {
    debugLog(`onsuspend `);
};

audioElement.value.preload = 'auto';

updateVolume(props.volume);

/** Handles the teardown of the audio graph outside the mounted lifespan.
 * @devdoc The audio element is intentionally not added to the DOM, to keep it unaffected of unmounts during vue-router route changes.
 */

onUnmounted(() => {
    debugLog(`unmounted:`, props.title);

    //properly destroy the audio element and the audio context
    mediaHandler.stop();
    audioElement.value.pause();
    audioElement.value.removeAttribute('src'); // empty resource
    audioElement.value.remove();
});

/** A simple token for the settings
 * @remarks This is only used to detect changes, to recreate the audio fader.
 */
const audioFaderSettingsToken = computed(
    () =>
        props.fadeInDuration.toString() +
        props.fadeOutDuration.toString() +
        props.applyFadeInOffset.toString(),
);

/** Watch for changes in the audio fader settings, to immediately apply them
 * @remarks Settings are not applied when currently no fader does exist
 * (e.g. because the track is not yet loaded anyway)
 */
watch(audioFaderSettingsToken, () => {
    debugLog(`audioFaderSettingsToken:${audioFaderSettingsToken.value}`);

    mediaHandler.updateFadingSettings(
        props.fadeInDuration,
        props.fadeOutDuration,
        props.applyFadeInOffset,
    );
});

/** Watch whether the media URL property changed, and then update the audio element accordingly  */
watch(
    () => props.mediaUrl,
    () => {
        debugLog(`mediaUrl:${props.mediaUrl}`);
        updateMediaSource(props.mediaUrl);
        mediaHandler.stop();
    },
    { immediate: true },
);

/** Watch the playback state, and then update the audio element accordingly  */
watch(
    () => props.isTrackPlaying,
    (isTrackPlaying) => {
        debugLog(`isTrackPlaying:${isTrackPlaying}`);
        if (isTrackPlaying) {
            play();
        } else {
            mediaHandler.pause();
        }
    },
);

/** Watch the mute/solo state, and then update the audio element accordingly  */
watch(
    () => props.isMuted,
    () => {
        applyMuting();
    },
);

/** Watch the mute/solo state, and then update the audio element accordingly  */
watch(
    () => props.isSoloed,
    () => {
        applyMuting();
    },
);

/** Watch the mute/solo state, and then update the audio element accordingly  */
watch(
    () => props.isAnySoloed,
    () => {
        applyMuting();
    },
);

/** Watch the volume prop to update according externals changes  */
watch(
    () => props.volume,
    () => {
        updateVolume(props.volume);
    },
);
</script>

<style>
/** Rotate buttons back to their upright position */
.audio-level-meter {
    transform: rotate(-90deg);
    width: 2.5em;
}
.audio-level-container {
    width: 1.25em;
    margin-left: -0.75em;
    padding-left: -0.75em;
}
</style>
