<template>
    <button
        :class="{
            button: true,
            'is-multiline': true,
            'has-text-left': true,
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
                    'player-progress-full':
                        hasCuePassed ||
                        (percentComplete !== null && percentComplete >= 100),
                    'player-progress-none':
                        isCueAhead ||
                        (percentComplete !== null && percentComplete <= 0),
                }"
                :style="progressStyle"
            ></span>

            <span class="icon is-hidden-mobile foreground"> ▶ </span>
            <span class="has-text-weight-semibold foreground">{{
                cue?.Description
            }}</span>

            <br />

            <span class="has-opacity-half foreground">
                {{ minutes }}:{{ twoDigitSeconds }}
            </span>

            <!-- Use a fixed right position for Shortcuts, to keep them as much out of visibilty as possible -->
            <!-- <span
                class="
                    tag
                    is-warning is-light is-outlined
                    foreground
                    has-opacity-third
                    is-pulled-right
                "
                >{{ cue?.Shortcut }}</span
            > -->
            <!-- spacer -->
            &nbsp; &nbsp;
            <span class="has-opacity-half foreground is-pulled-right"
                >[{{ cue?.Shortcut }}]</span
            >
        </span>
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
            console.debug('CueButton::invokeCue:event', event);
            // `this` inside methods points to the current active instance
            // `event` is the native DOM event
            if (event) {
                this.$store.commit(MutationTypes.UPDATE_CURRENT_CUE, this.cue);
            }
        },
    },
    computed: {
        /** The playback progress in the current cue, in [percent], or null if not appliccable */
        percentComplete(): number | null {
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
            return null;
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
/* //TODO later put these into a scss file for player and progress */
.player-timeline .player-progress {
    /* Smooth psrogress shade, with no visible border or slider line */
    /** similar to has-opacity-third */
    background-color: rgba(0, 0, 0, 0.33);
    border-right-width: 1px;
    border-right-color: black;
    border-right-style: solid;

    /* Progress shade to appear inside button area (creates outlined style)  */
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
}

.player-timeline .player-progress.player-progress-full {
    /* 100% Progress shade to appear inside button area (creates outlined style)  */
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    border-right: none;
}
.player-timeline .player-progress.player-progress-none {
    border-right: none;
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

/** A standrd-sized cue button only has a small left/right padding */
button {
    padding-left: 8px;
    padding-right: 8px;
}
</style>
