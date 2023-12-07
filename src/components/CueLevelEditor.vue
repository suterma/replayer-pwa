<template>
    <fieldset :disabled="disabled" data-cy="cue-editor">
        <div class="level is-mobile">
            <!-- Left side -->
            <div class="level-left">
                <!-- Play Button -->
                <div class="level-item">
                    <div class="field has-addons">
                        <p class="control">
                            <CueButton
                                :time="cue.Time"
                                :shortcut="cue.Shortcut"
                                :duration="cue.Duration"
                                :playbackMode="playbackMode"
                                @click="cueClick()"
                                minified
                                :hasCuePassed="hasCuePassed"
                                :isCueAhead="isCueAhead"
                                :percentComplete="percentComplete"
                                :isCueSelected="isCueSelected"
                                :isCueScheduled="isCueScheduled"
                                hasAddonsRight
                            />
                        </p>
                        <!-- Cue Description -->
                        <p
                            class="control is-flex-grow-5 is-flex-shrink-1"
                            title="Description for this cue"
                        >
                            <input
                                ref="cueDescription"
                                class="input"
                                type="text"
                                inputmode="text"
                                :value="cue.Description"
                                @change="updateDescription($event)"
                                @input="updateDescription($event)"
                                :placeholder="cuePlaceholder"
                                size="320"
                                v-focus
                            />
                        </p>
                    </div>
                </div>
                <!-- at (keep as small as possible)-->
                <div
                    class="level-item is-flex-shrink-1 is-flex-grow-0 is-hidden-mobile"
                >
                    <p class="is-single-line">
                        <span class="has-opacity-half">at</span>
                    </p>
                </div>
                <!-- A normal input for the time, with an adjustment add-on (from a bit wider screens)-->
                <div class="level-item is-flex-shrink-1">
                    <div class="field has-addons has-addons-except-mobile">
                        <p class="control is-hidden-mobile">
                            <TimeInput
                                class="input has-text-right"
                                title="Time of this cue"
                                :modelValue="props.cue.Time"
                                @update:modelValue="updateCueTime"
                                size="9"
                            />
                        </p>
                        <div
                            v-experiment="experimentalUseMeter"
                            v-if="useMeasureNumbers"
                            class="control"
                        >
                            <button class="button is-indicator">
                                <MeasureDisplay
                                    :modelValue="props.cue.Time"
                                ></MeasureDisplay>
                            </button>
                        </div>
                        <div
                            v-experiment="experimentalUseMeter"
                            v-if="useMeasureNumbers"
                            class="control"
                        >
                            <MetricalEditor
                                :modelValue="props.cue.Time"
                                @update:modelValue="updateCueTime"
                            >
                            </MetricalEditor>
                        </div>
                        <div class="control">
                            <AdjustTimeButton
                                @adjustTime="$emit('adjust')"
                                :isSelectedItem="isCueSelected"
                            ></AdjustTimeButton>
                        </div>
                    </div>
                </div>

                <div class="level-item is-flex-shrink-1 is-hidden-tablet">
                    <div class="field">
                        <p
                            class="control is-minimum-5-characters has-cropped-text"
                            title="Time of this cue"
                        >
                            <span class="input is-static has-opacity-half">
                                <!-- Display the cue time, with just 1 decimal digit -->
                                {{ (props.cue.Time ?? 0).toFixed(1) }}</span
                            >
                        </p>
                    </div>
                </div>

                <!-- Duration (keep small and hide on touch)-->
                <!-- For performance and layout reasons, only render this when used (emulating is-hidden-touch) -->
                <IfMedia query="(min-width: 1024px)">
                    <div
                        class="level-item is-flex-shrink-1 is-narrow"
                        title="Duration (until next cue)"
                    >
                        <TimeDisplay :modelValue="cue.Duration"> </TimeDisplay>
                    </div>

                    <div
                        v-if="useMeasureNumbers"
                        class="level-item is-flex-shrink-1"
                        v-experiment="experimentalUseMeter"
                    >
                        <button class="button is-indicator">
                            <MeasureDifferenceDisplay
                                :modelValue="cue.Duration"
                            ></MeasureDifferenceDisplay>
                        </button>
                    </div>
                    <!-- A rather slim input for the shortcut (a short mnemonic) -->
                    <div class="level-item is-flex-shrink-1">
                        <div class="field">
                            <p
                                class="control"
                                title="Mnemonic (as keyboard shortcut)"
                            >
                                <input
                                    class="input"
                                    type="text"
                                    inputmode="numeric"
                                    :value="cue.Shortcut"
                                    @change="updateShortcut($event)"
                                    @input="updateShortcut($event)"
                                    placeholder="shortcut"
                                    size="9"
                                />
                            </p>
                        </div>
                    </div>
                </IfMedia>
            </div>

            <!-- Right side -->
            <div class="level-right">
                <div class="field">
                    <p class="control" title="Trash this cue">
                        <button class="button" @click="deleteThisCue()">
                            <BaseIcon v-once :path="mdiTrashCanOutline" />
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </fieldset>
</template>

<script setup lang="ts">
/** An Editor for for a single cue
 * @remarks Shows a cue button with an inline progress bar, plus input fields for all properties
 * @devdoc Input value binding is not implemented with a two-way v-model binding because the incoming values are taken
 * from a property (where setting of values is not permitted).
 * Instead, the values are one-way bound via :value and changes are directly stored in the state.
 * This approach is chosen over the ...data pattern because the shortcut values can also change from a menu entry
 * in the track's dropdown menu.
 */
import { type PropType, computed, inject, ref, type Ref } from 'vue';
import { storeToRefs } from 'pinia';

