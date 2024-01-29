<template>
    <button
        class="button cue"
        :class="{
            'is-selected': isCueSelected,
            'is-scheduled': isCueScheduled,
        }"
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
            <!-- first line (Do not use a level here, this has only complicated things for smaller widths so far)-->
            <BaseIcon
                v-if="!isTrackPlaying"
                :path="mdiPlay"
                class="foreground"
            />
            <BaseIcon v-else :path="mdiPause" class="foreground" />
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
        </span>
    </button>
</template>

<script setup lang="ts">
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiPlay, mdiPause } from '@mdi/js';
import {
    rTrackPlayOnce,
    rTrackRepeatOnce,
} from '@/components/icons/ReplayerIcon';
import { type PropType, computed, inject } from 'vue';
import { isPlayingInjectionKey } from '@/components/track/TrackInjectionKeys';
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

    /** Whether this cue is disabled  */
    disabled: Boolean,

    /** Whether this cue is currently selected
     * @remarks Note: only one cue in a compilation may be selected */
    isCueSelected: Boolean,

    /** Whether this cue is currently scheduled
     * @remarks Note: only one cue in a compilation may be scheduled */
    isCueScheduled: Boolean,

    /** The playback mode
     * @remarks This is used to indicate looping behavior to the user
     * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
     */
    playbackMode: {
        type: String as () => PlaybackMode,
        required: true,
    },

    /** Whether the button has addons at it's right side. This determines progress bar styling.
     * @remarks This can be used when the button is part of a button group.
     * @remarks The progress bar radius at the right side must be removed for fully progressed cues.
     */
    hasAddonsRight: Boolean,
});

//TODO try to simiplify the progress with it's own control. Does this affect layouting performance positively

/** Indicates whether this track's player is currently playing
 * @remarks This is used to depict the expected action on button press. While playing, this is pause, and vice versa.
 */
const isTrackPlaying = inject(isPlayingInjectionKey);

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
