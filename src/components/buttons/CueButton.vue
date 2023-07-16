<template>
    <button
        class="button cue has-text-left"
        :class="{
            'is-multiline': !minified,
            'is-virtual': virtual,
            'is-warning': !isCueSelected,
            'is-success': isCueSelected,
        }"
        :title="cueTitle"
        data-cy="cue-button"
    >
        <!-- Use the full width of the button for the inside content
        This causes the icon and description to start from the left side, 
        representing the begin of the cue, which suits the intention -->
        <!-- Do not handle click events here; they should originate from the outer button -->
        <span style="pointer-events: none" class="player-timeline is-fullwidth">
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
                v-if="!isTrackPlaying"
                :path="mdiPlay"
                class="foreground"
            />
            <BaseIcon v-else :path="mdiPause" class="foreground" />

            <!-- Text depending on variant -->
            <span
                v-if="minified && !virtual"
                class="has-text-weight-semibold foreground is-size-7"
                >{{ cueText }}</span
            >
            <span
                v-if="!minified && !virtual"
                class="ml-2 has-text-weight-semibold foreground"
                >{{ cueText }}</span
            >
            <BaseIcon
                v-if="isCueLooping"
                :path="rTrackRepeatOnce"
                class="ml-2 mr-2 foreground"
            />
            <BaseIcon
                v-else-if="isCuePlay"
                :path="rTrackPlayOnce"
                class="ml-2 mr-2 foreground"
            />
            <BaseIcon v-else path="" class="ml-2 mr-2 foreground" />

            <!-- second line, if not minified (use a horizontal level also on mobile)-->
            <template v-if="!minified">
                <br />
                <span class="level is-mobile">
                    <!-- Left side -->
                    <div class="level-left">
                        <div class="level-item mr-3">
                            <MeasureDisplay
                                v-experiment="true"
                                v-if="hasMeter && useMeasureNumbers"
                                class="has-opacity-half foreground"
                                :modelValue="time"
                                :meter="meter"
                            ></MeasureDisplay>
                            <!-- NOTE: As a component update performance optimization, 
                            the numeric value is truncated to one decimal digit, as displayed, avoiding
                            unnecessary update for actually non-distinctly displayed values. -->
                            <TimeDisplay
                                v-else
                                class="has-opacity-half foreground"
                                :modelValue="time"
                                :subSecondDigits="1"
                            ></TimeDisplay>
                        </div>
                    </div>

                    <!-- Right side -->
                    <div class="level-right">
                        <!-- For layout reasons, only render this when used, on desktop and larger screens -->

                        <p class="level-item mr-3 is-hidden-touch">
                            <MeasureDifferenceDisplay
                                v-experiment="true"
                                v-if="hasMeter && useMeasureNumbers"
                                class="has-opacity-half foreground"
                                :modelValue="duration"
                                :meter="meter"
                            ></MeasureDifferenceDisplay>
                            <!-- Use a right position for Durations, to keep them as much out of visibility as possible -->
                            <TimeDisplay
                                v-else
                                class="has-opacity-half foreground"
                                :modelValue="duration"
                                :subSecondDigits="1"
                            ></TimeDisplay>
                        </p>

                        <p class="level-item" v-if="shortcut">
                            <!-- Use a fixed right position for Shortcuts, to keep them as much out of visibility as possible -->
                            <ShortcutDisplay
                                class="foreground"
                                :shortcut="shortcut"
                            >
                            </ShortcutDisplay>
                        </p>
                        <p class="level-item" v-else>
                            <!-- Just show a placeholder, taking up the usual vertical space -->
                            <ShortcutDisplay
                                class="pl-0 pr-0 is-invisible"
                                shortcut=" "
                            >
                            </ShortcutDisplay>
                        </p>
                    </div>
                </span>
            </template>
        </span>
    </button>
</template>

<script setup lang="ts">
import BaseIcon from '@/components/icons/BaseIcon.vue';
import TimeDisplay from '../TimeDisplay.vue';
import ShortcutDisplay from '../ShortcutDisplay.vue';
import { mdiPlay, mdiPause } from '@mdi/js';
import {
    rTrackPlayOnce,
    rTrackRepeatOnce,
} from '@/components/icons/BaseIcon.vue';
import CompilationHandler from '@/store/compilation-handler';
import { PlaybackMode } from '@/store/compilation-types';
import { PropType, computed, inject } from 'vue';
import { Meter } from '@/code/music/Meter';
import MeasureDisplay from '@/components/MeasureDisplay.vue';
import MeasureDifferenceDisplay from '@/components/MeasureDifferenceDisplay.vue';
import {
    meterInjectionKey,
    useMeasureNumbersInjectionKey,
} from '../TrackInjectionKeys';

