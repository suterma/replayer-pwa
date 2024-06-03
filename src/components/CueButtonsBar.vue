<template>
    <div
        class="cue-buttons-bar buttons field has-addons is-fullwidth is-flex-wrap-nowrap"
    >
        <!-- A virtual cue button as prefix, when the first cue is not at the zero position -->
        <!-- Note: Do not crop the (non-existing) text in virtual cue buttons
             Also, leave the existing flex-grow, to allow them to fill single lines, but allow to shrink -->
        <CueButton
            v-if="(prefixCue.Duration ?? 0 > 0) && showInitialZeroTimeCue"
            :id="prefixCue.Id"
            class="is-flex-grow-1 is-flex-shrink-5"
            :class="{
                'is-success': isCueSelected(prefixCue),
                'is-warning': !isCueSelected(prefixCue),
            }"
            :disabled="disabled || !Number.isFinite(prefixCue.Time)"
            :time="prefixCue.Time"
            :shortcut="prefixCue.Shortcut"
            :duration="prefixCue.Duration"
            :description="prefixCue.Description"
            :playback-mode="playbackMode"
            has-addons-right
            minified
            show-text
            :has-cue-passed="hasCuePassed(prefixCue)"
            :is-cue-ahead="isCueAhead(prefixCue)"
            :percent-complete="percentComplete(prefixCue)"
            virtual
            :omit-pre-roll="true"
            :is-cue-selected="isCueSelected(prefixCue)"
            :is-cue-scheduled="isCueScheduled(prefixCue)"
            @click="cueClicked"
        >
        </CueButton>
        <!-- Using the v-for on a template instead of the actual component saves unnecessary renderings. 
             See https://stackoverflow.com/a/76074016/79485 -->
        <template v-for="cue in cues" :key="cue.Id">
            <CueButton
                :id="cue.Id"
                class="is-flex-grow-1 has-cropped-text"
                :class="{
                    'is-success': isCueSelected(cue),
                    'is-warning': !isCueSelected(cue),
                }"
                :disabled="disabled || !Number.isFinite(cue.Time)"
                :time="cue.Time"
                :shortcut="cue.Shortcut"
                :duration="cue.Duration"
                :description="cue.Description"
                :playback-mode="playbackMode"
                has-addons-right
                minified
                show-text
                :has-cue-passed="hasCuePassed(cue)"
                :is-cue-ahead="isCueAhead(cue)"
                :percent-complete="percentComplete(cue)"
                :omit-pre-roll="cue.OmitPreRoll"
                :omit-fade-in="cue.OmitFadeIn"
                :is-cue-selected="isCueSelected(cue)"
                :is-cue-scheduled="isCueScheduled(cue)"
                @click="cueClicked"
            >
            </CueButton>
        </template>
    </div>
</template>

<script setup lang="ts">
import { computed, inject, type PropType } from 'vue';
import CueButton from '@/components/buttons/CueButton.vue';
import CompilationHandler from '@/store/compilation-handler';
import { useAppStore } from '@/store/app';
import { storeToRefs } from 'pinia';
import { currentPositionInjectionKey } from './track/TrackInjectionKeys';
import type { ICue } from '@/store/ICue';
import type { PlaybackMode } from '@/store/PlaybackMode';
import { Cue } from '@/store/Cue';
import { useSettingsStore } from '@/store/settings';

/** A single line bar with simple cue buttons for a track
 */

const emit = defineEmits(['click']);

const props = defineProps({
    /** The cues to show
     */
    cues: { type: Array as PropType<Array<ICue>>, required: true },

    /** Whether to show the component in a disabled state
     * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
     */
    disabled: Boolean,

    /** The playback mode
     * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
     */
    playbackMode: {
        type: String as () => PlaybackMode,
        required: true,
    },
});

/** A static cue id for the prefix cue */
const prefixCueButtonId = 'prefix';

/** Handler for a cue clicked event
 * @remarks Emits a click event with the respective cue
 * @devdoc The cue object (or id) is intentionally not provided from inside the v-for, because using a property-based value
 * for an event handler in a v-for causes excess rendering operations for components inside v-for loops. See https://stackoverflow.com/a/74270334/79485
 * Instead, the respective cue id is reclaimed inside this handler only at an actual click.
 */
function cueClicked(event: PointerEvent): void {
    const clickedCueId = (event.target as HTMLElement).id;
    if (clickedCueId === prefixCueButtonId) {
        emit('click', prefixCue.value);
    } else {
        if (props.cues) {
            const clickedCue = CompilationHandler.getCueById(
                props.cues,
                clickedCueId,
            );
            if (clickedCue) {
                emit('click', clickedCue);
            }
        }
    }
}
/** Defines a virtual cue, that acts as a placeholder when the first defined cue is not at the track start. */
const prefixCue = computed(() => {
    return new Cue(
        'the Beginning',
        '',
        0,
        props.cues?.[0]?.Time ?? null,
        false /* //TODO later allow some virtual "pre-roll" using a timer*/,
        false /* //TODO later allow some virtual "fade-ipre-roll", if defined, using a timer*/,
        prefixCueButtonId,
    );
});

const settings = useSettingsStore();
const { showInitialZeroTimeCue } = storeToRefs(settings);

const app = useAppStore();
const { selectedCueId, scheduledCueId } = storeToRefs(app);

/** Determines whether this cue is currently selected
 * @remarks Note: only one cue in a compilation may be selected */
function isCueSelected(cue: ICue): boolean {
    return selectedCueId.value === cue.Id;
}

/** Determines whether this cue is scheduled
 * @remarks Note: only one cue in a compilation may be scheduled */
function isCueScheduled(cue: ICue): boolean {
    return scheduledCueId.value === cue.Id;
}

const currentPosition = inject(currentPositionInjectionKey);

/** Determines whether playback of the given cue has already passed
 * @remarks Is used for visual indication of playback progress
 * @param cue - the cue to determine the playback progress for
 */
function hasCuePassed(cue: ICue): boolean {
    return CompilationHandler.hasCuePassed(cue, currentPosition?.value);
}
/** Determines whether playback of the given cue has not yet started
 * @param cue - the cue to determine the playback progress for
 */
function isCueAhead(cue: ICue): boolean {
    return CompilationHandler.isCueAhead(cue, currentPosition?.value);
}
/** The playback progress within the given cue, in [percent], or null if not applicable
 * @param cue - the cue to determine the playback progress for
 */
function percentComplete(cue: ICue): number | null {
    return CompilationHandler.percentComplete(cue, currentPosition?.value);
}
</script>

<style lang="scss">
.cue-buttons-bar.buttons {
    /** Use a very slim margin between the button in this buttons bar, to save space */
    .button:not(:last-child):not(.is-fullwidth) {
        margin-right: 2px;
    }

    /** Allow for slim buttons in this buttons bar, to save space */
    .player-timeline {
        min-width: 0;
    }

    /* For mobile, use super slim buttons in this buttons bar, to save space */
    @media screen and (max-width: 768px) {
        /** Define slim style for use specifically on mobile devices */
        .is-size-7 {
            font-size: xx-small !important;
        }

        .icon {
            display: none;
        }

        .button {
            line-height: normal !important;
        }
    }

    /* Virtual buttons should take up not unnecessary much space */
    .cue.button.is-virtual {
        max-width: 14em;
        /* do not shrink below the used icon width*/
        min-width: 34px;
    }
}
</style>
