<template>
    <!-- is-hidden-mobile -->
    <PlayerChrome
        :title="title"
        :loaded="this.loaded"
        @stop="stop"
        :playing="this.playing"
        @play="this.play"
        @pause="this.pause"
        :isPlayingRequestOutstanding="false"
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
import { HowlerFader } from '@/code/audio/HowlerFader';
import { Howl } from 'howler';
import { settingsMixin } from '@/mixins/settingsMixin';

/** A simple vue audio player, for a single track, using the Web Audio API
 * @remarks Repeatedly emits 'timeupdate' with the current playback time, during playing.
 * @remarks Emits 'trackLoaded' with the track duration in seconds, once after successful load of the track's media file
 * @remarks Emits 'trackPlaying' when the track is playing
 * @devdoc Output of the 'timeupdate' event is optimised: Only actually changed values are emitted.
 * Following the use of the requestAnimationFrame feature, the maximum rate is to be expected no more than 60 FPS.
 */
export default defineComponent({
    name: 'TrackHowlerPlayer',
    components: {
        PlayerChrome,
    },
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
    },
    //see https://github.com/amilajack/drum-machine/blob/master/src/components/Machine.vue
    //..Audio contxt there is direclty on root level. Will this work for me, too?
    data: () => ({
        /** The playback progress in the current track, in [seconds] */
        currentSeconds: 0,
        /** The duration of the current track, in [seconds]
         * @remarks This is only available after successful load of the media file
         */
        durationSeconds: 0,
        /** Whether the track media is loaded */
        loaded: false,

        /** Whether the audio is muted */
        muted: false,
        /** Whether the track is in a looping mode */
        looping: false,
        showVolume: false,
        /** The audio volume in [percent]. Default is 50, user may change later */
        volume: 50,
        /** Whether the track is playing */
        playing: false,
        sound: null as unknown as Howl,
        /** A (private) keeper for the last animation frame id
         * @remarks This is used for the playing progress animation
         */
        animationFrameId: 0,
        /** A (private) keeper for the last emitted temporal position.
         *
         * @remarks This is used to avoid consecutive emission of the same value
         */
        lastSecondsEmitted: undefined as unknown as undefined | number,
        fader: undefined as unknown as HowlerFader,
    }),
    /** Handles the setup of the audio outside the mounted lifespan.
     */
    created() {
        console.debug(
            `TrackHowlerPlayer::created:src:${this.src} for title ${this.title}`,
        );

        this.looping = this.loop;
        this.createHowl(this.src);
    },
    /** Handles the teardown of the audio outside the mounted lifespan.
     */
    unmounted() {
        console.debug('TrackHowlerPlayer::unmounted:', this.title);

        this.stopUpdateAnimation();

        //properly destroy sound object
        if (this.sound) {
            this.sound.unload();
        }
    },

    computed: {
        volumeTitle(): string {
            return `Volume (${this.volume}%)`;
        },
    },

    watch: {
        /** Watch whether the playing state changed, and then update sound accordingly
         * @remarks This is used to follow external play requests. Internally, the sound object should be used to
         * issue play/pause requests.
         */
        // playing(value: boolean): void {
        //     console.debug(
        //         `TrackHowlerPlayer(${this.title})::watch:playing:value${value}`,
        //     );
        //     //Only actually update the sound when necessary, to avoid call loops
        //     if (value === true) {
        //         if (!this.sound.playing()) {
        //             this.sound.play();
        //         }
        //     } else if (value === false) {
        //         if (this.sound.playing()) {
        //             this.sound.pause();
        //         }
        //     }
        // },
        /** Watch whether the volume changed, and then update the sound object accordingly  */
        volume(): void {
            console.debug(
                `TrackHowlerPlayer(${this.title})::volume:${this.volume}`,
            );
            this.sound.volume(this.volume / 100);
        },
        /** Watch whether the looping changed, and then update the sound object accordingly  */
        looping(): void {
            console.debug(
                `TrackHowlerPlayer(${this.title})::looping:${this.looping}`,
            );
            this.sound.loop(this.looping);
        },
        /** Watch whether the source changed, and then update the sound object element accordingly  */
        src(): void {
            console.debug(`TrackHowlerPlayer(${this.title})::src:${this.src}`);
            this.createHowl(this.src);
        },
    },
    methods: {
        /** Creates a new howl with the given source URL.
         * @remarks Only supports mp3 currently
         * //TODO the media type should be given as a parameter too
         * (or some undocumented detection is available?)
         * @devdoc //TODO Probably the sprites feature could be used for single cue looping
         */
        createHowl(sourceUrl: string): void {
            if (this.sound != null) {
                this.sound.unload();
            }
            if (sourceUrl) {
                this.sound = new Howl({
                    src: [this.src],
                    html5: true /* necessary for large files */,
                    autoplay: this.autoPlay,
                    loop: this.looping,
                    volume: this.volume / 100,
                    // //TODO use from object url if possible?
                    format: ['mp3'],
                    preload: true /* to force immediate loading */,
                    onload: this.load,
                    onplay: () => {
                        this.fader.fadeIn();
                        this.playing = true;
                        this.$emit('trackPlaying', true);
                        this.startUpdateAnimation();
                    },
                    onplayerror: () => {
                        this.playing = false;
                        this.$emit('trackPlaying', false);
                        this.stopUpdateAnimation();
                        throw new Error('Failed to play sound file.');
                    },
                    onpause: () => {
                        this.playing = false;
                        this.$emit('trackPlaying', false);
                        this.stopUpdateAnimation();
                        this.updateTimeOnce();
                    },
                    onstop: () => {
                        this.playing = false;
                        this.$emit('trackPlaying', false);
                        this.stopUpdateAnimation();
                        this.updateTimeOnce();
                    },
                    onseek: this.updateTimeOnce,
                    onend: () => {
                        if (!this.sound.loop()) {
                            //When not looping, playback has ended here
                            this.playing = false;
                            this.$emit('trackPlaying', false);
                            this.stopUpdateAnimation();
                            this.updateTimeOnce();
                        }
                    },
                });
                //TODO use druation from parameer
                this.fader = new HowlerFader(
                    this.sound,
                    this.getSettings.fadingDuration,
                    this.getSettings.applyFadeInOffset,
                );
            }
        },

        /** Stops the recurring update of the playback progress of the track */
        stopUpdateAnimation() {
            if (this.animationFrameId) {
                window.cancelAnimationFrame(this.animationFrameId);
                this.animationFrameId = 0;
            }
        },
        /** Starts the recurring update of the playback progress of the track
         * @devdoc Stops any possible previous update process before starting this one.
         */
        startUpdateAnimation() {
            this.stopUpdateAnimation();
            this.updateTimeAnimated();
        },
        download() {
            console.debug(`TrackHowlerPlayer(${this.title})::download`);
            this.stop();
            window.open(this.src, 'download');
        },
        load() {
            console.debug(`TrackHowlerPlayer(${this.title})::load`);
            if (this.sound.state() == 'loaded') {
                this.loaded = true;
                this.durationSeconds = this.sound.duration();

                this.$emit('trackLoaded', this.durationSeconds);

                //Apply the currently known position to the player. It could be non-zero already.
                console.debug(
                    `TrackHowlerPlayer(${this.title})::load:seekTo:${this.currentSeconds}`,
                );

                this.seekTo(this.currentSeconds);
                return;
            }

            throw new Error('Failed to load sound file.');
        },
        /** Sets the muted state for the audio */
        mute(muted: boolean) {
            this.muted = muted;
            this.sound.mute(muted);
        },
        seekByClick(e: MouseEvent) {
            console.debug(`TrackHowlerPlayer(${this.title})::seekByClick`, e);
            if (!this.loaded) return;

            const bounds = (e.target as HTMLDivElement).getBoundingClientRect();
            const seekPos = (e.clientX - bounds.left) / bounds.width;

            this.sound.seek(this.sound.duration() * seekPos);
        },
        seekToSeconds(seconds: number) {
            console.debug(
                `TrackHowlerPlayer(${this.title})::seekToSeconds`,
                seconds,
            );
            if (!this.loaded) return;

            this.sound.seek(seconds);
        },
        stop() {
            console.debug(`TrackHowlerPlayer(${this.title})::stop`);
            this.sound.stop();
            this.fader.cancel();
            this.$store.commit(MutationTypes.UPDATE_SELECTED_CUE_ID, undefined);
        },
        togglePlayback() {
            console.debug(`TrackHowlerPlayer(${this.title})::togglePlayback`);
            if (this.sound.playing()) {
                this.fader.fadeOut().then(() => {
                    this.sound.pause();
                });
            } else {
                this.sound.play();
            }
        },
        /** Rewinds 1 second */
        rewindOneSecond() {
            console.debug(`TrackHowlerPlayer(${this.title})::rewindOneSecond`);
            const time = this.sound.seek();
            this.sound.seek(time - 1);
        },
        /** Forwards 1 second */
        forwardOneSecond() {
            console.debug(`TrackHowlerPlayer(${this.title})::forwardOneSecond`);
            const time = this.sound.seek();
            this.sound.seek(time + 1);
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
        /** Pauses playback (without a seek operation) */
        pause() {
            if (this.sound.playing()) {
                console.debug(`TrackHowlerPlayer(${this.title})::pause`);
                this.fader.fadeOut().then(() => {
                    this.sound.pause();
                });
            } else {
                console.warn(
                    `TrackHowlerPlayer(${this.title})::pause aborted, nothing to pause`,
                );
            }
        },

        /** Starts playback (without a seek operation) */
        play() {
            console.debug(`TrackHowlerPlayer(${this.title})::play`);
            this.sound.play();
        },

        /** Pauses playback (with a subsequent seek operation) */
        pauseAndSeekTo(position: number): void {
            if (this.sound.playing()) {
                console.debug(
                    `TrackHowlerPlayer(${this.title})::pauseAndSeekTo`,
                );
                this.fader.fadeOut().then(() => {
                    this.sound.pause();
                    this.seekTo(position);
                });
            } else {
                console.warn(
                    `TrackHowlerPlayer(${this.title})::pauseAndSeekTo aborted, nothing to pause`,
                );
            }
        },
        /** Immediately updates playback progress and emits an event with the temporal position of the player.
         * Additionally, schedules further regular updates via requestAnimationFrame.
         * @devdoc This must get only privately called
         */
        updateTimeAnimated(): void {
            this.updateTimeOnce();
            //Schedule next regular update
            this.animationFrameId = requestAnimationFrame(
                this.updateTimeAnimated,
            );
        },
        /** Immediately updates playback progress and emits an event with the temporal position of the player.
         * @remarks To optimize performance, the update event is only emitted if there is a change in value
         * since the last emission.
         * @devdoc This must get only privately called
         */
        updateTimeOnce(): void {
            this.currentSeconds = this.sound.seek();
            if (this.currentSeconds !== this.lastSecondsEmitted) {
                // console.debug(
                //     `TrackHowlerPlayer(${this.title})::updateTimeOnce:this.currentSeconds`,
                //     this.currentSeconds,
                // );
                this.$emit('timeupdate', this.currentSeconds);
                this.lastSecondsEmitted = this.currentSeconds;
            }
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
            this.sound.play();
        },
        /** Transports (seeks) the playback to the given temporal position */
        seekTo(position: number): void {
            console.debug(
                `TrackHowlerPlayer(${this.title})::seekTo:position`,
                position,
            );
            //if loaded, immediately seek
            if (this.sound && this.sound.state() == 'loaded') {
                this.sound.seek(position);
            } else {
                //otherwise keep position for the seek operation following the eventually successful load
                this.currentSeconds = position;
            }
        },
    },
});
</script>
<style scoped></style>
