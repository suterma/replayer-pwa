<template>
    <button
        :class="{
            button: true,
            'is-warning': !isCueSelected,
            'is-success': isCueSelected,
        }"
        @click="invokeCue"
        :title="'Play from ' + cue?.Description"
    >
        <span class="player-timeline">
            <span
                :class="{
                    'player-progress': true,
                    'has-opacity-third': true,
                    'player-progress-full': hasCuePassed,
                }"
                :style="progressStyle"
            ></span>

            <span class="icon is-hidden-mobile foreground"> ▶ </span>
            <span class="has-text-weight-semibold foreground">{{
                cue?.Description
            }}</span>
            <!-- On small devices, hide the informational time stamp to save screen real estate -->
            <span class="is-hidden-mobile">
                &nbsp;
                <span class="has-opacity-half foreground">
                    {{ minutes }}:{{ twoDigitSeconds }}
                </span>
            </span>
        </span>
        <!-- On touch devices, the key shortcuts are probably not used, thus hide them to save screen real estate -->
        <!-- //TODO Cue shortcuts are currently not yet supported, so do not show them at all now -->
        <!-- <span class="is-hidden-touch">
            &nbsp;&nbsp;
            <span class="tag is-warning is-light">{{ cue?.Shortcut }}</span>
        </span> -->
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Cue } from '@/store/compilation-types';
import { MutationTypes } from '@/store/mutation-types';

export default defineComponent({
    name: 'CueButton',
    components: {},
    props: {
        cue: Cue,
        /** The playback progress in the current track, in [seconds]
         * @remarks This is used for progress display within the set of cues
         */
        currentSeconds: Number,
    },
    methods: {
        invokeCue(event: Event) {
            // `this` inside methods points to the current active instance
            // `event` is the native DOM event
            if (event) {
                this.$emit('click');
                this.$store.commit(MutationTypes.UPDATE_CURRENT_CUE, this.cue);
            }
        },
    },
    computed: {
        /** The playback progress in the current cue, in [percent] */
        percentComplete(): number {
            if (this.hasCuePassed) {
                return 100; //percent
            }
            if (this.isCueAhead) {
                return 0; //percent
            }
            if (this.currentSeconds !== undefined) {
                if (
                    this.cue &&
                    this.cue.Time !== null &&
                    this.cue.Duration !== null
                ) {
                    return (
                        (100 / this.cue.Duration) *
                        (this.currentSeconds - this.cue.Time)
                    );
                }
            }
            return 50; //percent
        },
        /** Returns the progress style, dynamically depending on the actual progress in the cue duration
         * max-width makes sure, the progress bar never overflows the given space.
         */
        progressStyle(): any {
            return {
                width: `calc(${this.percentComplete}%)`,
                'max-width': '100%',
            };
        },
        /** Gets the whole minutes of the timestamp  */
        minutes(): number | null {
            if (this.cue && this.cue?.Time != null) {
                var minutes = Math.floor(this.cue.Time / 60);
                return minutes;
            }
            return null;
        },

        /** Gets the rounded seconds (without whole minutes) of the timestamp  */
        seconds(): number | null {
            if (this.minutes != null && this.cue && this.cue?.Time != null) {
                var seconds = Math.round(this.cue?.Time - this.minutes * 60);
                return seconds;
            }
            return null;
        },

        /** Gets a string representation of the seconds part, with 2 digits fixed
         * @devdoc Makes sure, that nothing is shown for actual null values
         */
        twoDigitSeconds(): string {
            if (this.seconds != null) {
                return this.seconds.toLocaleString('en-US', {
                    minimumIntegerDigits: 2,
                    useGrouping: false,
                });
            } else return '';
        },
        /* Determines whether this cue is currently selected */
        isCueSelected(): boolean {
            return this.$store.getters.selectedCue?.Id == this.cue?.Id;
        },
        /* Determines whether playback of this cue has already passed */
        hasCuePassed(): boolean {
            if (this.currentSeconds !== undefined) {
                if (
                    this.cue &&
                    this.cue.Time !== null &&
                    this.cue.Duration !== null
                ) {
                    return (
                        this.cue.Time + this.cue.Duration < this.currentSeconds
                    );
                }
            }
            return false;
        },
        /* Determines whether playback of this cue has not yet started */
        isCueAhead(): boolean {
            if (this.currentSeconds !== undefined) {
                if (
                    this.cue &&
                    this.cue.Time !== null &&
                    this.cue.Duration !== null
                ) {
                    return this.currentSeconds < this.cue.Time;
                }
            }
            return false;
        },
    },
});
</script>
<style scoped>
.player-timeline .player-progress {
    /* Smooth psrogress shade, with no visible border or slider line */
    background-color: black;
    border-right-width: 1px;
    border-right-color: transparent;
    border-right-style: solid;

    /* Progress shade to appear inside button area (creates outlined style)  */
    border-right-style: none;
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
}

.player-timeline .player-progress.player-progress-full {
    /* 100% Progress shade to appear inside button area (creates outlined style)  */
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
}

.player-timeline {
    /** dont use a relative position */
    position: unset;
    /* z-index: 0 important!; */
}
/* //TODO cleanup : remove z-index if possible
use the positilon relative also direclty on the the audio player to have a better slider
make the button edges pretty by applying special styles for 0 and 100% progress on the buttons
 */
.foreground {
    position: relative;
    z-index: 2;
}
</style>
