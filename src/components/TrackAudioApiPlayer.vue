<template>
    <CueTrigger
        v-if="isEditable"
        :title="title"
        :loaded="this.hasLoadedData"
        :isFading="this.isFading"
        :playing="this.playing"
        @pause="pause"
        @play="play"
        :isPlayingRequestOutstanding="this.isPlayingRequestOutstanding"
        v-model:currentSeconds="this.currentSeconds"
        @seek="seekToSeconds"
        @newCueTriggered="this.$emit('newCueTriggered')"
        :durationSeconds="this.durationSeconds"
        :sourceDescription="this.sourceDescription"
        :error="this.mediaError"
    />
    <PlayerChrome
        v-else
        :title="title"
        :loaded="this.hasLoadedData"
        :isFading="this.isFading"
        :playing="this.playing"
        @stop="stop"
        @pause="pause"
        @play="play"
        :isPlayingRequestOutstanding="this.isPlayingRequestOutstanding"
        v-model:currentSeconds="this.currentSeconds"
        v-model:trackVolume="this.trackVolume"
        v-model:playbackMode="this.playbackMode"
        :muted="this.muted"
        @mute="mute"
        @seek="seekToSeconds"
        :durationSeconds="this.durationSeconds"
        @download="this.download"
        :sourceDescription="this.sourceDescription"
        :error="this.mediaError"
    />
</template>

<script lang="ts">
import { MutationTypes } from '@/store/mutation-types';
import { defineComponent } from 'vue';
import PlayerChrome from '@/components/PlayerChrome.vue';
import CueTrigger from '@/components/CueTrigger.vue';
import AudioFader from '@/code/audio/AudioFader';
import { settingsMixin } from '@/mixins/settingsMixin';
import { PlaybackMode } from '@/store/compilation-types';

/** A simple vue audio player, for a single track, using the Web Audio API.
 * @devdoc Internally maintains it's state, updating the enclosed audio element accordingly.
 * @remarks Repeatedly emits 'timeupdate' with the current playback time, during playing
 * @remarks Emits 'trackLoaded' with the track duration in seconds, once after successful load of the metadata of the track's media file
 * @remarks Emits 'trackPlaying' when the track is playing
 * @devdoc The 'newCueTriggered' is just passed up
 * @devdoc Autoplay after load is intentionally not supported, as this is of no use for the Replayer app.
 */
