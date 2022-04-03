<template>
    <CueTrigger
        v-if="isEditable"
        :title="title"
        :loaded="this.loaded"
        :isFading="this.isFading"
        :playing="this.playing"
        @pause="pause"
        @play="play"
        :isPlayingRequestOutstanding="this.isPlayingRequestOutstanding"
        v-model:currentSeconds="this.currentSeconds"
        @seek="seekToSeconds"
        :durationSeconds="this.durationSeconds"
        :source="this.source"
        :error="this.mediaError"
    />
    <PlayerChrome
        v-else
        :title="title"
        :loaded="this.loaded"
        :isFading="this.isFading"
        :playing="this.playing"
        @stop="stop"
        @pause="pause"
        @play="play"
        :isPlayingRequestOutstanding="this.isPlayingRequestOutstanding"
        v-model:currentSeconds="this.currentSeconds"
        v-model:volume="this.volume"
        v-model:playbackMode="this.playbackMode"
        :muted="this.muted"
        @mute="mute"
        @seek="seekToSeconds"
        :durationSeconds="this.durationSeconds"
        @download="this.download"
        :source="this.source"
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
 * @remarks Emits 'trackLoaded' with the track duration in seconds, once after successful load of the track's media file
 * @remarks Emits 'trackPlaying' when the track is playing
 * @devdoc The 'newCueTriggered' is just passed up
 */
