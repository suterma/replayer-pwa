<template>
    <button
        class="button cue has-text-left"
        :class="{
            'is-multiline': !isMinified,
            'is-warning': !isCueSelected,
            'is-success': isCueSelected,
        }"
        :id="'cue-' + cue.Id"
        :title="cueTitle"
    >
        <!-- Use the full width of the button for the inside content
        This causes the icon and description to start from the left side, 
        representing the begin of the cue, which suits the intention -->
        <span class="player-timeline is-fullwidth">
            <!-- Progress -->
            <span
                class="player-progress"
                :class="{
                    'player-progress-full': hasCuePassed,
                    'has-addons-right': hasAddonsRight,
                    'player-progress-none': isCueAhead,
                }"
                :style="progressStyle"
            ></span>
            <!-- first line (Do not use a level here, this has only complicated things for smaller widths so far)-->
            <BaseIcon
                :path="mdiPlay"
                v-if="!isTrackPlaying"
                class="foreground"
            />
            <BaseIcon :path="mdiPause" v-else class="foreground" />

            <slot></slot>

            <template v-if="!isMinified">
                <span class="ml-2 has-text-weight-semibold foreground">{{
                    cue?.Description
                }}</span></template
            >
            <template v-if="isCueLooping || isCuePlay">
                <BaseIcon
                    :path="mdiRepeatOnce"
                    v-if="isCueLooping"
                    class="ml-2 mr-2 foreground"
                />
                <BaseIcon
                    :path="mdiPlayCircleOutline"
                    v-if="isCuePlay"
                    class="ml-2 mr-2 foreground"
                />
            </template>
            <BaseIcon :path="''" v-else class="ml-2 mr-2 foreground" />

            <!-- second line, if not minified (use a horizontal level also on mobile)-->
            <template v-if="!isMinified">
                <br />
                <span class="level is-mobile">
                    <!-- Left side -->
                    <div class="level-left">
                        <div class="level-item mr-3">
                            <TimeDisplay
                                class="has-opacity-half foreground"
                                :modelValue="cue.Time"
                            ></TimeDisplay>
                        </div>
                    </div>

                    <!-- Right side -->
                    <div class="level-right">
                        <!-- For performance and layout reasons, only render this when used, on desktop and larger screens -->
                        <IfMedia query="(min-width: 1024px)">
                            <p class="level-item mr-3">
                                <!-- Use a right position for Durations, to keep them as much out of visibility as possible -->
                                <TimeDisplay
                                    class="has-opacity-half foreground"
                                    :modelValue="cue.Duration"
                                ></TimeDisplay>
                            </p>
                        </IfMedia>
                        <p class="level-item" v-if="cue?.Shortcut">
                            <!-- Use a fixed right position for Shortcuts, to keep them as much out of visibility as possible -->
                            <ShortcutDisplay
                                class="foreground"
                                :shortcut="cue?.Shortcut"
                            >
                            </ShortcutDisplay>
                        </p>
                    </div>
                </span>
            </template>
        </span>
    </button>
</template>

<script lang="ts">
import { defineComponent, StyleValue } from 'vue';
import { Cue, PlaybackMode } from '@/store/compilation-types';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import TimeDisplay from '../TimeDisplay.vue';
import ShortcutDisplay from '../ShortcutDisplay.vue';
import IfMedia from '@/components/IfMedia.vue';
import {
    mdiPlay,
    mdiPause,
    mdiRepeatOnce,
    mdiPlayCircleOutline,
} from '@mdi/js';

/** A button for displaying and invoking a cue
 * @remarks Shows playback progress with an inline progress bar
 * @remarks Supports a default, two-line display with icon, description and other indications,
 * as well as a minified, icon-only, variant.
 * @devdoc For performance reasons, the playback progress for this button is calculated outside
 * and offered as property values to this component, not using a
 * playhead position within this component. This minimizes component updates, as most of the time, the progress
 * properties of a single cue does not change. Instead, progress for a single button
 * does only change when the playhead position is within it's boundaries.
 */
