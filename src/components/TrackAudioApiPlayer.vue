<template>
    <div class="field has-addons player-panel">
        <!-- Stop (do not show on small devices, user still can use play/pause) -->
        <p class="control is-hidden-mobile">
            <button
                :class="{
                    button: true,
                }"
                v-on:click.prevent="stop"
                title="Stop"
            >
                <!-- STOP -->
                <span class="icon">
                    <i class="mdi mdi-24px">
                        <svg
                            style="width: 24px; height: 24px"
                            viewBox="0 0 24 24"
                        >
                            <path fill="currentColor" d="M18,18H6V6H18V18Z" />
                        </svg>
                    </i>
                </span>
            </button>
        </p>
        <p class="control">
            <button
                :class="{
                    button: true,
                }"
                v-on:click.prevent="togglePlayback"
                :title="playing ? 'Pause' : 'Play'"
            >
                <!-- PLAY/PAUSE -->
                <span class="icon">
                    <i class="mdi mdi-24px">
                        <svg
                            style="width: 24px; height: 24px"
                            viewBox="0 0 24 24"
                        >
                            <path
                                v-if="!playing"
                                fill="currentColor"
                                d="M8,5.14V19.14L19,12.14L8,5.14Z"
                            />

                            <path
                                v-else
                                fill="currentColor"
                                d="M14,19H18V5H14M6,19H10V5H6V19Z"
                            />
                        </svg>
                    </i>
                </span>
            </button>
        </p>
        <!-- The seek bar -->
        <div
            :class="{
                'player-seekbar': true,
                'player-playing-indication': playing,
            }"
        >
            <div class="player-timeline">
                <div :style="progressStyle" class="player-progress"></div>
                <div
                    v-on:click="seekByClick"
                    class="player-seeker"
                    title="Seek"
                ></div>
                <div class="player-time">
                    <div class="player-time-current">
                        {{ convertToDisplayTime(currentSeconds) }}
                    </div>
                    <div class="player-time-total">
                        {{ convertToDisplayTime(durationSeconds) }}
                    </div>
                </div>
            </div>
        </div>
        <!-- Download (do not show on small devices) -->
        <p class="control is-hidden-mobile">
            <button
                class="button"
                v-show="!showVolume"
                v-on:click.prevent="download"
                title="Download"
            >
                <!-- DOWNLOAD -->
                <span class="icon">
                    <i class="mdi mdi-24px">
                        <svg
                            style="width: 24px; height: 24px"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z"
                            />
                        </svg>
                    </i>
                </span>
            </button>
        </p>
        <!-- Loop -->
        <p class="control">
            <button
                :class="{
                    button: true,
                }"
                v-show="!showVolume"
                v-on:click.prevent="looping = !looping"
                title="Loop"
            >
                <!-- LOOP -->
                <!-- //TODO See also "looping once" icon -->
                <span class="icon">
                    <i class="mdi mdi-24px">
                        <svg
                            style="width: 24px; height: 24px"
                            viewBox="0 0 24 24"
                        >
                            <path
                                v-if="!looping"
                                fill="currentColor"
                                d="m 7,17 h 10 v -3 l 4,4 -4,4 V 19 H 5 v -6 h 2"
                            />
                            <path
                                v-else
                                fill="currentColor"
                                d="M17,17H7V14L3,18L7,22V19H19V13H17M7,7H17V10L21,6L17,2V5H5V11H7V7Z"
                            />
                        </svg>
                    </i>
                </span>
            </button>
        </p>
        <!-- Mute (do not show on small devices, user still can use the volume) -->
        <p class="control is-hidden-mobile">
            <button
                :class="{
                    button: true,
                }"
                v-show="!showVolume"
                v-on:click.prevent="mute"
                title="Mute"
            >
                <!-- MUTE -->
                <span class="icon">
                    <i class="mdi mdi-24px">
                        <svg
                            style="width: 24px; height: 24px"
                            viewBox="0 0 24 24"
                        >
                            <path
                                v-if="!muted"
                                fill="currentColor"
                                d="M7,9V15H11L16,20V4L11,9H7Z"
                            />
                            <path
                                v-else
                                fill="currentColor"
                                d="M5.64,3.64L21.36,19.36L19.95,20.78L16,16.83V20L11,15H7V9H8.17L4.22,5.05L5.64,3.64M16,4V11.17L12.41,7.58L16,4Z"
                            />
                        </svg>
                    </i>
                </span>
            </button>
        </p>
        <!-- Volume (do not show on small devices, user still can use the device volume) -->
        <p class="control is-hidden-mobile">
            <button
                :class="{
                    button: true,
                }"
                v-on:click.prevent=""
                v-on:mouseenter="showVolume = true"
                v-on:mouseleave="showVolume = false"
                :title="volumeTitle"
            >
                <!-- VOLUME -->
                <span class="icon">
                    <i class="mdi mdi-24px">
                        <svg
                            style="width: 24px; height: 24px"
                            viewBox="0 0 24 24"
                        >
                            <path
                                fill="currentColor"
                                d="M 18,18 H 6 C 18,6 6,18 18,6 Z"
                            />
                        </svg>
                    </i>
                </span>
                <input
                    v-model.lazy.number="volume"
                    v-show="showVolume"
                    class="player-volume"
                    type="range"
                    min="0"
                    max="100"
                />
            </button>
        </p>
    </div>
