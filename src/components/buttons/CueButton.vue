<template>
    <button
        ref="cueButton"
        class="button cue has-text-left"
        :class="{
            'is-multiline': !minified,
            'is-colorless': virtual,
            'is-virtual': virtual,
            'is-selected': isCueSelected,
            'is-scheduled': isCueScheduled,
        }"
        :title="'Play from ' + cueDisplayDescription"
        data-cy="cue-button"
        :disabled="disabled"
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
            <!-- First line (Do not use a level here, this has only complicated things for smaller widths so far)-->
            <!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC -->
            <i class="icon mdi foreground">
                <svg viewBox="0 0 24 24">
                    <path fill="currentColor" :d="iconPath" />
                </svg>
            </i>
            <!-- Text depending on variant -->
            <template v-if="showText">
                <span
                    v-if="minified && !virtual"
                    class="has-text-weight-semibold foreground is-size-7"
                    >{{ description }}</span
                >
                <span
                    v-if="!minified && !virtual"
                    class="ml-2 has-text-weight-semibold foreground"
                    >{{ description }}</span
                >

                <!-- Remarks only on larger buttons -->
                <span
                    v-if="!minified"
                    class="ml-2 is-italic foreground is-size-7"
                    >{{ remarks }}</span
                >
            </template>
            <!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC -->
            <i class="icon mdi ml-2 mr-2 foreground">
                <svg viewBox="0 0 24 24">
                    <path
                        v-if="isCueLooping"
                        fill="currentColor"
                        :d="rTrackRepeatOnce"
                    />
                    <path
                        v-else-if="isCuePlay"
                        fill="currentColor"
                        :d="rTrackPlayOnce"
                    />
                    <path v-else fill="currentColor" d="" />
                </svg>
            </i>

            <!-- second line, if not minified (use a horizontal level also on mobile)-->
            <template v-if="!minified">
                <br />
                <span class="level is-mobile">
                    <!-- Left side -->
                    <div class="level-left">
                        <!-- The shortcut -->
                        <p
                            v-if="shortcut"
                            class="level-item"
                            :class="{ 'is-invisible': disabled }"
                        >
                            <!-- NOTE: For performance reasons, this shortcut display is implemented inline, not using the ShortcutDisplay SFC -->
                            <span
                                class="tag is-light is-outlined has-opacity-third is-family-monospace is-uppercase has-text-weight-bold foreground"
                            >
                                {{ shortcut }}</span
                            >
                        </p>

                        <!-- a shortcut placeholder for vertical spacing-->
                        <span v-else class="p-0 tag"></span>
                        <div class="level-item mr-3">
                            <MeasureDisplay
                                v-if="hasMeter && useMeasureNumbers"
                                v-experiment="true"
                                class="has-opacity-half foreground"
                                :model-value="time"
                                :meter="meter"
                            ></MeasureDisplay>
                            <!-- NOTE: As a update performance optimization,
                                 the TimeDisplay SFC component is not used. -->
                            <span
                                class="has-text-left is-size-7 is-minimum-7-characters is-family-monospace has-opacity-half foreground"
                                data-cy="remaining-time"
                                >{{ cueDisplayTime }}</span
                            >
                        </div>
                    </div>

                    <!-- Right side -->
                    <div class="level-right">
                        <!-- The duration -->
                        <!-- For layout space reasons, only render this when requested and only on desktop and larger screens -->
                        <p
                            v-if="showDuration"
                            class="level-item mr-3 is-hidden-touch"
                        >
                            <MeasureDifferenceDisplay
                                v-if="hasMeter && useMeasureNumbers"
                                v-experiment="true"
                                class="has-opacity-half foreground"
                                :model-value="duration"
                                :meter="meter"
                            ></MeasureDifferenceDisplay>
                            <!-- Use a right position for Durations, to keep them as much out of visibility as possible -->
                            <!-- NOTE: As a update performance optimization,
                                 the TimeDisplay SFC component is not used. -->
                            <span
                                class="has-text-left is-size-7 is-minimum-7-characters is-family-monospace has-opacity-half foreground"
                                data-cy="remaining-time"
                                >{{ cueDisplayDuration }}</span
                            >
                        </p>
                    </div>
                </span>
            </template>
        </span>
    </button>
</template>

