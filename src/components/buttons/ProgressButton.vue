<template>
    <button
        :class="{
            button: true,
        }"
        :title="'Progress ' + progress + '%'"
    >
        <!-- Use the full width of the button for the inside content
        This causes the icon and description to start from the left side, 
        representing the begin of the cue, which suits the intention -->
        <span class="player-timeline is-fullwidth">
            <!-- Progress -->
            <span
                :class="{
                    'player-progress': true,
                    'player-progress-full': progress >= 100,
                    'player-progress-none': progress <= 0,
                }"
                :style="progressStyle"
            ></span>
            <!-- first line (Do not use a level here, this has only complicated things for smaller widths so far)-->
            <BaseIcon name="play" v-if="!isTrackPlaying" class="foreground" />
            <BaseIcon name="skip-next" v-else class="foreground" />

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
                            <!-- Use a right position for Durations, to keep them as much out of visibility as possible -->
                            <span class="has-opacity-half foregrounds">{{
                                cueDurationDisplayTime
                            }}</span>
                        </p>
                        <p class="level-item" v-if="cue?.Shortcut">
                            <!-- Use a fixed right position for Shortcuts, to keep them as much out of visibility as possible -->
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
import { defineComponent, StyleValue } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';

/** A button with an inline progress bar
 * @remarks Can be used to show playback progress
 */
export default defineComponent({
    name: 'ProgressButton',
    components: { BaseIcon },
    props: {
        /** The progress, in [percent], or null if not applicable
         * @remarks This is used for progress display within the set of cues
         */
        progress: {
            type: Number,
            required: false,
            default: null,
        },
    },
    computed: {
        /** The width offset for the progress-bar
         * @remarks this allows to dynamically offset for the width of the progress bar in [em] during cue completion
         * @devdoc The width is defined in CSS
         */
        progressBarWidthOffset(): number {
            if (this.progress) {
                return (
                    ((100 - this.progress) / 100) *
                    0.3 /* value in [em], as defined in CSS */
                );
            }
            return 0; //by default
        },

        /** Returns the progress as width style, for use as a css style set, dynamically
         * depending on the actual progress in the cue duration
         * @devdoc max-width makes sure, the progress bar never overflows the given space.
         */
        progressStyle(): StyleValue {
            if (this.progress !== null) {
                if (this.progress >= 0 && this.progress <= 100) {
                    //show the progress according to the percentage available
                    return {
                        width: `calc(${this.progress}% +
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
    /** don't use a relative position */
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