export default defineComponent({
    name: 'TrackAudioApiPlayer',
    components: { PlayerChrome, CueTrigger },
    mixins: [settingsMixin],
    emits: [
        'timeupdate',
        'trackLoaded',
        'trackPlaying',
        'newCueTriggered',
        /* Do not add newCueTriggered here, to let it just get passed up */
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
        /** Whether this component shows editable inputs for the contained data
         * @devdoc Allows to reuse this component for more than one DisplayMode.
         */
        isEditable: {
            type: Boolean,
            default: false,
        },
        /** The start of the loop, when in cue loop mode.
         * @remarks This is used to emulate the buffer looping for the enclosed audio element.
         * See https://www.w3.org/TR/webaudio/#looping-AudioBufferSourceNode for information about looping.
         * @remarks This is only applied when the playback mode is set to "repeat-cue".
         */
        loopStart: {
            type: Number,
            default: undefined,
            required: false,
        },
        /** The end of the loop, when in cue loop mode.
         * @remarks This is used to emulate the buffer looping for the enclosed audio element.
         * See https://www.w3.org/TR/webaudio/#looping-AudioBufferSourceNode for information about looping.
         * @remarks This is only applied when the playback mode is set to "repeat-cue".
         */
        loopEnd: {
            type: Number,
            default: undefined,
            required: false,
        },
        /** The track source description
         * @remarks This is a textual indication of the track media source. It's displayed as part of the timing display
         */
        sourceDescription: {
            type: String,
            default: '',
        },
    },
    data: () => ({
        /** The playback progress in the current track, in [seconds] */
        currentSeconds: 0,
        /** Gets the duration of the current track, in [seconds]
         * @remarks This is only available after successful load of the media metadata
         */
        durationSeconds: 0,
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
        playbackMode: PlaybackMode.PlayTrack, //by default
        playing: false,
        showVolume: false,
        /** Default value, user may change later */
        trackVolume: 0.5,
        //TODO later remove: The audio context is currently not used
        /** The audio context to use
         */
        // audioContext: new (window.AudioContext /*Default*/ ||
        //     (window as any).webkitAudioContext)(
        //     /*Safari and old versions of Chrome*/ {
        //         latencyHint: 'interactive',
        //     },
        // ),
        audioElement: document.createElement('audio'),
        /** Flags, whether a playing request is currently outstanding. This is true after a play request was received, for as long
         * as playback has not yet started.
         * @remaks This is not equal to deferred loading with the isClickToLoadRequired flag.
         * @devdoc See https://developers.google.com/web/updates/2017/06/play-request-was-interrupted for more information
         */
        isPlayingRequestOutstanding: false,

        /** Flags, whether deferred loading (until a user play click event is handeled)
         * is required to further load the track media file data. The flag may be set once after the metadata was successfully loaded.
         * @remarks When true, handling of a subsequent play action must first invoke a user-triggered load operation.
         * @remarks This specific handling is currenlty required on (some?) iOS devices,
         * because they only load data upon explicit user interaction.
         */
        isClickToLoadRequired: false,

        /** The fader to use */
        fader: undefined as unknown as AudioFader,
    }),
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
            console.log(
                `TrackAudioApiPlayer(${this.title})::mediaError ` +
                    this.audioElement?.error?.code +
                    '; details: ' +
                    this.audioElement?.error?.message,
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
        this.audioElement.ondurationchange = (event) => {
            this.debugLog(`ondurationchange `, event);
        };
        this.audioElement.onpause = () => {
            this.playing = false;
        };
        this.audioElement.onplay = () => {
            this.playing = true;

            //NOTE: Having the fade-in operation to start here, instead of after the thenable play action
            //ensures, that a fade operation is applied without any audible delay.
            this.debugLog('Playback started');
            this.$emit('trackPlaying', true);
            this.isFading = true;
            this.fader.fadeIn().then(() => {
                this.isFading = false;
            });
        };

        this.fader = new AudioFader(
            this.audioElement,
            this.getSettings.fadeInDuration,
            this.getSettings.fadeOutDuration,
            this.getSettings.applyFadeInOffset,
            this.trackVolume,
        );

        //NOTE: Not using CORS, property crossOrigin is not set, not asking for permission

        this.audioElement.loop = false; //according to the above default playbackMode

        //Last, update the souce, if already available
        this.audioElement.preload = 'auto';
        //this.audioElement.preload = 'metadata';
        this.updateMediaSource(this.mediaUrl);
    },
    /** Handles the teardown of the audio graph outside the mounted lifespan.
     * @devdoc The audio element is intentionally not added to the DOM, to keep it unaffected of unmounts during vue-router route changes.
     */
    unmounted() {
        this.debugLog(`unmounted:`, this.title);

        //properly destroy the audio element and the audio context
        this.playing = false;
        this.audioElement.pause();
        this.audioElement.removeAttribute('src'); // empty resource
        this.audioElement.remove();

        //TODO later remove: The audio context is currently not used
        //this.audioContext.close();
    },

    computed: {
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
        /** Watch whether the volume changed, and then update the audio element accordingly  */
        trackVolume(trackVolume: number): void {
            //this.debugLog(`trackVolume:${trackVolume}`);
            this.fader.setMasterAudioVolume(trackVolume);
        },
        /** Watch whether the playbackMode changed, and then update the audio element accordingly  */
        playbackMode(): void {
            this.debugLog(`playbackMode:${this.playbackMode}`);
            this.audioElement.loop =
                this.playbackMode === PlaybackMode.LoopTrack;
            //HINT: For the cue loop, an explicit implementation is required,
            //because automatic looping is not supported with the used HTMLAudioEleemnt.
            //This is solved in this component by observing the recurring time updates.
        },
        /** Watch whether the media URL property changed, and then update the audio element accordingly  */
        mediaUrl(): void {
            this.debugLog(`mediaUrl:${this.mediaUrl}`);
            this.updateMediaSource(this.mediaUrl);
            this.fader.cancel();
        },
    },
    methods: {
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
            //Only start loading the element, when a source is actually available
            //Otherwise the element throws an avoidable error
            this.debugLog(`UpdateMediaSource:${mediaUrl}`);
            if (mediaUrl) {
                this.audioElement.src = mediaUrl;
            }
        },
        download() {
            this.debugLog(`download`);
            this.stop();
            window.open(this.mediaUrl, 'download');
        },
        handleLoadedMetadata(): void {
            const readyState = this.audioElement.readyState;
            this.debugLog(`handleLoadedMetadata:readyState:${readyState}`);

            this.handleReadyState(readyState);
        },
        /** Handles the load event of the audio element
         * @remarks Since loading is usually in progress now, this also resets the isClickToLoadRequired flag, unless
         * it is specifically detected, that further loading needs to be triggered
         */
        handleLoadedData(): void {
            this.isClickToLoadRequired = false;
            const readyState = this.audioElement.readyState;

            this.debugLog(`handleLoadedData:readyState:${readyState}`);
            this.handleReadyState(readyState);
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
                    this.durationSeconds = this.audioElement.duration;

                    this.$emit('trackLoaded', this.durationSeconds);

                    //Apply the currently known position to the player. It could be non-zero already.
                    this.seekTo(this.currentSeconds);
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
            //most probably due to load restriction on an iOS device.
            if (this.audioElement.buffered.length === 0) {
                //The isClickToLoadRequired flag defers further media loading until the next user's explicit play request
                this.isClickToLoadRequired = true;
            }
        },

        mute() {
            this.debugLog(`mute`);
            this.isMuted = !this.isMuted;
            this.audioElement.muted = this.isMuted;
        },
        seekByClick(e: MouseEvent) {
            this.debugLog(`seekByClick`, e);
            if (!this.hasLoadedMetadata) return;

            const bounds = (e.target as HTMLDivElement).getBoundingClientRect();
            const seekPos = (e.clientX - bounds.left) / bounds.width;

            this.audioElement.currentTime =
                this.audioElement.duration * seekPos;
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
                this.$emit('trackPlaying', false);
            }
            //no fading at stop
            this.isFading = false;
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
        /**Dereases the track audio volume level
         */
        volumeDown() {
            this.trackVolume = this.trackVolume * 0.71;
            this.debugLog(`volumeDown`, this.trackVolume);
        },
        /**Inreases the track audio volume level
         * @remarks Applies some limitation on the lower and upper end of the range
         * to keep the value within the valid range from [0..1]
         */
        volumeUp() {
            //Use a very faint minimum value allow for faster increase from very low volume levels
            this.trackVolume = Math.min(
                Math.max(this.trackVolume * 1.41, 0.001),
                1,
            );
            this.debugLog(`volumeUp`, this.trackVolume);
        },
        /** Pauses playback */
        pause(): void {
            this.debugLog(`pause`);
            if (this.playing) {
                this.isFading = true;
                this.fader.fadeOut().then(() => {
                    this.audioElement.pause();
                    this.isFading = false;
                    this.$emit('trackPlaying', false);
                });
            }
        },
        /** Pauses playback (with a subsequent seek operation) */
        pauseAndSeekTo(position: number): void {
            this.debugLog(`pauseAndSeekTo`);

            this.isFading = true;
            this.fader.fadeOut().then(() => {
                this.audioElement.pause();
                this.isFading = false;
                this.$emit('trackPlaying', false);
                this.seekTo(position);
            });
        },
        /** Updates the current seconds display and emits an event with the temporal position of the player
         * @devdoc This must get only privately called from the audio player
         * @devdoc This is known to result in setTimout violations on slower systems
         */
        updateTime(/*event: Event*/) {
            this.currentSeconds = this.audioElement.currentTime;
            this.$emit('timeupdate', this.currentSeconds);

            this.handleCueLoop();
        },
        /** Handles looping for a single cue, if requested
         */
        handleCueLoop(): void {
            if (this.playbackMode === PlaybackMode.LoopCue) {
                //Detect, with a safety margin, whether the possible loop is at track end
                const trackDurationSafetyMarginSeconds = 0.3;
                const isAtTrackEnd =
                    this.currentSeconds >=
                    this.durationSeconds - trackDurationSafetyMarginSeconds;

                //Is a loop due?
                if (
                    this.loopStart !== undefined &&
                    this.loopEnd !== undefined &&
                    (this.currentSeconds >= this.loopEnd || isAtTrackEnd)
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
            if (this.playbackMode === PlaybackMode.PlayCue) {
                if (
                    this.loopStart !== undefined &&
                    this.loopEnd !== undefined &&
                    this.currentSeconds >= this.loopEnd
                ) {
                    this.pauseAndSeekTo(this.loopStart);
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
                    this.audioElement.buffered.length === 0
                ) {
                    this.debugLog(`loadAfterClick:load-with-handler`);
                    //Trigger and observe further loading
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
            this.debugLog(
                `play:isClickToLoadRequired${this.isClickToLoadRequired}`,
            );
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
                                this.$emit('trackPlaying', false);
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

        /** Applies an offset to compensate fade-in durations */
        applyPreFadeInOffset(): void {
            const time = this.audioElement.currentTime;
            const offset = this.settings.fadeInDuration / 1000;
            const target = time - offset;
            this.debugLog(
                `applyPreFadeInOffset:by:${this.fadeInDuration};from time:${time}; to target:${target}`,
            );
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