<script setup lang="ts">
import { mdiPause } from '@mdi/js';
import {
    rTrackPlayOnce,
    rTrackRepeatOnce,
    rFadeInPreRollPlay,
    rFadeInPlay,
    rPlayDirect,
    rPreRollPlay,
} from '@/components/icons/ReplayerIcon';
import CompilationHandler from '@/store/compilation-handler';
import { type PropType, type Ref, computed, inject, ref, watch } from 'vue';
import { Meter } from '@/code/music/Meter';
import MeasureDisplay from '@/components/MeasureDisplay.vue';
import MeasureDifferenceDisplay from '@/components/MeasureDifferenceDisplay.vue';
import {
    isPlayingInjectionKey,
    playbackStateInjectionKey,
    meterInjectionKey,
    useMeasureNumbersInjectionKey,
    trackPreRollDurationInjectionKey,
    trackFadeInDurationInjectionKey,
} from '@/components/track/TrackInjectionKeys';
import { PlaybackMode } from '@/store/PlaybackMode';

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
        default: null,
    },
    duration: {
        type: null as unknown as PropType<number | null>,
        required: false,
        default: null,
    },

    /** The icon to use, if any. If not set, the common play/pause icons are used. */
    iconPathOverride: {
        type: String,
        default: null,
    },

    /** Determines whether playback of the given cue has already passed
     * @remarks Is used for visual indication of playback progress
     */

    hasCuePassed: Boolean,

    /** Determines whether playback of the given cue has not yet started
     * @param cue - the cue to determine the playback progress for
     */
    isCueAhead: Boolean,

    /** The playback progress within the given cue, in [percent], or null if not applicable
     * @param cue - the cue to determine the playback progress for
     */
    percentComplete: {
        type: null as unknown as PropType<number | null>,
        required: false,
        default: null,
    },

    /** A description of the cue
     *    * @remarks Rendering is controlled by the display properties
     */
    description: {
        type: null as unknown as PropType<string | null>,
        required: false,
        default: null,
    },

    /** Remarks to this cue
     * @remarks Rendering is controlled by the display properties
     */
    remarks: {
        type: null as unknown as PropType<string | null>,
        required: false,
        default: null,
    },
    shortcut: {
        type: null as unknown as PropType<string | null>,
        required: false,
        default: null,
    },

    /** Whether to omit the possibly defined default/track pre-roll for this cue.
     */
    omitPreRoll: Boolean,

    /** Whether to omit the possibly defined default/track fade-in for this cue.
     */
    omitFadeIn: Boolean,

    /** Whether this cue is disabled  */
    disabled: Boolean,

    /** Whether this cue is currently selected
     * @remarks Note: only one cue in a compilation may be selected */
    isCueSelected: Boolean,

    /** Whether this cue is currently scheduled
     * @remarks Note: only one cue in a compilation may be scheduled */
    isCueScheduled: Boolean,

    /* Whether to show this cue as passive, in dimmed style. */
    virtual: Boolean,

    /* Whether to focus the cue button on selection of the cue. Default is false.
     */
    focusOnSelection: Boolean,

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

    /** Whether to show the cue duration.
     * @remarks The duration is always hidden on smaller devices
     */
    showDuration: Boolean,

    /** Whether the button has addons at it's right side. This determines progress bar styling.
     * @remarks This can be used when the button is part of a button group.
     * @remarks The progress bar radius at the right side must be removed for fully progressed cues.
     */
    hasAddonsRight: Boolean,
});

const iconPath = computed(() => {
    if (props.iconPathOverride) {
        return props.iconPathOverride;
    }
    if ((isTrackPlaying?.value ?? false) == true) {
        return mdiPause;
    }
    // Track is pausing, choose icon according to pre-roll/fade setting for this cue
    if (hasPreRoll.value) {
        return hasFadeIn.value ? rFadeInPreRollPlay : rPreRollPlay;
    }
    return hasFadeIn.value ? rFadeInPlay : rPlayDirect;
});

// --- button selection ---

const cueButton: Ref<InstanceType<typeof HTMLButtonElement> | null> = ref(null);

/** Focus of the button follows the cue selection, if required */
watch(
    [() => props.isCueSelected, () => props.focusOnSelection],
    ([isCueSelected, focusOnSelection]) => {
        if (focusOnSelection && isCueSelected) {
            cueButton.value?.focus();
        }
    },
    { immediate: true },
);

// --- metering ---

/** The musical meter */
const meter = inject(meterInjectionKey);

const useMeasureNumbers = inject(useMeasureNumbersInjectionKey);

//TODO try to simiplify the progress with it's own control. Does this affect layouting performance positively

/** Indicates whether this track's player is currently playing
 * @remarks This is used to depict the expected action on button press. While playing, this is pause, and vice versa.
 */
const isTrackPlaying = inject(isPlayingInjectionKey);

/** Indicates this track's playback state
 * @remarks This is used to depict the expected action on button press. While playing, this is pause, and vice versa.
 */
const playbackState = inject(playbackStateInjectionKey);

/** The description of the position of this cue, with fallback if the cue does
 * not have a set description.
 */
const cueDisplayDescription = computed(() => {
    if (props.description) {
        return props.description;
    }
    if (props.time !== null) {
        if (
            meter !== undefined &&
            meter.value !== null &&
            Meter.isValid(meter.value) &&
            useMeasureNumbers?.value
        ) {
            return Meter.toMeasureDisplay(props.time, meter.value);
        }
        return cueDisplayTime.value;
    }
    return '';
});

const cueDisplayTime = computed(() => {
    return CompilationHandler.convertToDisplayTime(props.time, 1);
});

const cueDisplayDuration = computed(() => {
    return CompilationHandler.convertToDisplayTime(props.duration, 1);
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

// --- pre-roll ---

const preRollDuration = inject(trackPreRollDurationInjectionKey);
/** Whether this cue effectively has a pre-roll duration.
 */
const hasPreRoll = computed(() => {
    return (preRollDuration?.value ?? 0 > 0) && !props.omitPreRoll;
});

// --- fade-in ---

const fadeInDuration = inject(trackFadeInDurationInjectionKey);
/** Whether this cue effectively has a pre-roll duration.
 */
const hasFadeIn = computed(() => {
    return (fadeInDuration?.value ?? 0 > 0) && !props.omitFadeIn;
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
