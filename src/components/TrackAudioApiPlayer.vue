<template>
    <Experimental>
        <TrackAudioPeaks
            v-if="audioElement && mediaUrl && hasLoadedData"
            :mediaElement="audioElement"
            :key="mediaUrl"
            :showZoomView="isEditable"
        />
    </Experimental>
    <slot></slot>
</template>

<script lang="ts">
import { MutationTypes } from '@/store/mutation-types';
import { defineComponent, PropType } from 'vue';
import AudioFader from '@/code/audio/AudioFader';
import { settingsMixin } from '@/mixins/settingsMixin';
import {
    DefaultTrackVolume,
    PlaybackMode,
    TrackDisplayMode,
} from '@/store/compilation-types';
import TrackAudioPeaks from '@/components/TrackAudioPeaks.vue';

/** A safety margin for detecting the end of a track during playback */
const trackDurationSafetyMarginSeconds = 0.3;

/** A simple vue audio player, for a single track, using the Audio Element and it's API.
 * @devdoc Intentionally, the memory-consuming buffers from the Web Audio API are not used. This has some implications for looping.
 * @devdoc Internally maintains it's state, updating the enclosed audio element accordingly.
 * @remarks Internally handles cue loops, when in the LoopCue playback mode.
 * @remarks Repeatedly emits 'timeupdate' with the current playback time, during playing
 * @remarks Emits 'durationChanged' with the track duration in seconds, once after successful load of the metadata of the track's media file
 * @devdoc Autoplay after load is intentionally not supported, as this is of no use for the Replayer app.
 */
