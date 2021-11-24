<template>
    <div class="field has-addons player-panel">
        <!-- Stop (do not show on small devices, user still can use play/pause) -->
        <p class="control is-hidden-mobile">
            <button
                :class="{
                    button: true,
                    'has-border-success': playing,
                }"
                v-on:click.prevent="stop"
                title="Stop"
            >
                <span class="icon">
                    <i>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fill="currentColor"
                                d="M16,4.995v9.808C16,15.464,15.464,16,14.804,16H4.997C4.446,16,4,15.554,4,15.003V5.196C4,4.536,4.536,4,5.196,4h9.808C15.554,4,16,4.446,16,4.995z"
                            /></svg
                    ></i>
                </span>
            </button>
        </p>
        <p class="control">
            <button
                :class="{
                    button: true,
                    'is-success': playing,
                }"
                v-on:click.prevent="togglePlayback"
                :title="playing ? 'Pause' : 'Play'"
            >
                <span class="icon">
                    <i>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path
                                v-if="!playing"
                                fill="currentColor"
                                d="M15,10.001c0,0.299-0.305,0.514-0.305,0.514l-8.561,5.303C5.51,16.227,5,15.924,5,15.149V4.852c0-0.777,0.51-1.078,1.135-0.67l8.561,5.305C14.695,9.487,15,9.702,15,10.001z"
                            />
                            <path
                                v-else
                                fill="currentColor"
                                d="M15,3h-2c-0.553,0-1,0.048-1,0.6v12.8c0,0.552,0.447,0.6,1,0.6h2c0.553,0,1-0.048,1-0.6V3.6C16,3.048,15.553,3,15,3z M7,3H5C4.447,3,4,3.048,4,3.6v12.8C4,16.952,4.447,17,5,17h2c0.553,0,1-0.048,1-0.6V3.6C8,3.048,7.553,3,7,3z"
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
                'has-border-success': playing,
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
                    <div class="player-time-total is-hidden-mobile">
                        {{ convertToDisplayTime(durationSeconds) }}
                    </div>
                </div>
            </div>
        </div>
        <!-- Download (do not show on small devices) -->
        <p class="control is-hidden-mobile">
            <button
                v-show="!showVolume"
                :class="{
                    button: true,
                    'has-border-success': playing,
                }"
                v-on:click.prevent="download"
                title="Download"
            >
                <span class="icon">
                    <i>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fill="currentColor"
                                d="M15,7h-3V1H8v6H5l5,5L15,7z M19.338,13.532c-0.21-0.224-1.611-1.723-2.011-2.114C17.062,11.159,16.683,11,16.285,11h-1.757l3.064,2.994h-3.544c-0.102,0-0.194,0.052-0.24,0.133L12.992,16H7.008l-0.816-1.873c-0.046-0.081-0.139-0.133-0.24-0.133H2.408L5.471,11H3.715c-0.397,0-0.776,0.159-1.042,0.418c-0.4,0.392-1.801,1.891-2.011,2.114c-0.489,0.521-0.758,0.936-0.63,1.449l0.561,3.074c0.128,0.514,0.691,0.936,1.252,0.936h16.312c0.561,0,1.124-0.422,1.252-0.936l0.561-3.074C20.096,14.468,19.828,14.053,19.338,13.532z"
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
                    'has-border-success': playing,
                }"
                v-show="!showVolume"
                v-on:click.prevent="looping = !looping"
                title="Loop"
            >
                <span class="icon">
                    <i>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path
                                v-if="!looping"
                                fill="currentColor"
                                d="M1,12V5h3v6h10V8l5,4.5L14,17v-3H3C1.895,14,1,13.104,1,12z"
                            />
                            <path
                                v-else
                                fill="currentColor"
                                d="M20,7v7c0,1.103-0.896,2-2,2H2c-1.104,0-2-0.897-2-2V7c0-1.104,0.896-2,2-2h7V3l4,3.5L9,10V8H3v5h14V8h-3V5h4C19.104,5,20,5.896,20,7z"
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
                    'has-border-success': playing,
                }"
                v-show="!showVolume"
                v-on:click.prevent="mute"
                title="Mute"
            >
                <span class="icon">
                    <i>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path
                                v-if="!muted"
                                fill="currentColor"
                                d="M5.312,4.566C4.19,5.685-0.715,12.681,3.523,16.918c4.236,4.238,11.23-0.668,12.354-1.789c1.121-1.119-0.335-4.395-3.252-7.312C9.706,4.898,6.434,3.441,5.312,4.566z M14.576,14.156c-0.332,0.328-2.895-0.457-5.364-2.928C6.745,8.759,5.956,6.195,6.288,5.865c0.328-0.332,2.894,0.457,5.36,2.926C14.119,11.258,14.906,13.824,14.576,14.156zM15.434,5.982l1.904-1.906c0.391-0.391,0.391-1.023,0-1.414c-0.39-0.391-1.023-0.391-1.414,0L14.02,4.568c-0.391,0.391-0.391,1.024,0,1.414C14.41,6.372,15.043,6.372,15.434,5.982z M11.124,3.8c0.483,0.268,1.091,0.095,1.36-0.388l1.087-1.926c0.268-0.483,0.095-1.091-0.388-1.36c-0.482-0.269-1.091-0.095-1.36,0.388L10.736,2.44C10.468,2.924,10.642,3.533,11.124,3.8z M19.872,6.816c-0.267-0.483-0.877-0.657-1.36-0.388l-1.94,1.061c-0.483,0.268-0.657,0.878-0.388,1.36c0.268,0.483,0.877,0.657,1.36,0.388l1.94-1.061C19.967,7.907,20.141,7.299,19.872,6.816z"
                            />
                            <path
                                v-else
                                fill="currentColor"
                                d="M14.201,9.194c1.389,1.883,1.818,3.517,1.559,3.777c-0.26,0.258-1.893-0.17-3.778-1.559l-5.526,5.527c4.186,1.838,9.627-2.018,10.605-2.996c0.925-0.922,0.097-3.309-1.856-5.754L14.201,9.194z M8.667,7.941c-1.099-1.658-1.431-3.023-1.194-3.26c0.233-0.234,1.6,0.096,3.257,1.197l1.023-1.025C9.489,3.179,7.358,2.519,6.496,3.384C5.568,4.31,2.048,9.261,3.265,13.341L8.667,7.941z M18.521,1.478c-0.39-0.391-1.023-0.391-1.414,0L1.478,17.108c-0.391,0.391-0.391,1.024,0,1.414c0.391,0.391,1.023,0.391,1.414,0l15.629-15.63C18.912,2.501,18.912,1.868,18.521,1.478z"
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
                    'has-border-success': playing,
                }"
                v-on:click.prevent=""
                v-on:mouseenter="showVolume = true"
                v-on:mouseleave="showVolume = false"
                :title="volumeTitle"
            >
                <span class="icon">
                    <i>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                        >
                            <path
                                fill="currentColor"
                                d="M19,13.805C19,14.462,18.462,15,17.805,15H1.533c-0.88,0-0.982-0.371-0.229-0.822l16.323-9.055C18.382,4.67,19,5.019,19,5.9V13.805z"
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
                `TrackAudioPlayer(${this.title})::looping:${this.looping}`,
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
            console.debug(`TrackAudioPlayer(${this.title})::download`);
            this.stop();
            window.open(this.src, 'download');
        },
        load() {
            console.debug(`TrackAudioPlayer(${this.title})::load`);
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
            console.debug(`TrackAudioPlayer(${this.title})::mute`);
            if (this.muted) {
                return (this.volume = this.previousVolume);
            }

            this.previousVolume = this.volume;
            this.volume = 0;
        },
        seekByClick(e: MouseEvent) {
            console.debug(`TrackAudioPlayer(${this.title})::seekByClick`, e);
            if (!this.loaded) return;

            const bounds = (e.target as HTMLDivElement).getBoundingClientRect();
            const seekPos = (e.clientX - bounds.left) / bounds.width;

            this.audioElement.currentTime =
                this.audioElement.duration * seekPos;
        },
        stop() {
            console.debug(`TrackAudioPlayer(${this.title})::stop`);
            this.playing = false;
            this.audioElement.currentTime = 0;
            this.$store.commit(MutationTypes.UPDATE_SELECTED_CUE, undefined);
        },
        togglePlayback() {
            console.debug(`TrackAudioPlayer(${this.title})::togglePlayback`);
            this.playing = !this.playing;
        },
        /** Rewinds 1 second */
        rewindOneSecond() {
            console.debug(`TrackAudioPlayer(${this.title})::rewindOneSecond`);
            const time = this.audioElement.currentTime;
            this.audioElement.currentTime = time - 1;
        },
        /** Forwards 1 second */
        forwardOneSecond() {
            console.debug(`TrackAudioPlayer(${this.title})::forwardOneSecond`);
            const time = this.audioElement.currentTime;
            this.audioElement.currentTime = time + 1;
        },
        volumeDown() {
            this.volume = this.volume * 0.71;
            console.debug(
                `TrackAudioPlayer(${this.title})::volumeDown`,
                this.volume,
            );
        },
        volumeUp() {
            this.volume = Math.min(this.volume * 1.41, 100);
            console.debug(
                `TrackAudioPlayer(${this.title})::volumeUp`,
                this.volume,
            );
        },
        /** Pauses playback, keeping the position at the current position */
        pause() {
            console.debug(`TrackAudioPlayer(${this.title})::pause`);
            this.playing = false;
        },
        /** Updates the current seconds display and emits an event with the temporal position of the player
         * @devdoc This must get only privately called from the audio player
         */
        updateTime(/*event: Event*/) {
            //console.debug(`TrackAudioPlayer(${this.title})::updateTime:e`, e);
            this.currentSeconds = this.audioElement.currentTime;
            this.$emit('timeupdate', this.currentSeconds);
        },
        /** Starts playback from the given temporal position */
        playFrom(position: number): void {
            console.debug(
                `TrackAudioPlayer(${this.title}):playFrom:position`,
                position,
            );
            this.seekTo(position);
            this.playing = true;
        },
        /** Transports (seeks) the playback to the given temporal position */
        seekTo(position: number): void {
            console.debug(
                `TrackAudioPlayer(${this.title})::seekTo:position`,
                position,
            );
            this.audioElement.currentTime = position;
        },
    },
});
</script>
<style scoped></style>