import type { ICue, PlaybackMode } from '@/store/compilation-types';
import CueButton from '@/components/buttons/CueButton.vue';
import AdjustTimeButton from '@/components/buttons/AdjustTimeButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import TimeInput from '@/components/TimeInput.vue';
import IfMedia from '@/components/IfMedia.vue';
import { mdiTrashCanOutline } from '@mdi/js';
import { useAppStore } from '@/store/app';
import MeasureDisplay from '@/components/MeasureDisplay.vue';
import MeasureDifferenceDisplay from '@/components/MeasureDifferenceDisplay.vue';
import MetricalEditor from '@/components/editor/MetricalEditor.vue';
import { useSettingsStore } from '@/store/settings';
import { useMeasureNumbersInjectionKey } from '@/components/track/TrackInjectionKeys';

const emit = defineEmits(['click', 'play', 'adjust']);

const props = defineProps({
    cue: {
        type: null as unknown as PropType<ICue>,
        required: true,
    },

    /** Whether this cue is currently selected
     * @remarks Note: only one cue in a compilation may be selected */
    isCueSelected: Boolean,

    /** Whether this cue is currently scheduled
     * @remarks Note: only one cue in a compilation may be scheduled */
    isCueScheduled: Boolean,

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

    /* Whether to show this cue as passive, in dimmed style. */
    virtual: Boolean,

    /** The playback mode
     * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
     */
    playbackMode: {
        type: String as () => PlaybackMode,
        required: true,
    },

    disabled: {
        type: Boolean,
        required: false,
    },
});

const app = useAppStore();

/** Updates the set cue description */
function updateDescription(event: Event) {
    const cueId = props.cue.Id;
    const shortcut = props.cue.Shortcut;
    const time = props.cue.Time;
    const description = (event.target as HTMLInputElement).value;
    app.updateCueData(cueId, description, shortcut, time);
}

/** Deletes the cue */
function deleteThisCue(): void {
    const cueId = props.cue.Id;
    app.deleteCue(cueId);
}

/** Updates the set cue time */
function updateCueTime(time: number | null) {
    const cueId = props.cue.Id;
    const shortcut = props.cue.Shortcut;
    const description = props.cue.Description;
    app.updateCueData(cueId, description, shortcut, time);

    //Also , for user convenience, to simplify adjusting cues, play at change
    //(while keeping the focus at the number spinner)
    if (Number.isFinite(time)) {
        emit('play');
    }
}

/** Updates the set cue shortcut */
function updateShortcut(event: Event) {
    const cueId = props.cue.Id;
    const description = props.cue.Description;
    const time = props.cue.Time;
    const shortcut = (event.target as HTMLInputElement).value;
    app.updateCueData(cueId, description, shortcut, time);
}

/** Handles the click event of the cue button */
function cueClick() {
    emit('click');
}

const cueDescription: Ref<InstanceType<typeof HTMLInputElement> | null> =
    ref(null);

const settings = useSettingsStore();
const { experimentalUseMeter } = storeToRefs(settings);

const cuePlaceholder = computed(() => `Cue description`);

const useMeasureNumbers = inject(useMeasureNumbersInjectionKey);
</script>
<style lang="scss" scoped>
/*************************************************************
 * Specific Cue edit level layout
**************************************************************
*/

/** Apply a very small vertical gap between cues */
.levels .level {
    margin-bottom: 1px;
    margin-top: 1px;
}

/** In Edit mode, cue buttons should be gradually be wider on larger screens, to better represent the cue progress */
@media screen and (max-width: 480px) {
    .cue.button {
        /* very narrow on very small screens */
        padding-left: 3px;
        padding-right: 3px;
    }
}

@media screen and (min-width: 769px) {
    .cue.button {
        padding-left: 2rem;
        padding-right: 2rem;
    }
}
/** desktop */
@media screen and (min-width: 1024px) {
    .cue.button {
        padding-left: 3rem;
        padding-right: 3rem;
    }
}

/** widescreen */
@media screen and (min-width: 1216px) {
    .cue.button {
        padding-left: 4rem;
        padding-right: 4rem;
    }
}

/* fullhd */
@media screen and (min-width: 1408px) {
    .cue.button {
        padding-left: 5rem;
        padding-right: 5rem;
    }
}

/** Modifies a component with addons, when the addons are hidden on mobile viewport width (using .has-addons-except-mobile) */
.field.has-addons.has-addons-except-mobile
    .control:first-child:not(:only-child)
    .button,
.field.has-addons.has-addons-except-mobile
    .control:first-child:not(:only-child)
    .input,
.field.has-addons.has-addons-except-mobile
    .control:first-child:not(:only-child)
    .select
    select {
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
}

/** Custom modification for the cue level.
*/
.level {
    .level-left {
        /* This basis is set empirically to fit for one button element, plus 0.75rem margin, on the right */
        flex-basis: calc(100% - 40px - 0.75rem);

        /* These items should grow, and shrink */
        .level-item {
            flex-shrink: 1;
            flex-grow: 1;
            /* Items always justify left */
            justify-content: left;
        }
    }

    .level-right {
        /* Keep the right hand items small */
        flex-basis: 0;
    }
}

/*************************************************************
 * Shortcut input width depending on viewport size
**************************************************************
*/

/* minimum input width for shortcuts */
input[type='text'] {
    min-width: 6ch;
}

/* fullhd */
@media screen and (min-width: 1408px) {
    /* minimum input width for shortcuts */
    input[type='text'] {
        min-width: 8ch;
    }
}
</style>
