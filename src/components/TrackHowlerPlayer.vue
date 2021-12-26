<template>
    <!-- //TODO later maybe use something like
    //https://medium.com/@devdude/handling-screen-media-queries-for-js-on-a-vue-js-project-357e40fb1c77
    //To actually remove the unused player from the DOM with
    //v-if="is-hidden-tablet" or something the like -->
    <div class="has-background-danger"></div>
    Howler:
    <PlayerChromeMini
        class="is-hidden-tablet"
        :title="title"
        :loaded="this.loaded"
        @stop="stop"
        v-model:playing="this.playing"
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
    <PlayerChrome
        class="is-hidden-mobile"
        :title="title"
        :loaded="this.loaded"
        @stop="stop"
        v-model:playing="this.playing"
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
import PlayerChromeMini from '@/components/PlayerChromeMini.vue';
import PlayerChrome from '@/components/PlayerChrome.vue';

/** A simple vue audio player, for a single track, using the Web Audio API
 * @remarks Repeatedly emits 'timeupdate' with the current playback time, during playing
 * @remarks Emits 'trackLoaded' with the track duration in seconds, once after successful load of the track's media file
 * @remarks Emits 'trackPlaying' when the track is playing
 */
export default defineComponent({
    name: 'TrackHowlerPlayer',
    components: { PlayerChrome, PlayerChromeMini },
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
    },

    //see https://github.com/amilajack/drum-machine/blob/master/src/components/Machine.vue
    //..Audio contxt there is direclty on root level. Will this work for me, too?
    data: () => ({
        /** The playback progress in the current track, in [seconds] */
        currentSeconds: 0,
        /** Gets the duration of the current track, in [seconds]
         * @remarks This is only available after successful load of the media file
         */
        durationSeconds: 0,
        loaded: false,
        looping: false,
        playing: false,
        previousVolume: 50,
        showVolume: false,
        /** Default value, user may change later */
        volume: 25,
        /** The audio context to use
         * @devdoc //TODO later allow to use the "playback" option via a settings panel: https://developer.mozilla.org/en-US/docs/Web/API/AudioContext/AudioContext#options
         * @devdoc //TODO what about: window.AudioContext = window.AudioContext || window.webkitAudioContext; Is this required?
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
    },
    /** Handles the teardown of the audio graph outside the mounted lifespan.
     * @devdoc The audio element is intentionally not added to the DOM, to keep it unaffected of unmounts during vue-router route changes.
     */
    unmounted() {
        console.debug('TrackHowlerPlayer::unmounted:', this.title);

        //properly destroy the audio element and the audio context
        this.playing = false;
        this.audioElement.pause();
        this.audioElement.remove();

        this.audioContext.close();
    },

    computed: {
        muted(): boolean {
            return this.volume / 100 === 0;
        },
        /** The playback progress in the current track, in [percent] */
        percentComplete(): number {
            return (this.currentSeconds / this.durationSeconds) * 100;
        },

        /** Returns the progress style, dynamically depending on the actual progress in the track
         * @remarks Calculates the witdh with respect to the progress bar width from the player styles (which is a border)
         * max-width makes sure, the progress bar never overflows the given space.
         */
        // eslint-disable-next-line
        progressStyle(): any {
            return {
                width: `calc(${this.percentComplete}% + 0.4em)`,
                'max-width': '100%',
            };
        },
        volumeTitle(): string {
            return `Volume (${this.volume}%)`;
        },
    },

    watch: {
        /** Watch whether the player state changed, and then update the audio element accordingly
         * @remarks Tracks outstanding play requests and starts a new one only when none is outstanding already.
         */
        playing(value: boolean): Promise<void> | undefined {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::watch:playing:value${value}`,
            );
            if (value) {
                if (!this.isPlayingRequestOutstanding) {
                    this.isPlayingRequestOutstanding = true;
                    return this.audioElement
                        .play()
                        .then(() => {
                            console.debug('Playback started');
                            this.$emit('trackPlaying', true);
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
            } else {
                this.audioElement.pause();
                this.$emit('trackPlaying', false);
            }
        },
        /** Watch whether the volume changed, and then update the audio element accordingly  */
        volume(): void {
            console.debug(
                `TrackHowlerPlayer(${this.title})::volume:${this.volume}`,
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
        /** Converts the total seconds into a conveniently displayable hh:mm:ss.s format.
         * @remarks Omits the hour part, if not appliccable
         */
        convertToDisplayTime(seconds: number): string {
            //Uses the hour, minute, seconds, and 1 digit of the milliseconds part
            const hhmmss = new Date(seconds * 1000)
                .toISOString()
                .substr(11, 10);
            //skip the hour part, if not used
            return hhmmss.indexOf('00:') === 0 ? hhmmss.substr(3) : hhmmss;
        },
        download() {
            console.debug(`TrackHowlerPlayer(${this.title})::download`);
            this.stop();
            window.open(this.src, 'download');
        },
        load() {
            console.debug(`TrackHowlerPlayer(${this.title})::load`);
            if (this.audioElement.readyState >= 2) {
                this.loaded = true;
                this.durationSeconds = this.audioElement.duration;

                this.$emit('trackLoaded', this.durationSeconds);

                //Apply the initial volume. This is a hack to trigger the volumes watcher here, to apply some form of default other than 100
                this.volume = this.previousVolume;

                //Apply the currently known position to the player. It could be non-zero already.
                this.seekTo(this.currentSeconds);

                return (this.playing = this.autoPlay);
            }

            throw new Error('Failed to load sound file.');
        },
        mute() {
            console.debug(`TrackHowlerPlayer(${this.title})::mute`);
            if (this.muted) {
                return (this.volume = this.previousVolume);
            }

            this.previousVolume = this.volume;
            this.volume = 0;
        },
        seekByClick(e: MouseEvent) {
            console.debug(`TrackHowlerPlayer(${this.title})::seekByClick`, e);
            if (!this.loaded) return;

            const bounds = (e.target as HTMLDivElement).getBoundingClientRect();
            const seekPos = (e.clientX - bounds.left) / bounds.width;

            this.audioElement.currentTime =
                this.audioElement.duration * seekPos;
        },
        seekToSeconds(seconds: number) {
            console.debug(
                `TrackHowlerPlayer(${this.title})::seekToSeconds`,
                seconds,
            );
            if (!this.loaded) return;

            this.audioElement.currentTime = seconds;
        },
        stop() {
            console.debug(`TrackHowlerPlayer(${this.title})::stop`);
            this.playing = false;
            this.audioElement.currentTime = 0;
            this.$store.commit(MutationTypes.UPDATE_SELECTED_CUE_ID, undefined);
        },
        togglePlayback() {
            console.debug(`TrackHowlerPlayer(${this.title})::togglePlayback`);
            this.playing = !this.playing;
        },
        /** Rewinds 1 second */
        rewindOneSecond() {
            console.debug(`TrackHowlerPlayer(${this.title})::rewindOneSecond`);
            const time = this.audioElement.currentTime;
            this.audioElement.currentTime = time - 1;
        },
        /** Forwards 1 second */
        forwardOneSecond() {
            console.debug(`TrackHowlerPlayer(${this.title})::forwardOneSecond`);
            const time = this.audioElement.currentTime;
            this.audioElement.currentTime = time + 1;
        },
        volumeDown() {
            this.volume = this.volume * 0.71;
            console.debug(
                `TrackHowlerPlayer(${this.title})::volumeDown`,
                this.volume,
            );
        },
        volumeUp() {
            this.volume = Math.min(this.volume * 1.41, 100);
            console.debug(
                `TrackHowlerPlayer(${this.title})::volumeUp`,
                this.volume,
            );
        },
        /** Pauses playback, keeping the position at the current position */
        pause() {
            console.debug(`TrackHowlerPlayer(${this.title})::pause`);
            this.playing = false;
        },
        /** Updates the current seconds display and emits an event with the temporal position of the player
         * @devdoc This must get only privately called from the audio player
         */
        updateTime(/*event: Event*/) {
            //console.debug(`TrackHowlerPlayer(${this.title})::updateTime:e`, e);
            this.currentSeconds = this.audioElement.currentTime;
            this.$emit('timeupdate', this.currentSeconds);
        },
        /** Starts playback from the given temporal position
         * @remarks This first seeks to the position, then starts playing
         */
        playFrom(position: number): void {
            this.seekTo(position);
            console.debug(
                `TrackHowlerPlayer(${this.title}):playFrom:position`,
                position,
            );
            this.playing = true;
        },
        /** Transports (seeks) the playback to the given temporal position */
        seekTo(position: number): void {
            console.debug(
                `TrackHowlerPlayer(${this.title})::seekTo:position`,
                position,
            );
            this.audioElement.currentTime = position;
        },
    },
});
</script>
<style scoped></style>