</template>

<script lang="ts">
import { MutationTypes } from '@/store/mutation-types';
import { defineComponent } from 'vue';

/** A simple vue audio player, for a single track, using the Web Audio API
 * @remarks Repeatedly emits 'timeupdate' with the current playback time, during playing
 * @remarks Emits 'trackLoaded' with the track duration in seconds, once after successful load of the track's media file
 */
export default defineComponent({
    name: 'TrackAudioApiPlayer',
    emits: ['timeupdate', 'trackLoaded'],
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
    }),
    /** Handles the setup of the audio graph outside the mounted lifespan.
     * @devdoc The audio element is intentionally not added to the DOM, to keep it unaffected of unmounts during vue-router route changes.
     */
    created() {
        console.debug(`TrackAudioApiPlayer::created`);

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
        console.debug(`TrackAudioApiPlayer::unmounted`);

        //properly desctroy the audio element and the audio context
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
        /** Watch whether the player state changed, and then update the audio element accordingly  */
        playing(value): Promise<void> | undefined {
            if (value) {
                return this.audioElement.play();
            }
            this.audioElement.pause();
        },
        /** Watch whether the volume changed, and then update the audio element accordingly  */
        volume(): void {
            this.audioElement.volume = this.volume / 100;
        },
        /** Watch whether the looping changed, and then update the audio element accordingly  */
        looping(): void {
            console.debug(
                `TrackAudioApiPlayer(${this.title})::looping:${this.looping}`,
            );
            this.audioElement.loop = this.looping;
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

                return (this.playing = this.autoPlay);
            }

            throw new Error('Failed to load sound file.');
        },
        mute() {
            console.debug(`TrackAudioApiPlayer(${this.title})::mute`);
            if (this.muted) {
                return (this.volume = this.previousVolume);
            }

            this.previousVolume = this.volume;
            this.volume = 0;
        },
        seekByClick(e: MouseEvent) {
            console.debug(`TrackAudioApiPlayer(${this.title})::seekByClick`, e);
            if (!this.loaded) return;

            const bounds = (e.target as HTMLDivElement).getBoundingClientRect();
            const seekPos = (e.clientX - bounds.left) / bounds.width;

            this.audioElement.currentTime =
                this.audioElement.duration * seekPos;
        },
        stop() {
            console.debug(`TrackAudioApiPlayer(${this.title})::stop`);
            this.playing = false;
            this.audioElement.currentTime = 0;
            this.$store.commit(MutationTypes.UPDATE_SELECTED_CUE_ID, undefined);
        },
        togglePlayback() {
            console.debug(`TrackAudioApiPlayer(${this.title})::togglePlayback`);
            this.playing = !this.playing;
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
        /** Pauses playback, keeping the position at the current position */
        pause() {
            console.debug(`TrackAudioApiPlayer(${this.title})::pause`);
            this.playing = false;
        },
        /** Updates the current seconds display and emits an event with the temporal position of the player
         * @devdoc This must get only privately called from the audio player
         */
        updateTime(/*event: Event*/) {
            //console.debug(`TrackAudioApiPlayer(${this.title})::updateTime:e`, e);
            this.currentSeconds = this.audioElement.currentTime;
            this.$emit('timeupdate', this.currentSeconds);
        },
        /** Starts playback from the given temporal position */
        playFrom(position: number): void {
            console.debug(
                `TrackAudioApiPlayer(${this.title}):playFrom:position`,
                position,
            );
            this.seekTo(position);
            this.playing = true;
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
