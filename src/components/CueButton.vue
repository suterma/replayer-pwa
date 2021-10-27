<template>
    <button
        :class="{
            button: true,
            'is-multiline': true,
            'has-text-left': true,
            'is-warning': !isCueSelected,
            'is-success': isCueSelected,
        }"
        :id="'cue-' + cue.Id"
        :title="'Play from ' + cue.Description"
    >
        <span class="player-timeline">
            <!-- first line -->
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
            <!-- second line -->
            <span class="has-opacity-half foreground">
                {{ convertToDisplayTime }}
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

/** A button for displaying and invoking a cue
 * @remarks Shows playback progress with an inline progress bar
 */
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
    computed: {
        /** The playback progress within this cue, in [percent], or null if not appliccable */
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
        /** Returns the progress as width style, for use as a css style set, dynamically depending on the actual progress in the cue duration
         * @devdoc max-width makes sure, the progress bar never overflows the given space.
         */
        progressStyle(): any {
            return {
                width: `calc(${this.percentComplete}%)`,
                'max-width': '100%',
            };
        },
        /** Converts the cue's total seconds into a conveniently displayable hh:mm:ss.s format.
         * @remarks Omits the hour part, if not appliccable
         */
        convertToDisplayTime(): string | null {
            const seconds = this.cue?.Time;
            if (seconds != null) {
                //Uses the hour, minute, seconds, and 1 digit of the milliseconds part
                const hhmmss = new Date(seconds * 1000)
                    .toISOString()
                    .substr(11, 10);
                //skip the hour part, if not used
                return hhmmss.indexOf('00:') === 0 ? hhmmss.substr(3) : hhmmss;
            } else {
                return null;
            }
        },
        /** Determines whether this cue is currently selected
         * @remarks Note: only one cue in a compilation may be selected */
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
    /* Smooth progress shade, with no visible border or slider line */
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
}

/** Allows to show elements in front of the player-progress background span
   * @devdoc Otherwise, due to unknown reasons, these elements would be shown behind the progress shade, regardless of that they are defined after the progress shade.
   */
.player-timeline .foreground {
    /* //TODO maybe use a similar css directly on the the audio player progress to have the progress bar behind the text there, too */
    position: relative;
    z-index: 2;
}

/** A standard-sized cue button only should have a small left/right padding, to save real estate and to look better */
.button {
    padding-left: 8px;
    padding-right: 8px;
}
</style>
