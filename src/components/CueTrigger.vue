<template>
    <!-- Placeholder for an unloaded track -->
    <div class="field has-addons player-panel" v-if="!this.loaded">
        <p class="control">
            <button class="button">
                <Icon name="empty" />
            </button>
        </p>
        <p class="control">
            <button class="button is-loading">
                <Icon name="empty" />
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
    <!-- Playback control when the track is loaded -->
    <div v-else class="field has-addons player-panel">
        <!-- Play/Pause (Only available when the track is loaded, and no playback request is outstanding) -->
        <p class="control">
            <button
                :class="{
                    button: true,
                    disabled: this.isPlayingRequestOutstanding || !this.loaded,
                    'is-loading':
                        this.isPlayingRequestOutstanding || !this.loaded,
                }"
                @click.prevent="togglePlayback"
                :title="playing ? 'Pause' : 'Play'"
            >
                <Icon v-if="playing" name="pause" />
                <Icon v-else name="play" />
            </button>
        </p>
        <!-- The seek bar -->
        <div
            :class="{
                'player-seekbar': true,
            }"
        >
            <div class="player-timeline">
                <div :style="progressStyle" class="player-progress"></div>
                <div
                    @click="seekByClick"
                    class="player-seeker"
                    title="Seek"
                ></div>
                <div class="player-time is-unselectable foreground">
                    <div
                        :class="{
                            'player-time-current': true,
                            'player-playing-indication': playing,
                        }"
                    >
                        {{ currentDisplayTime }}
                    </div>
                    <div class="player-time-total is-unselectable foreground">
                        {{ durationDisplayTime }}
                    </div>
                </div>
            </div>
        </div>
        <!-- Create Cue -->
        <p class="control">
            <button
                :class="{
                    button: true,
                    'is-warning': true,
                }"
                @click.prevent="this.$emit('newCueTriggered')"
                title="Create a cue now (at the current position)!"
            >
                <Icon name="plus" />
                <span> Create Cue!</span>
            </button>
        </p>
        <!-- Handle the insert key as trigger for a nue cue Handle the insert key as  trigger for a nue cue -->
        <GlobalEvents @keydown.prevent.insert="this.$emit('newCueTriggered')" />
    </div>
</template>

<script lang="ts">
import CompilationHandler from '@/store/compilation-handler';
import { defineComponent } from 'vue';
import { GlobalEvents } from 'vue-global-events';
import Icon from '@/components/icons/Icon.vue';

/** A UI representation for a media player
 * @remarks Handles and emits various states and event for playback control.
 */
export default defineComponent({
    name: 'CueTrigger',
    components: { GlobalEvents, Icon },
    emits: [
        'update:playing',
        'update:currentSeconds',
        'seek',
        /** Emitted, when the represents the playing state
         * @remarks This is emitted in conjunction with the 'update:playing' event
         */
        'play',
        /** Emitted, when the represents the paused state
         * @remarks This is emitted in conjunction with the 'update:playing' event
         */
        'pause',
        'newCueTriggered',
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
        /** Whether the player is currently playing
         * @remarks Implements a two-way binding */
        playing: {
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
    data: () => ({}),

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
        /** Converts the current time into a conveniently displayable hh:mm:ss.s format.
         * @remarks Omits the hour part, if not appliccable
         */
        currentDisplayTime(): string {
            return CompilationHandler.convertToDisplayTime(this.currentSeconds);
        },
        /** Converts the track duration into a conveniently displayable hh:mm:ss.s format.
         * @remarks Omits the hour part, if not appliccable
         */
        durationDisplayTime(): string {
            return CompilationHandler.convertToDisplayTime(
                this.durationSeconds,
            );
        },
    },
    methods: {
        seekByClick(e: MouseEvent) {
            console.debug(`CueTrigger(${this.title})::seekByClick`, e);
            if (!this.loaded) return;

            const bounds = (e.target as HTMLDivElement).getBoundingClientRect();
            const seekPos = (e.clientX - bounds.left) / bounds.width;

            const seekTime = this.durationSeconds * seekPos;
            this.$emit('update:currentSeconds', seekTime);
            this.$emit('seek', seekTime);
        },

        togglePlayback() {
            const playback = !this.playing;
            console.debug(
                `CueTrigger(${this.title})::togglePlayback:playback:${playback}`,
            );
            this.$emit('update:playing', playback);
            if (playback) {
                this.$emit('play');
            } else {
                this.$emit('pause');
            }
        },
    },
});
</script>
<style scoped></style>
