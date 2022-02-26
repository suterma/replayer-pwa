<template>
    <CueTrigger
        v-if="isEditable"
        :title="title"
        :loaded="this.loaded"
        :isFading="this.isFading"
        @pause="pause"
        @play="play"
        :playing="this.playing"
        :isPlayingRequestOutstanding="this.isPlayingRequestOutstanding"
        v-model:currentSeconds="this.currentSeconds"
        @seek="seekToSeconds"
        :durationSeconds="this.durationSeconds"
    />
    <PlayerChrome
        v-else
        :title="title"
        :loaded="this.loaded"
        :isFading="this.isFading"
        @stop="stop"
        @pause="pause"
        @play="play"
        :playing="this.playing"
        :isPlayingRequestOutstanding="this.isPlayingRequestOutstanding"
        v-model:currentSeconds="this.currentSeconds"
        v-model:volume="this.volume"
        v-model:looping="this.looping"
        :muted="this.muted"
        @mute="mute"
        @seek="seekToSeconds"
        :durationSeconds="this.durationSeconds"
        @download="this.download"
    />
</template>

<script lang="ts">
import { MutationTypes } from '@/store/mutation-types';
import { defineComponent } from 'vue';
import PlayerChrome from '@/components/PlayerChrome.vue';
import CueTrigger from '@/components/CueTrigger.vue';
import AudioFader from '@/code/audio/AudioFader';
import { settingsMixin } from '@/mixins/settingsMixin';

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
            default: null,
        },
        loop: {
            type: Boolean,
            default: false,
        },
        /** Whether this component show editable inputs for the contained data
         * @devdoc Allows to reuse this component for more than one DisplayMode.
         */
        isEditable: {
            type: Boolean,
            default: false,
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
        /** Whether the audio is currently fading */
        isFading: false,
        looping: false,
        playing: false,
        previousVolume: 50,
        showVolume: false,
        /** Default value, user may change later */
        volume: 25,
        /** The audio context to use
         * @devdoc //TODO later allow to use the "playback" option via a settings panel: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext#options
         * @devdoc This code does not support the old webkitAudioContext formerly used with webkit. It's expected to run on modern browsers only.
         */
        audioContext: new AudioContext({
            latencyHint: 'interactive',
        }),
        audioElement: document.createElement('audio'),
        /** Flags, whether a playing request is currently outstanding. This is true after a play request was received, for as long
         * as playback has not yet started.
         * @devdoc See https://developers.google.com/web/updates/2017/06/play-request-was-interrupted for more information
         */
        isPlayingRequestOutstanding: false,

        /** The fader to use */
        fader: undefined as unknown as AudioFader,
        /** Flags whether the user has requested to play, which will be handeled with a subsequent fade-in
         * @remarks This flag allows to generally handle play requests,
         * with a distinction whether the play request was caused by a loop or by an explicit user
         * action. This flag is reset after each issued fade-in.
         */
        hasUserPlayRequestOutstanding: false,
    }),
    /** Handles the setup of the audio graph outside the mounted lifespan.
     * @devdoc The audio element is intentionally not added to the DOM, to keep it unaffected of unmounts during vue-router route changes.
     */
    created() {
        console.debug(
            `TrackAudioApiPlayer::created:src:${this.src} for title ${this.title}`,
        );

        this.looping = this.loop;
        this.audioElement.loop = this.looping;
        this.audioElement.src = this.src;
        this.audioElement.ontimeupdate = this.updateTime;
        this.audioElement.onloadeddata = this.load;
        this.audioElement.onpause = () => {
            this.playing = false;
        };
        this.audioElement.onplay = () => {
            this.playing = true;
        };
        this.audioElement.preload = 'auto';

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

        this.audioContext.close();
    },

    computed: {
        muted(): boolean {
            return this.isMuted;
        },
        volumeTitle(): string {
            return `Volume (${this.volume}%)`;
        },
        /** A simple token for the settings
         * @remarks This is only used to detect changes, to recreate the howler fader.
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
        /** Watch whether the player state changed, and then update the audio element accordingly
         * @remarks Tracks outstanding play requests and starts a new one only when none is outstanding already.
         */
        playing(value: boolean): Promise<void> | undefined {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::watch:playing:value${value}`,
            );
            if (value) {
                // if (!this.isPlayingRequestOutstanding) {
                //     this.isPlayingRequestOutstanding = true;
                //     return this.audioElement
                //         .play()
                //         .then(() => {
                //             console.debug('Playback started');
                //             this.$emit('trackPlaying', true);
                //             // if (this.hasUserPlayRequestOutstanding) {
                //             //     this.hasUserPlayRequestOutstanding = false;
                //             this.isFading = true;
                //             this.fader.fadeIn().then(() => {
                //                 this.isFading = false;
                //                 //TODO a subsequent seek operation can only be started NOW
                //             });
                //             //}
                //         })
                //         .catch((e) => {
                //             console.error('Playback failed with message: ' + e);
                //             this.$emit('trackPlaying', false);
                //         })
                //         .finally(() => {
                //             this.isPlayingRequestOutstanding = false;
                //         });
                // } else {
                //     console.warn(
                //         'A play request is already outstanding. This request is discarded.',
                //     );
                // }
            } else {
                //Handle fade directly on request....
                // this.isFading = true;
                // this.fader.fadeOut().then(() => {
                //     this.audioElement.pause();
                //     this.isFading = false;
                //     this.$emit('trackPlaying', false);
                // });
                // TODO handle stop correctly
                // this.audioElement.pause();
            }
            return undefined;
        },
        /** Watch whether the volume changed, and then update the audio element accordingly  */
        volume(): void {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::volume:${this.volume}`,
            );
            this.audioElement.volume = this.volume / 100;
        },
        /** Watch whether the looping changed, and then update the audio element accordingly  */
        looping(): void {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::looping:${this.looping}`,
            );
            this.audioElement.loop = this.looping;
        },
        /** Watch whether the source changed, and then update the audio element accordingly  */
        src(): void {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::src:${this.src}`,
            );
            this.audioElement.src = this.src;
        },
    },
    methods: {
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
            this.playing = false;
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
                    this.playing = false;
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
                this.playing = false;
                this.isFading = false;
                this.$emit('trackPlaying', false);
                this.seekTo(position);
            });
        },
        /** Updates the current seconds display and emits an event with the temporal position of the player
         * @devdoc This must get only privately called from the audio player
         */
        updateTime(/*event: Event*/) {
            //console.debug(`TrackAudioApiPlayer(${this.title})::updateTime:e`, e);
            this.currentSeconds = this.audioElement.currentTime;
            this.$emit('timeupdate', this.currentSeconds);
        },
        /** Starts playback from the given temporal position
         * @remarks This first seeks to the position, then starts playing
         */
        playFrom(position: number): void {
            this.seekTo(position);
            this.play();
            // console.debug(
            //     `TrackAudioApiPlayer(${this.title}):playFrom:position`,
            //     position,
            // );
            // this.hasUserPlayRequestOutstanding = true;
            // this.playing = true;
        },
        /** Starts playback at the current position
         */
        play(): void {
            if (!this.playing) {
                if (!this.isPlayingRequestOutstanding) {
                    this.isPlayingRequestOutstanding = true;
                    this.audioElement
                        .play()
                        .then(() => {
                            console.debug('Playback started');
                            this.$emit('trackPlaying', true);
                            // if (this.hasUserPlayRequestOutstanding) {
                            //     this.hasUserPlayRequestOutstanding = false;
                            this.isFading = true;
                            this.fader.fadeIn().then(() => {
                                this.isFading = false;
                            });
                            //}
                        })
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