export default defineComponent({
    name: 'TrackAudioApiPlayer',
    components: { PlayerChrome, CueTrigger },
    mixins: [settingsMixin],

    emits: ['timeupdate', 'trackLoaded', 'trackPlaying'],
    props: {
        title: String,
        autoPlay: {
            type: Boolean,
            default: false,
        },
        src: {
            type: String,
            default: '',
            required: false,
        },
        /** Whether this component show editable inputs for the contained data
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
        source: {
            type: String,
            default: '',
        },
    },
    data: () => ({
        /** The playback progress in the current track, in [seconds] */
        currentSeconds: 0,
        /** Gets the duration of the current track, in [seconds]
         * @remarks This is only available after successful load of the media file
         */
        durationSeconds: 0,
        isMuted: false,
        loaded: false,
        mediaError: null as MediaError | null,
        /** Whether the audio is currently fading */
        isFading: false,
        playbackMode: PlaybackMode.PlayTrack, //by default
        playing: false,
        previousVolume: 50,
        showVolume: false,
        /** Default value, user may change later */
        volume: 25,
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
         * @devdoc See https://developers.google.com/web/updates/2017/06/play-request-was-interrupted for more information
         */
        isPlayingRequestOutstanding: false,

        /** The fader to use */
        fader: undefined as unknown as AudioFader,
    }),
    /** Handles the setup of the audio graph outside the mounted lifespan.
     * @devdoc The audio element is intentionally not added to the DOM, to keep it unaffected of unmounts during vue-router route changes.
     */
    created() {
        console.debug(
            `TrackAudioApiPlayer::created:src:${this.src} for title ${this.title}`,
        );

        this.audioElement.loop = false; //according to the above default
        this.audioElement.ontimeupdate = this.updateTime;
        this.audioElement.onloadeddata = this.load;
        this.audioElement.onerror = () => {
            this.mediaError = this.audioElement?.error;
            console.log(
                'TrackAudioApiPlayer::mediaError ' +
                    this.audioElement?.error?.code +
                    '; details: ' +
                    this.audioElement?.error?.message,
            );
        };
        this.audioElement.onpause = () => {
            this.playing = false;
        };
        this.audioElement.onplay = () => {
            this.playing = true;

            //NOTE: Having the fade-in operation to start here, instead of after the thenable play action
            //ensures, that a fade operation is applied without any audible delay.
            console.debug('Playback started');
            this.$emit('trackPlaying', true);
            this.isFading = true;
            this.fader.fadeIn().then(() => {
                this.isFading = false;
            });
        };
        this.audioElement.preload = 'auto';

        this.updateSource(this.src);

        this.fader = new AudioFader(
            this.audioElement,
            this.getSettings.fadeInDuration,
            this.getSettings.fadeOutDuration,
            this.getSettings.applyFadeInOffset,
        );
    },
    /** Handles the teardown of the audio graph outside the mounted lifespan.
     * @devdoc The audio element is intentionally not added to the DOM, to keep it unaffected of unmounts during vue-router route changes.
     */
    unmounted() {
        console.debug('TrackAudioApiPlayer::unmounted:', this.title);

        //properly destroy the audio element and the audio context
        this.playing = false;
        this.audioElement.pause();
        this.audioElement.remove();

        //TODO later remove: The audio context is currently not used
        //this.audioContext.close();
    },

    computed: {
        muted(): boolean {
            return this.isMuted;
        },
        volumeTitle(): string {
            return `Volume (${this.volume}%)`;
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
                console.debug(
                    `TrackAudioApiPlayer(${this.title})::audioFaderSettingsToken:${this.audioFaderSettingsToken}`,
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
        volume(): void {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::volume:${this.volume}`,
            );
            this.audioElement.volume = this.volume / 100;
        },
        /** Watch whether the playbackMode changed, and then update the audio element accordingly  */
        playbackMode(): void {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::playbackMode:${this.playbackMode}`,
            );
            this.audioElement.loop =
                this.playbackMode === PlaybackMode.LoopTrack;
            //HINT: For the cue loop, an explicit implementation is required,
            //because automatic looping is not supported with the used HTMLAudioEleemnt.
            //This is solved in this component by observing the recurring time updates.
        },
        /** Watch whether the source changed, and then update the audio element accordingly  */
        src(): void {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::src:${this.src}`,
            );
            this.updateSource(this.src);
            this.fader.cancel();
        },
    },
    methods: {
        /** Updates the audio element source with the media source, if it's available */
        updateSource(source: string): void {
            //Only start loading the element, when a source is actually available
            //Otherwise the element throws an avoidable error
            console.debug(
                `TrackAudioApiPlayer(${this.title})::updateSource:${source}`,
            );
            if (source) {
                this.audioElement.src = source;
            }
        },
        download() {
            console.debug(`TrackAudioApiPlayer(${this.title})::download`);
            this.stop();
            window.open(this.src, 'download');
        },
        load() {
            console.debug(`TrackAudioApiPlayer(${this.title})::load`);
            if (this.audioElement.readyState >= 2) {
                this.loaded = true;
                this.durationSeconds = this.audioElement.duration;

                this.$emit('trackLoaded', this.durationSeconds);

                //Apply the initial volume. This is a hack to trigger the volumes watcher here, to apply some form of default other than 100
                this.volume = this.previousVolume;

                //Apply the currently known position to the player. It could be non-zero already.
                this.seekTo(this.currentSeconds);

                //TODO apply fade in here... if required
                return (this.playing = this.autoPlay);
            }

            throw new Error('Failed to load sound file.');
        },
        mute() {
            console.debug(`TrackAudioApiPlayer(${this.title})::mute`);
            this.isMuted = !this.isMuted;
            this.audioElement.muted = this.isMuted;
        },
        seekByClick(e: MouseEvent) {
            console.debug(`TrackAudioApiPlayer(${this.title})::seekByClick`, e);
            if (!this.loaded) return;

            const bounds = (e.target as HTMLDivElement).getBoundingClientRect();
            const seekPos = (e.clientX - bounds.left) / bounds.width;

            this.audioElement.currentTime =
                this.audioElement.duration * seekPos;
        },
        seekToSeconds(seconds: number) {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::seekToSeconds`,
                seconds,
            );
            if (!this.loaded) return;

            this.audioElement.currentTime = seconds;
        },
        stop() {
            console.debug(`TrackAudioApiPlayer(${this.title})::stop`);
            //If it's still playing (e.g. during a fade operation, stil immediately stop)
            if (!this.audioElement.paused) {
                this.audioElement.pause();
                this.$emit('trackPlaying', false);
            }
            //no fading at stop
            this.isFading = false;
            this.audioElement.currentTime = 0;
            this.$store.commit(MutationTypes.UPDATE_SELECTED_CUE_ID, undefined);
        },
        togglePlayback() {
            console.debug(`TrackAudioApiPlayer(${this.title})::togglePlayback`);
            if (this.playing) {
                this.pause();
            } else {
                this.play();
            }
        },
        /** Rewinds 1 second */
        rewindOneSecond() {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::rewindOneSecond`,
            );
            const time = this.audioElement.currentTime;
            this.audioElement.currentTime = time - 1;
        },
        /** Forwards 1 second */
        forwardOneSecond() {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::forwardOneSecond`,
            );
            const time = this.audioElement.currentTime;
            this.audioElement.currentTime = time + 1;
        },
        volumeDown() {
            this.volume = this.volume * 0.71;
            console.debug(
                `TrackAudioApiPlayer(${this.title})::volumeDown`,
                this.volume,
            );
        },
        volumeUp() {
            this.volume = Math.min(this.volume * 1.41, 100);
            console.debug(
                `TrackAudioApiPlayer(${this.title})::volumeUp`,
                this.volume,
            );
        },
        /** Pauses playback */
        pause(): void {
            console.debug(`TrackAudioApiPlayer(${this.title})::pause`);
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
            console.debug(`TrackAudioApiPlayer(${this.title})::pauseAndSeekTo`);

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
                        console.debug(
                            `TrackAudioApiPlayer::handleCueLoop:loopEnd:${this.loopEnd};durationSeconds:${this.durationSeconds}`,
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
        /** Starts playback at the current position
         */
        play(): void {
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
                            console.error('Playback failed with message: ' + e);
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
        },

        /** Applies an offset to compensate fade-in durations */
        applyPreFadeInOffset(): void {
            const time = this.audioElement.currentTime;
            const offset = this.settings.fadeInDuration / 1000;
            const target = time - offset;
            console.debug(
                `TrackAudioApiPlayer::applyPreFadeInOffset:by:${this.fadeInDuration};from time:${time}; to target:${target}`,
            );
            this.audioElement.currentTime = target;
        },

        /** Transports (seeks) the playback to the given temporal position */
        seekTo(position: number): void {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::seekTo:position`,
                position,
            );
            this.audioElement.currentTime = position;
        },
    },
});
</script>
<style scoped></style>