/** A button for displaying and invoking a cue
 * @remarks Shows playback progress with an inline progress bar
 * @remarks Supports a default, two-line display with icon, description and other indications,
 * as well as a minified, icon-only, variant.
 * @devdoc For performance reasons, the playback progress for this button is calculated outside
 * and offered as property values to this component, not using a
 * playhead position within this component. This minimizes component updates, as most of the time, the progress
 * properties of a single cue does not change. Instead, progress for a single button
 * does only change when the playhead position is within it's boundaries.
 * @devdoc Also for performance reasons, this component does not offer a slot. Test have shown
 * that slot content causes surplus renderings when used in a v-for loop.
 */

const props = defineProps({
    /** The temporal position of this cue */
    time: {
        type: null as unknown as PropType<number | null>,
        required: false,
    },
    duration: {
        type: null as unknown as PropType<number | null>,
        required: false,
    },
    description: {
        type: String,
        required: false,
    },
    shortcut: {
        type: null as unknown as PropType<string | null>,
        required: false,
    },
    /** The playback progress within this cue, in [percent], or null if not applicable
     * @remarks This value is only used when both the cue is not ahead nor has passed.
     */
    percentComplete: {
        type: null as unknown as PropType<number | null>,
        required: false,
    },
    /** Whether this cue is currently selected
     * @remarks Note: only one cue in a compilation may be selected */
    isCueSelected: Boolean,

    /* Whether playback of this cue has already passed
                 (the playhead has completely passed beyond the end of this cue) */
    hasCuePassed: Boolean,

    /* Whether to show this cue as passive, in dimmed style. */
    virtual: Boolean,

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
     */
    minified: Boolean,

    /** Whether a text based on the description or time is shown on the button.
     */
    showText: Boolean,
    /** Whether the button has addons at it's right side. This determines progress bar styling.
     * @remarks This can be used when the button is part of a button group.
     * @remarks The progress bar radius at the right side must be removed for fully progressed cues.
     */
    hasAddonsRight: Boolean,
});

/** The musical meter */
const meter = inject(meterInjectionKey);

const useMeasureNumbers = inject(useMeasureNumbersInjectionKey);

/** The title for this cue, usable as tooltip
 */
const cueTitle = computed(() => {
    if (props.description) {
        return `Play from ${props.description}`;
    } else if (props.time != undefined) {
        if (
            meter != undefined &&
            meter.value != null &&
            Meter.isValid(meter.value) &&
            useMeasureNumbers?.value
        ) {
            return `Play from ${Meter.toMeasureDisplay(
                props.time,
                meter.value,
            )}`;
        } else {
            return `Play from ${CompilationHandler.convertToDisplayTime(
                props.time,
                1,
            )}`;
        }
    }
    return `Play from here`;
});

/** The text for this cue, usable as label
 * @remarks Minified cues never have a text, to save spaces
 */
const cueText = computed(() => {
    if (!props.showText) {
        return '';
    }
    if (props.description) {
        return props.description;
    } else {
        return cueTitle.value;
    }
});

/** The width offset for the progress-bar
 * @remarks this allows to dynamically offset for the width of the progress bar in [em] during cue completion
 * @devdoc The width is defined in CSS
 */
const progressBarWidthOffset = computed(() => {
    return (
        ((100 - (props.percentComplete ?? 0)) / 100) *
        0.3 /* value in [em], as defined in CSS */
    );
});

/** Returns the progress as width style, for use as a css style set, dynamically depending on the actual progress in the cue
 * @devdoc max-width makes sure, the progress bar never overflows the given space.
 * For performance reasons, the style is only effectively calculated when the cue is currently played
 */
const progressStyle = computed(() => {
    if (!Number.isFinite(props.time)) {
        return {
            display: 'none',
        };
    }
    if (
        !props.hasCuePassed &&
        !props.isCueAhead &&
        props.percentComplete != null
    ) {
        //show the progress according to the percentage available
        return {
            width: `calc(${props.percentComplete}% +
                     ${progressBarWidthOffset.value}em)`,
            'max-width': '100%',
        };
    } else {
        return {};
    }
});

/** Determines whether this cue is currently selected and is looping */
const isCueLooping = computed(() => {
    return props.isCueSelected && props.playbackMode === PlaybackMode.LoopCue;
});
/** Determines whether this cue is currently selected and is playing to cue end only */
const isCuePlay = computed(() => {
    return props.isCueSelected && props.playbackMode === PlaybackMode.PlayCue;
});

/** Whether all required values for the use of the measure number as position are available.
 */
const hasMeter = computed(() => {
    return Meter.isValid(meter?.value);
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
