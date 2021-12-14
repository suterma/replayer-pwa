<template>
    <div class="field has-addons player-panel" v-if="!this.loaded">
        <p class="control">
            <button class="button is-loading">
                <!-- loading -->
                <span class="icon">
                    <i class="mdi mdi-24px">
                        <svg
                            style="width: 24px; height: 24px"
                            viewBox="0 0 24 24"
                        ></svg>
                    </i>
                </span>
            </button>
        </p>
        <!-- An empty player with a seekbar/timeline as placeholder -->
        <div class="player-seekbar">
            <div class="player-timeline">
                <div class="player-time">
                    <div class="player-time-current is-unselectable">
                        Loading media...
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="field has-addons player-panel" v-else>
        <!-- Play/Pause (Only available when the track is loaded, and no playback request is outstanding) -->
        <p class="control">
            <button
                :class="{
                    button: true,
                    disabled: this.isPlayingRequestOutstanding || !this.loaded,
                    'is-loading':
                        this.isPlayingRequestOutstanding || !this.loaded,
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
                    <div class="player-time-current is-unselectable">
                        {{ convertToDisplayTime(currentSeconds) }}
                    </div>
                    <div class="player-time-total is-unselectable">
                        {{ convertToDisplayTime(durationSeconds) }}
                    </div>
                </div>
            </div>
        </div>
        <!-- Loop -->
        <p class="control">
            <button
                :class="{
                    button: true,
                }"
                v-show="!showVolume"
                v-on:click.prevent="toggleLooping"
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
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** A UI representation for a media player
 */
export default defineComponent({
    name: 'PlayerChromeMini',
    components: {},
    emits: [
        'stop',
        'update:playing',
        'update:looping',
        'update:currentSeconds',
        'update:volume',
        'update:muted',
        'seek',
        'download',
        'mute',
    ],
    props: {
        title: String,
        /** Whether the media file is loaded
         * @remarks Controls the display of the player, to hint the track availability
         */
        loaded: {
            type: Boolean,
            default: false,
        },
        /** The playback progress in the current track, in [seconds]
         * @remarks Implements a two-way binding. Alternatively you can use the seek event
         * to handle a seek */
        currentSeconds: {
            type: Number,
            default: null,
        },
        /** The duration of the current track, in [seconds]
         * @remarks This is only available after successful load of the media file
         */
        durationSeconds: {
            type: Number,
            default: null,
        },
        /** The volume in [percent]
         * @remarks Implements a two-way binding */
        volume: {
            type: Number,
            default: 50,
        },
        /** Whether the player is currently playing
         * @remarks Implements a two-way binding */
        playing: {
            type: Boolean,
            default: false,
        },
        /** Whether the player is currently playing
         * @remarks Implements a two-way binding */
        looping: {
            type: Boolean,
            default: false,
        },
        /** Whether the player is currently muted
         * @remarks Implements a two-way binding */
        muted: {
            type: Boolean,
            default: false,
        },
        /** Flags, whether a playing request is currently outstanding. This is true after a play request was received, for as long
         * as playback has not yet started.
         * @devdoc See https://developers.google.com/web/updates/2017/06/play-request-was-interrupted for more information
         */
        isPlayingRequestOutstanding: {
            type: Boolean,
            default: false,
        },
    },
    data: () => ({
        showVolume: false,
    }),

    computed: {
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
            this.$emit('download');
        },
        seekByClick(e: MouseEvent) {
            console.debug(`PlayerChrome(${this.title})::seekByClick`, e);
            if (!this.loaded) return;

            const bounds = (e.target as HTMLDivElement).getBoundingClientRect();
            const seekPos = (e.clientX - bounds.left) / bounds.width;

            const seekTime = this.durationSeconds * seekPos;
            this.$emit('update:currentSeconds', seekTime);
            this.$emit('seek', seekTime);
        },
        stop() {
            this.$emit('stop');
        },
        togglePlayback() {
            const playback = !this.playing;
            console.debug(
                `PlayerChrome(${this.title})::togglePlayback:playback:${playback}`,
            );
            this.$emit('update:playing', playback);
        },
        toggleLooping() {
            const looping = !this.looping;
            console.debug(
                `PlayerChrome(${this.title})::toggleLooping:looping:${looping}`,
            );
            this.$emit('update:looping', looping);
        },
        toggleMuted() {
            const muted = !this.muted;
            console.debug(
                `PlayerChrome(${this.title})::toggleMuted:muted:${muted}`,
            );
            this.$emit('update:muted', muted);
            this.$emit('mute', muted);
        },
    },
});
</script>
<style scoped></style>