export default defineComponent({
    name: 'CueButton',
    components: { BaseIcon, TimeDisplay, ShortcutDisplay, IfMedia },
    props: {
        cue: {
            type: Cue,
            required: true,
        },
        /** The playback progress within this cue, in [percent], or null if not applicable
         * @remarks This value is only used when both the cue is not ahead nor has passed.
         */
        percentComplete: Number,

        /** Whether this cue is currently selected
         * @remarks Note: only one cue in a compilation may be selected */
        isCueSelected: Boolean,

        /* Whether playback of this cue has already passed
                 (the playhead has completely passed beyond the end of this cue) */
        hasCuePassed: Boolean,

        /* Determines whether playback of this cue has not yet started 
        (the playhead has not yet reached the beginning of this cue)*/
        isCueAhead: Boolean,

        /** Indicates whether the associated Track is currently playing
         * @remarks This is used to depict the expected action on button press. While playing, this is pause, and vice versa.
         */
        isTrackPlaying: Boolean,
        /** The playback mode
         * @remarks This is used to indicate looping behavior to the user
         * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        playbackMode: {
            type: String as () => PlaybackMode,
            required: true,
        },
        /** Whether the button is shown in a minified, single-line, icon only, variant.
         * @remarks This is currently used for the edit mode.
         */
        isMinified: Boolean,
        /** Whether the button has addons at it's right side. This determines progress bar styling.
         * @remarks This can be used when the button is part of a button group.
         * @remarks The progress bar radius at the right side must be removed for fully progressed cues.
         */
        hasAddonsRight: Boolean,
    },
    data() {
        return {
            /** Icons from @mdi/js */
            mdiPlay: mdiPlay,
            mdiPause: mdiPause,
            mdiRepeatOnce: mdiRepeatOnce,
            mdiPlayCircleOutline: mdiPlayCircleOutline,
        };
    },
    computed: {
        /** Gets a displayable title for the cue */
        cueTitle(): string {
            if (this.cue.Description) {
                return `Play from ${this.cue.Description}`;
            }
            return `Play from here`;
        },

        /** The width offset for the progress-bar
         * @remarks this allows to dynamically offset for the width of the progress bar in [em] during cue completion
         * @devdoc The width is defined in CSS
         */
        progressBarWidthOffset(): number {
            return (
                ((100 - (this.percentComplete ?? 0)) / 100) *
                0.3 /* value in [em], as defined in CSS */
            );
        },

        /** Returns the progress as width style, for use as a css style set, dynamically depending on the actual progress in the cue
         * @devdoc max-width makes sure, the progress bar never overflows the given space.
         * For performance reasons, the style is only effectively calculated when the cue is currently played
         */
        progressStyle(): StyleValue {
            if (!Number.isFinite(this.cue.Time)) {
                return {
                    display: 'none',
                };
            }
            if (
                !this.hasCuePassed &&
                !this.isCueAhead &&
                this.percentComplete != null
            ) {
                //show the progress according to the percentage available
                return {
                    width: `calc(${this.percentComplete}% +
                     ${this.progressBarWidthOffset}em)`,
                    'max-width': '100%',
                };
            } else {
                return {};
            }
        },

        /** Determines whether this cue is currently selected and is looping */
        isCueLooping(): boolean {
            return (
                this.isCueSelected && this.playbackMode === PlaybackMode.LoopCue
            );
        },
        /** Determines whether this cue is currently selected and is playing to cue end only */
        isCuePlay(): boolean {
            return (
                this.isCueSelected && this.playbackMode === PlaybackMode.PlayCue
            );
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

/** Visually better align the left edge of the icon image content with the buttons padding */
.cue.button .icon {
    margin-left: -4px;
}

/* The content inside of a cue button should be full width of the button */
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