export default defineComponent({
    name: 'TrackAudioApiPlayer',
    components: {
        TrackAudioPeaks,
    },
    mixins: [settingsMixin],
    emits: [
        'timeupdate',
        'durationChanged',
        'update:playbackMode',
        'update:volume',
        'update:isPlaying',
        'update:isFading',
        /** When the end of the track has been reached and playback has ended */
        'ended',
    ],
    props: {
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
         * @devdoc This is used to emulate the buffer looping for the enclosed audio element.
         * See https://www.w3.org/TR/webaudio/#looping-AudioBufferSourceNode for information about looping.
         * @remarks This is used as the start time for any repetition, either from looping or when played to end.
         */
        loopStart: {
            type: null as unknown as PropType<number | null>,
            default: null,
            required: false,
            validator: (v: unknown): boolean =>
                typeof v === 'number' || v === null,
        },
        /** The end time of the selected cue. Used in conjunction with the playbackMode, when in cue loop mode.
         * @devdoc This is used to emulate the buffer looping for the enclosed audio element.
         * See https://www.w3.org/TR/webaudio/#looping-AudioBufferSourceNode for information about looping.
         * @remarks This is only used when the playback mode is set to "repeat-cue".
         */
        loopEnd: {
            type: null as unknown as PropType<number | null>,
            default: null,
            required: false,
            validator: (v: unknown): boolean =>
                typeof v === 'number' || v === null,
        },
        /** The track source description
         * @remarks This is a textual indication of the track media source. It's displayed as part of the timing display
         */
        sourceDescription: {
            type: String,
            default: '',
        },
        /** The display mode of this track.
         * @devdoc Allows to reuse this component for more than one DisplayMode.
         * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        displayMode: {
            type: String as () => TrackDisplayMode,
            default: TrackDisplayMode.Play,
        },
        /** The playback mode
         * @remarks Implements a two-way binding
         * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        playbackMode: {
            type: String as () => PlaybackMode,
            required: true,
        },

        /** Whether playback is currently ongoing
         * @remarks Implements a two-way binding
         */
        isPlaying: {
            type: Boolean,
            required: true,
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
    },
    data() {
        return {
            /** The playback progress in the current track, in [seconds] */
            //TODO later provide the currentSeconds from the track (at least initially), similar to the playback mode
            //supporting storage and retrieval with the track persistence
            currentSeconds: null as number | null,
            /** Gets the duration of the current track, in [seconds]
             * @remarks This is only available after successful load of the media metadata.
             * Could be NaN or infinity, depending on the source
             */
            durationSeconds: null as number | null,
            isMuted: false,
            /** Whether the media data has loaded (at least enough to start playback)
             * @remarks This implies that metadata also has been loaded already
             * @devdoc see HAVE_CURRENT_DATA at https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState#examples
             */
            hasLoadedData: false,
            /** Whether the media metadata has loaded. Duration is available now.
             * @devdoc see HAVE_METADATA at https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState#examples
             */
            hasLoadedMetadata: false,
            mediaError: null as MediaError | null,
            /** Whether the audio is currently fading */
            isFading: false,
            /** Whether playback is currently ongoing */
            playing: false,
            audioElement: document.createElement('audio'),
            /** Flags, whether a playing request is currently outstanding. This is true after a play request was received, for as long
             * as playback has not yet started.
             * @remarks This is not equal to deferred loading with the isClickToLoadRequired flag.
             * @devdoc See https://developers.google.com/web/updates/2017/06/play-request-was-interrupted for more information
             */
            isPlayingRequestOutstanding: false,

            /** Flags, whether deferred loading (until a user play click event is handled)
             * is required to further load the track media file data. The flag may be set once after the metadata was successfully loaded.
             * @remarks When true, handling of a subsequent play action must first invoke a user-triggered load operation.
             * @remarks This specific handling is currently required on (some?) iOS devices,
             * because they only load data upon explicit user interaction.
             */
            isClickToLoadRequired: false,

            /** The fader to use */
            fader: undefined as unknown as AudioFader,
        };
    },
    /** Handles the setup of the audio graph outside the mounted lifespan.
     * @devdoc The audio element is intentionally not added to the DOM, to keep it unaffected of unmounts during vue-router route changes.
     */
    created() {
        console.debug(
            `TrackAudioApiPlayer(${this.title})::created:mediaUrl:${this.mediaUrl} for title ${this.title}`,
        );

        //Preparing the audio element

        //Register event handlers first, as per https://github.com/shaka-project/shaka-player/issues/2483#issuecomment-619587797
        this.audioElement.ontimeupdate = this.updateTime;
        this.audioElement.onloadeddata = this.handleLoadedData;
        this.audioElement.onloadedmetadata = this.handleLoadedMetadata;
        this.audioElement.onerror = () => {
            this.mediaError = this.audioElement?.error;
            console.debug(
                `TrackAudioApiPlayer(${this.title})::onerror:mediaError:`,
                this.mediaError,
            );

            // Use the message and add a descriptive remark.
            let message = this.mediaError?.message;
            if (
                this.mediaError?.code == MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED
            ) {
                message =
                    (message ? message + '. ' : '') +
                    'The associated resource is not supported. Use an URL to a resource of one of the supported media types.';
            }

            this.$store.commit(
                MutationTypes.PUSH_ERROR,
                `Error while retrieving media source for title '${this.title}'. Message: '${message}'`,
            );
        };
        this.audioElement.onabort = () => {
            this.debugLog(`onabort`);
        };
        this.audioElement.oncanplay = (event) => {
            this.debugLog(`oncanplay`, event);
        };
        this.audioElement.oncanplaythrough = (event) => {
            this.debugLog(`oncanplaythrough`, event);
        };
        this.audioElement.onloadstart = (event) => {
            this.debugLog(`onloadstart`, event);
        };
        /** The progress event is fired periodically as the browser loads a resource.
         */
        this.audioElement.onprogress = (event) => {
            this.debugLog(`onprogress`, event);
        };
        this.audioElement.onstalled = (event) => {
            this.debugLog(`onstalled`, event);
        };
        this.audioElement.onsuspend = (event) => {
            this.debugLog(`onsuspend `, event);
        };
        this.audioElement.onended = (event) => {
            this.debugLog(`onended `, event);
            this.$emit('update:isPlaying', false);
            this.$emit('ended');

            //Handle the track play mode
            if (this.playbackMode === PlaybackMode.PlayTrack) {
                if (this.loopStart) {
                    //Back to start (keep pausing)
                    this.seekTo(this.loopStart);
                }
            }
        };
        this.audioElement.ondurationchange = (event) => {
            this.debugLog(`ondurationchange `, event);
            //Unfortunately, the src element in the event is null, thus directly use the audioElement here.
            this.updateDuration(this.audioElement.duration);
        };
        this.audioElement.onpause = () => {
            this.debugLog(`onpause`);
            this.playing = false;
            this.$emit('update:isPlaying', false);
        };
        this.audioElement.onplay = () => {
            this.debugLog(`onplay`);

            this.playing = true;

            //NOTE: Having the fade-in operation to start here, instead of after the thenable play action
            //ensures, that a fade operation is applied without any audible delay.
            this.debugLog('Playback started');
            this.$emit('update:isPlaying', true);
            this.isFading = true;
            this.$emit('update:isFading', true);
            this.fader
                .fadeIn()
                .catch((message) => console.log(message))
                .then(() => {
                    this.isFading = false;
                    this.$emit('update:isFading', false);
                });
        };

        this.updateVolume(this.volume);

        this.fader = new AudioFader(
            this.audioElement,
            this.getSettings.fadeInDuration,
            this.getSettings.fadeOutDuration,
            this.getSettings.applyFadeInOffset,
            this.volume,
        );

        //NOTE: Not using CORS, property crossOrigin is not set, not asking for permission

        //Last, update the source, if already available
        this.audioElement.preload = 'auto';
        this.updateMediaSource(this.mediaUrl);
    },
    /** Handles the teardown of the audio graph outside the mounted lifespan.
     * @devdoc The audio element is intentionally not added to the DOM, to keep it unaffected of unmounts during vue-router route changes.
     */
    unmounted() {
        this.debugLog(`unmounted:`, this.title);

        //properly destroy the audio element and the audio context
        this.fader.cancel();
        this.playing = false;
        this.audioElement.pause();
        this.audioElement.removeAttribute('src'); // empty resource
        this.audioElement.remove();
    },

    computed: {
        /** Whether this component shows editable inputs for the contained data
         * @devdoc Allows to reuse this component for more than one display mode.
         */
        isEditable(): boolean {
            return this.displayMode === TrackDisplayMode.Edit;
        },

        muted(): boolean {
            return this.isMuted;
        },
        /** A simple token for the settings
         * @remarks This is only used to detect changes, to recreate the audio fader.
         */
        audioFaderSettingsToken(): string {
            return (
                this.settings.fadeInDuration?.toString() +
                this.settings.fadeOutDuration?.toString() +
                this.settings.applyFadeInOffset?.toString()
            );
        },
    },

    watch: {
        /** Watch for changes in the audio fader settings, to immediately apply them
         * @remarks Settings are not applied when currently no fader does exist
         * (e.g. because the track is not yet loaded anyway)
         */
        audioFaderSettingsToken(): void {
            if (this.fader) {
                this.debugLog(
                    `audioFaderSettingsToken:${this.audioFaderSettingsToken}`,
                );

                const newSettings = this.getSettings;
                this.fader.updateSettings(
                    newSettings.fadeInDuration,
                    newSettings.fadeOutDuration,
                    newSettings.applyFadeInOffset,
                );
            }
        },
        /** Watch whether the media URL property changed, and then update the audio element accordingly  */
        mediaUrl(mediaUrl: string /*, oldMediaUrl: string*/): void {
            /*this.debugLog(`mediaUrl:${mediaUrl};oldMediaUrl:${mediaUrl}`);*/

            //if (mediaUrl !== oldMediaUrl) {
            this.debugLog(`mediaUrl:${mediaUrl}`);
            this.updateMediaSource(mediaUrl);
            this.fader.cancel();
            //}
        },
        /** Watch the playback state, and then update the audio element accordingly  */
        isPlaying(value: boolean): void {
            this.debugLog(`isPlaying:${value}`);
            if (value) {
                this.play();
            } else {
                this.pause();
            }
        },
        /** Watch the volume prop to update according externals changes  */
        volume(): void {
            this.updateVolume(this.volume);
        },

        /** Watch the playback mode and update the loop property accordingly
         * @remarks This handles the PlaybackMode.LoopTrack mode, but not other loop modes.
         * @devdoc Handle the value also immediately at mount time
         */
        playbackMode: {
            handler(playbackMode: PlaybackMode) {
                this.debugLog(`watch playbackMode:${playbackMode}`);
                this.audioElement.loop =
                    playbackMode === PlaybackMode.LoopTrack;
            },
            immediate: true,
        },
    },
    methods: {
        /** Set the track volume to a new value
         *  @remarks Limits the minimum level at -90dB Full Scale
         */
        updateVolume(volume: number): void {
            //Limit the minimum
            const limitedTrackVolume = Math.max(
                volume,
                AudioFader.audioVolumeMin,
            );
            this.debugLog(`limitedTrackVolume:${limitedTrackVolume}`);
            if (this.fader) {
                this.fader.setMasterAudioVolume(limitedTrackVolume);
            }
            if (this.volume !== limitedTrackVolume) {
                this.$emit('update:volume', limitedTrackVolume); //loop back the corrected value
            }
        },

        /** Writes a debug log message message for this component */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        debugLog(message: string, ...optionalParams: any[]): void {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::${message}:`,
                optionalParams,
            );
        },
        /** Updates the audio element source with the media source, if it's available
         * @devdoc To be used only privately. To change the source from the outside, use the mediaUrl property.
         */
        updateMediaSource(mediaUrl: string): void {
            this.debugLog(`UpdateMediaSource:${mediaUrl}`);
            //Only update the audio element, when a source is actually available
            //Otherwise the element throws an avoidable error
            if (mediaUrl) {
                //NOTE: Just changing the .src property does not work when the track is currently playing
                //(observed on Ubuntu Google Chrome)
                //An error is only thrown only after the playback ends.
                //Thus, additional handling is necessary
                const isCurrentlyPlaying = this.playing;
                const lastPosition = this.audioElement.currentTime;
                this.audioElement.pause();

                //Switch the source now, after pause
                this.audioElement.src = mediaUrl;

                //NOTE: This method assumes, that the new media for this is of (roghly) the same
                //lenght, just replacing the voice/instrument in the piece.
                //Thus, the playback position is maintained and not reset,
                //and the playing state is set again after the switch.
                //Otherwise the user will need to restart playback from
                //new position anyway
                this.audioElement.currentTime = lastPosition;
                if (isCurrentlyPlaying) {
                    this.audioElement.play();
                }
            }
        },
        handleLoadedMetadata(): void {
            const readyState = this.audioElement?.readyState;
            this.debugLog(`handleLoadedMetadata:readyState:${readyState}`);

            this.handleReadyState(readyState);
        },
        /** Handles the load event of the audio element
         * @remarks Since loading is usually in progress now, this also resets the isClickToLoadRequired flag, unless
         * it is specifically detected, that further loading needs to be triggered
         */
        handleLoadedData(): void {
            this.isClickToLoadRequired = false;
            const readyState = this.audioElement?.readyState;

            this.debugLog(`handleLoadedData:readyState:${readyState}`);
            this.handleReadyState(readyState);
        },

        /** If changed, updates the internal duration and emits the durationChanged event
         * @param {number} duration - could be NaN or infinity, depending on the source
         */
        updateDuration(duration: number): void {
            if (this.durationSeconds !== duration) {
                this.durationSeconds = duration;
                this.$emit('durationChanged', this.durationSeconds);
            }
        },

        /** Handles the current ready state of the audio element's media, with regard to playability
         * @remarks Decides, whether deferred loading is required.
         */
        handleReadyState(readyState: number) {
            //Enough of the media resource has been retrieved that the metadata attributes are initialized?
            if (readyState >= HTMLMediaElement.HAVE_METADATA) {
                if (!this.hasLoadedMetadata && !this.hasLoadedData) {
                    this.hasLoadedMetadata = true;
                    this.hasLoadedData = true;
                    this.updateDuration(this.audioElement.duration);

                    //Apply the currently known position to the player. It could be non-zero already.
                    this.seekTo(this.currentSeconds ?? 0);
                }
            }

            //Special flag handling, when not  automatically loading further now
            this.debugLog(
                `handleReadyState:buffered:`,
                this.audioElement.buffered,
            );
            this.debugLog(
                `handleReadyState:networkState:${this.audioElement.networkState}`,
            );

            //When nothing is buffered at this moment, we can assume that the phone is not currently trying to load further data,
            //most probably due to load restriction on an iOS device using Safari.
            //Works on
            //- iPhone 13/Safari
            //- iPad Pro 12.9 2021/Safari (with audio from URL)
            //NOTE: This solution however seems not to work on:
            //- iPad 9th/Safari, because the buffered lenght is 1, but the sound will only play on 2nd click.
            if (this.audioElement.buffered.length === 0) {
                //The isClickToLoadRequired flag defers further media loading until the next user's explicit play request
                this.isClickToLoadRequired = true;
            }
        },
        /** Toggles the muted state of this track
         * @remarks If the track is not loaded, does nothing.
         * @param mute - If null or not given, toggles the muted state. When given, sets to the specified state.
         */
        toggleMute(mute: boolean | null = null): boolean {
            if (mute === null) {
                this.isMuted = !this.isMuted;
                this.audioElement.muted = this.isMuted;
            } else {
                if (this.isMuted != mute) {
                    this.isMuted = mute;
                    this.audioElement.muted = this.isMuted;
                }
            }
            return this.isMuted;
        },
        seekToSeconds(seconds: number) {
            this.debugLog(`seekToSeconds`, seconds);
            if (!this.hasLoadedMetadata) return;

            this.audioElement.currentTime = seconds;
        },
        stop() {
            this.debugLog(`stop`);
            //If it's still playing (e.g. during a fade operation, stil immediately stop)
            if (!this.audioElement.paused) {
                this.audioElement.pause();
                this.fader.cancel();
                this.fader.reset();
                this.$emit('update:isPlaying', false);
            }
            //no fading at stop
            this.isFading = false;
            this.$emit('update:isFading', false);

            this.audioElement.currentTime = 0;
            this.$store.commit(MutationTypes.UPDATE_SELECTED_CUE_ID, undefined);
        },
        togglePlayback() {
            this.debugLog(`togglePlayback`);
            if (this.playing) {
                this.pause();
            } else {
                this.play();
            }
        },
        /** Rewinds 1 second */
        rewindOneSecond() {
            this.debugLog(`rewindOneSecond`);
            const time = this.audioElement.currentTime;
            this.audioElement.currentTime = time - 1;
        },
        /** Forwards 1 second */
        forwardOneSecond() {
            this.debugLog(`forwardOneSecond`);
            const time = this.audioElement.currentTime;
            this.audioElement.currentTime = time + 1;
        },
        /**Decreases the track audio volume level
         * @remarks Applies some limitation on the upper and lower end of the range
         */
        volumeDown() {
            this.debugLog(`volumeDown`, this.volume);
            this.updateVolume(
                Math.max(this.volume * 0.71, AudioFader.audioVolumeMin),
            );
        },
        /**Increases the track audio volume level
         * @remarks Applies some limitation on the upper and lower end of the range
         */
        volumeUp() {
            this.debugLog(`volumeUp`, this.volume);
            this.updateVolume(
                Math.max(
                    Math.min(this.volume * 1.41, 1),
                    AudioFader.audioVolumeMin,
                ),
            );
        },
        /** Pauses playback */
        pause(): void {
            this.debugLog(`pause`);
            if (this.playing) {
                this.isFading = true;
                this.$emit('update:isFading', true);

                this.fader
                    .fadeOut()
                    .catch((message) => console.log(message))
                    .then(() => {
                        this.audioElement.pause();
                        this.isFading = false;
                        this.$emit('update:isPlaying', false);
                        this.$emit('update:isFading', false);
                    });
            }
        },
        /** Pauses playback (with a subsequent seek operation) */
        pauseAndSeekTo(position: number): void {
            this.debugLog(`pauseAndSeekTo`);

            this.isFading = true;
            this.$emit('update:isFading', true);

            this.fader.fadeOut().then(() => {
                this.audioElement.pause();
                this.isFading = false;
                this.$emit('update:isFading', false);
                this.$emit('update:isPlaying', false);
                this.seekTo(position);
            });
        },
        /** Updates the current seconds display and emits an event with the temporal position of the player
         * @devdoc This must get only privately called from the audio player
         * @devdoc This is known to result in setTimeout violations on slower systems
         */
        updateTime(/*event: Event*/) {
            this.currentSeconds = this.audioElement?.currentTime;
            this.$emit('timeupdate', this.currentSeconds);

            this.handleCueLoop();
        },
        /** Handles looping for a single cue, if requested
         * @remarks Cue looping is solved here by observing and handling the recurring time updates.
         * NOTE: Partial looping is not natively supported with the used HTMLAudioElement.
         * For memory consumption reasons, a buffered audio source with the Web Audio API is not used,
         * which however would natively support partial loops.
         * @remarks Track looping is handled elsewhere.
         */
        handleCueLoop(): void {
            switch (this.playbackMode) {
                case PlaybackMode.LoopCue: {
                    //Detect, with a safety margin, whether the possible loop is at track end
                    if (
                        this.currentSeconds !== null &&
                        this.durationSeconds !== null &&
                        Number.isFinite(this.currentSeconds) &&
                        Number.isFinite(this.durationSeconds)
                    ) {
                        const isAtTrackEnd =
                            this.currentSeconds >=
                            this.durationSeconds -
                                trackDurationSafetyMarginSeconds;

                        //Is a loop due?
                        if (
                            this.loopStart !== null &&
                            this.loopEnd !== null &&
                            Number.isFinite(this.loopStart) &&
                            Number.isFinite(this.loopEnd) &&
                            (this.currentSeconds >= this.loopEnd ||
                                isAtTrackEnd)
                        ) {
                            //Back to loop start
                            this.seekTo(this.loopStart);

                            if (isAtTrackEnd) {
                                this.debugLog(
                                    `loopEnd:${this.loopEnd};durationSeconds:${this.durationSeconds}`,
                                );
                                //At the end of the track, a seek operation alone would not be enough to continue the loop
                                //if playback already has ended (when the safety margin from above was too small)
                                this.$nextTick(() => {
                                    //Directly issue the play command, without any safety net
                                    //(should be working, since play was successful already)
                                    //This handling here has the disadvantage, that a fading operation does take place however,
                                    //if configured and the safety margin was too short.
                                    this.audioElement.play();
                                });
                            }
                        }
                    }
                    break;
                }
                case PlaybackMode.PlayCue: {
                    //Execute once, when past the end and not yet fading (avoid repeated calls)
                    if (
                        this.loopStart !== null &&
                        this.loopEnd !== null &&
                        this.currentSeconds !== null &&
                        Number.isFinite(this.loopStart) &&
                        Number.isFinite(this.loopEnd) &&
                        Number.isFinite(this.currentSeconds) &&
                        this.currentSeconds >= this.loopEnd &&
                        this.isFading == false
                    ) {
                        this.pauseAndSeekTo(this.loopStart);
                    }
                    break;
                }
            }
        },

        /** Starts playback from the given temporal position
         * @remarks This first seeks to the position, then starts playing
         */
        playFrom(position: number): void {
            this.seekTo(position);
            this.play();
        },

        /** If not yet loaded, loads the media, then when it's playable, resolves. */
        loadAfterClick(): Promise<void> {
            this.debugLog(`loadAfterClick`);
            return new Promise((resolve) => {
                //Is further loading required?
                const readyState = this.audioElement.readyState;
                if (
                    readyState < HTMLMediaElement.HAVE_CURRENT_DATA &&
                    //When nothing is buffered at this moment, we can assume that the phone is not currently trying to load further data,
                    //most probably due to load restriction on an iOS device.
                    this.audioElement &&
                    this.audioElement.buffered &&
                    this.audioElement.buffered.length === 0
                ) {
                    this.debugLog(`loadAfterClick:load-with-handler`);
                    //Trigger and observe further loading (only once, no event listener removal required)
                    this.audioElement.addEventListener(
                        'canplay',
                        (event) => {
                            this.debugLog(`loadAfterClick:oncanplay`, event);
                            resolve(); //to play now
                        },
                        { once: true },
                    );
                    this.audioElement.load();
                } else {
                    this.debugLog(`loadAfterClick:resolve-immediately`);
                    resolve(); //immediately because there is nothing required to load
                }
            });
        },
        /** Starts playback at the current position
         * @remarks Asserts (and if necessary) resolves the playability of the track media
         */
        play(): void {
            if (this.isClickToLoadRequired) {
                this.loadAfterClick().then(() => {
                    this.debugLog(`loadAfterClick-then`);

                    this.isClickToLoadRequired = false;
                    this.play();
                });
            } else {
                if (!this.playing) {
                    if (!this.isPlayingRequestOutstanding) {
                        this.isPlayingRequestOutstanding = true;

                        //Just BEFORE playback, apply the possible pre-play transport
                        if (
                            this.settings.applyFadeInOffset &&
                            this.settings.fadeInDuration
                        ) {
                            this.applyPreFadeInOffset();
                        }

                        this.audioElement
                            .play()
                            .catch((e) => {
                                console.error(
                                    'Playback failed with message: ' + e,
                                );
                                this.$emit('update:isPlaying', false);
                            })
                            .finally(() => {
                                this.isPlayingRequestOutstanding = false;
                            });
                    } else {
                        console.warn(
                            'A play request is already outstanding. This request is discarded.',
                        );
                    }
                }
            }
        },

        /** Applies an offset to compensate fade-in durations
         * @remarks At the beginning of tracks, the offset is cut off at zero.
         */
        applyPreFadeInOffset(): void {
            const time = this.audioElement.currentTime;
            const offset = this.settings.fadeInDuration / 1000;
            const target = Math.max(0, time - offset);
            this.audioElement.currentTime = target;
        },

        /** Transports (seeks) the playback to the given temporal position */
        seekTo(position: number): void {
            this.debugLog(`seekTo:position`, position);
            this.audioElement.currentTime = position;
        },
    },
});
</script>
