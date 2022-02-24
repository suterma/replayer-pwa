<template>
    <button
        :class="{
            button: true,
            cue: true,
            'is-multiline': !isMinified,
            'has-text-left': 'true',
            'is-warning': !isCueSelected,
            'is-success': isCueSelected,
        }"
        :id="'cue-' + cue.Id"
        :title="'Play from ' + cue.Description"
    >
        <span class="player-timeline is-fullwidth">
            <!-- Progress -->
            <span
                :class="{
                    'player-progress': true,
                    'player-progress-full': this.hasCuePassed,
                    'has-addons-right': this.hasAddonsRight,
                    'player-progress-none': this.isCueAhead,
                }"
                :style="progressStyle"
            ></span>
            <!-- first line (Do not use a level here, this has only complicated things for smaller widths so far)-->
            <Icon name="play" v-if="!isTrackPlaying" class="foreground" />
            <Icon name="skip-next" v-else class="foreground" />

            <template v-if="!isMinified">
                &nbsp;
                <span class="has-text-weight-semibold foreground">{{
                    cue?.Description
                }}</span>

                <br />
                <!-- second line (use a horizontal level also on mobile)-->
                <span class="level is-mobile">
                    <!-- Left side -->
                    <div class="level-left">
                        <div class="level-item mr-3">
                            <span class="has-opacity-half foreground">
                                {{ cueDisplayTime }}
                            </span>
                        </div>
                    </div>

                    <!-- Right side -->
                    <div class="level-right">
                        <p class="level-item is-hidden-touch mr-3">
                            <!-- Use a right position for Durations, to keep them as much out of visibilty as possible -->
                            <span class="has-opacity-half foregrounds">{{
                                cueDurationDisplayTime
                            }}</span>
                        </p>
                        <p class="level-item" v-if="cue?.Shortcut">
                            <!-- Use a fixed right position for Shortcuts, to keep them as much out of visibilty as possible -->
                            <span
                                class="tag is-warning is-light is-outlined foreground has-opacity-third is-family-monospace"
                                >{{ cue?.Shortcut }}</span
                            >
                        </p>
                    </div>
                </span>
            </template>
        </span>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Cue } from '@/store/compilation-types';
import CompilationHandler from '@/store/compilation-handler';
import Icon from '@/components/icons/Icon.vue';

/** A button for displaying and invoking a cue
 * @remarks Shows playback progress with an inline progress bar
 * @remarks Supports a default, two-line display with icon, description and other indications, as well as a minified, icon-only, variant.
 */
export default defineComponent({
    name: 'CueButton',
    components: { Icon },
    props: {
        cue: {
            type: Cue,
            required: true,
        },
        /** The playback progress in the current track, in [seconds]
         * @remarks This is used for progress display within the set of cues
         */
        currentSeconds: Number,

        /** Indicates whether the associated Track is currently playing
         * @remarks This is used to depict the expected acktion on button press. While playing, this is pause, and vice versa.
         */
        isTrackPlaying: Boolean,
        /** Whether the button is shown in a minified, single-line, icon only, variant.
         * @remarks This is currently used for the edit mode.
         */
        isMinified: {
            type: Boolean,
            required: false,
            default: false,
        },
        /** Whether the button has addons at it's right side. This determines progress bar styling.
         * @remarks The progress bar radius at the right side must be removed for fully progressed cues.
         */
        hasAddonsRight: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    computed: {
        /** The playback progress within this cue, in [percent], or null if not appliccable */
        percentComplete(): number {
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
            return 0;
        },

        /** The width offset for the progress-bar
         * @remarks this allows to dynamically offset for the width of the progress bar in [em] during cue completion
         * @devdoc The width is defined in CSS
         */
        progressBarWidthOffset(): number {
            return (
                ((100 - this.percentComplete) / 100) *
                0.3 /* value in [em], as defined in CSS */
            );
        },

        /** Returns the progress as width style, for use as a css style set, dynamically depending on the actual progress in the cue duration
         * @devdoc max-width makes sure, the progress bar never overflows the given space.
         */
        progressStyle(): Record<string, unknown> {
            if (this.percentComplete !== null) {
                if (this.percentComplete >= 0 && this.percentComplete <= 100) {
                    //show the progress according to the percentage available
                    return {
                        width: `calc(${this.percentComplete}% +
                     ${this.progressBarWidthOffset}em)`,
                        'max-width': '100%',
                    };
                } else {
                    return {};
                }
            } else {
                //percentage is undefined, thus hide the progress
                return {
                    display: `none`,
                };
            }
        },
        /** Converts the cue's total seconds into a conveniently displayable hh:mm:ss.s format.
         * @remarks Omits the hour part, if not appliccable
         */
        cueDisplayTime(): string {
            return CompilationHandler.convertToDisplayTime(this.cue.Time);
        },
        /** Converts the cue's duration into a conveniently displayable hh:mm:ss.s format.
         * @remarks Omits the hour part, if not appliccable
         */
        cueDurationDisplayTime(): string {
            return CompilationHandler.convertToDisplayTime(this.cue.Duration);
        },
        /** Determines whether this cue is currently selected
         * @remarks Note: only one cue in a compilation may be selected */
        isCueSelected(): boolean {
            return this.$store.getters.selectedCueId == this.cue?.Id;
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
                        this.cue.Time + this.cue.Duration <= this.currentSeconds
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
/* Button progress-styles, in addition to player progress styles, that support also full/none progress specifically */
.player-timeline .player-progress {
    /* Progress shade to appear inside button area (creates outlined style)  */
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
}

/** The current position has already fully passed this cue button (including it's duration) */
.player-timeline .player-progress.player-progress-full {
    /* 100% Progress shade to appear inside button area (creates outlined style)  */
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    border-right: none;
    width: 100%;
}

/** The current position has already fully passed this cue button (with addons assumed at the right side, thus omit the radius) */
.player-timeline .player-progress.player-progress-full.has-addons-right {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

/** The current position has not yet reached this cue button */
.player-timeline .player-progress.player-progress-none {
    border-right: none;
    width: 0;
}

.player-timeline {
    /** dont use a relative position */
    position: unset;
}

/** A standard-sized cue button only should have a small left/right padding, to save real estate and to look better */
.button {
    padding-left: 8px;
    padding-right: 8px;
}

/* The content of a cue button should be full width */
.cue.button .is-fullwidth {
    width: 100%;
}

/** Align the items in a line of the button vertically centered
(similar to the level class, but without content justification) */
.level-line {
    align-items: center;
    /* justify-content: stretch; */
}
</style>
