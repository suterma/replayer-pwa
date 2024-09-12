<template>
    <fieldset :disabled="disabled" data-cy="cue-editor">
        <div class="level is-mobile">
            <!-- Left side -->
            <div class="level-left">
                <!-- Play Button -->
                <div class="level-item">
                    <!-- Use the pre-roll switch not as part of the field with addons -->
                    <p class="control mr-2 is-hidden-mobile">
                        <PreRollSwitch
                            v-if="preRollDuration"
                            title="Toggle pre-roll usage"
                            :model-value="props.cue.OmitPreRoll"
                            narrow
                            @update:model-value="updateOmitPreRoll"
                        ></PreRollSwitch>
                    </p>
                    <!-- Use the fade-in switch not as part of the field with addons -->
                    <p class="control mr-2 is-hidden-mobile">
                        <FadeInSwitch
                            v-if="fadeInDuration"
                            title="Toggle fade-in usage"
                            :model-value="props.cue.OmitFadeIn"
                            narrow
                            @update:model-value="updateOmitFadeIn"
                        ></FadeInSwitch>
                    </p>
                    <div class="field has-addons">
                        <p class="control">
                            <CueButton
                                :class="{
                                    'is-success': isCueSelected,
                                    'is-warning': !isCueSelected,
                                }"
                                minified
                                :playback-mode="playbackMode"
                                :has-cue-passed="hasCuePassed"
                                :is-cue-ahead="isCueAhead"
                                :percent-complete="percentComplete"
                                :omit-pre-roll="props.cue.OmitPreRoll"
                                :omit-fade-in="props.cue.OmitFadeIn"
                                :is-cue-selected="isCueSelected"
                                :is-cue-scheduled="isCueScheduled"
                                has-addons-right
                                @click="cueClick()"
                            />
                        </p>
                        <!-- Cue Description -->
                        <p
                            class="control is-flex-grow-5 is-flex-shrink-1"
                            title="Description for this cue"
                        >
                            <input
                                ref="cueDescription"
                                v-focus
                                class="input"
                                type="text"
                                inputmode="text"
                                :value="cue.Description"
                                :placeholder="cuePlaceholder"
                                size="320"
                                @change="updateDescription($event)"
                                @input="updateDescription($event)"
                            />
                        </p>

                        <!-- Cue Remarks -->

                        <CoveredPanel
                            v-if="experimentalShowRemarksEditors"
                            :reveal-for="[cue.Remarks]"
                            title="Cue remarks"
                            class="control is-flex-grow-5 is-flex-shrink-1"
                        >
                            <template #caption
                                ><span v-experiment="true" class="label"
                                    >Remarks</span
                                ></template
                            >
                            <LabeledInput v-experiment="true" label="Remarks">
                                <input
                                    ref="cueRemarks"
                                    class="input"
                                    type="text"
                                    inputmode="text"
                                    :value="cue.Remarks"
                                    placeholder="Remarks (e.g. performance instructions)"
                                    size="320"
                                    @change="updateRemarks($event)"
                                    @input="updateRemarks($event)"
                                />
                            </LabeledInput>
                        </CoveredPanel>

                        <DropdownMenu
                            v-if="experimentalShowRemarksEditors"
                            v-experiment="true"
                            title="Cue remarks"
                            left
                            down
                            sticky
                            data-cy="dropdonw-menu-cue-remarks"
                            :icon-path="mdiTextBoxPlusOutline"
                            :render-closed="false"
                        >
                            <div class="dropdown-item is-hidden-mobile">
                                <p class="menu-label">Cue Remarks</p>
                            </div>
                            <slot>
                                <DropdownMenuItem>
                                    <textarea
                                        v-focus
                                        ref="cueRemarks"
                                        class="textarea"
                                        type="text"
                                        inputmode="text"
                                        :value="cue.Remarks"
                                        placeholder="Remarks (e.g. performance instructions)"
                                        rows="4"
                                        cols="12"
                                        @change="updateRemarks($event)"
                                        @input="updateRemarks($event)"
                                    />
                                </DropdownMenuItem>
                            </slot>
                        </DropdownMenu>

                        <div class="control is-hidden-tablet">
                            <AdjustTimeButton
                                class="as-after-addon"
                                :is-selected-item="isCueSelected"
                                @adjust-time="$emit('adjust')"
                            >
                                <p
                                    class="control is-minimum-5-characters has-cropped-text"
                                    title="Time of this cue"
                                >
                                    <span
                                        class="input is-static has-opacity-half"
                                    >
                                        <!-- Display the cue time, with just 1 decimal digit -->
                                        {{ (cueTime ?? 0).toFixed(1) }}</span
                                    >
                                </p></AdjustTimeButton
                            >
                        </div>
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
                <!-- A normal input for the time, with an adjustment add-on (for wider screens)-->
                <div class="level-item is-flex-shrink-1 is-hidden-mobile">
                    <div class="field has-addons has-addons-except-mobile">
                        <p class="control is-hidden-mobile">
                            <TimeInput
                                class="input has-text-right"
                                title="Time of this cue"
                                :model-value="cueTime"
                                size="9"
                                @update:model-value="updateCueTime"
                                @click="seekTo(cueTime)"
                            />
                        </p>
                        <div
                            v-if="useMeasureNumbers"
                            v-experiment="experimentalUseMeter"
                            class="control"
                        >
                            <button class="button is-indicator">
                                <MeasureDisplay
                                    :model-value="cueTime"
                                ></MeasureDisplay>
                            </button>
                        </div>
                        <div
                            v-if="useMeasureNumbers"
                            v-experiment="experimentalUseMeter"
                            class="control"
                        >
                            <MetricalEditor
                                :model-value="cueTime"
                                @update:model-value="updateCueTime"
                            >
                            </MetricalEditor>
                        </div>
                        <div class="control">
                            <AdjustTimeButton
                                class="as-after-addon"
                                :is-selected-item="isCueSelected"
                                @adjust-time="$emit('adjust')"
                            ></AdjustTimeButton>
                        </div>
                    </div>
                </div>

                <!-- Duration (keep small and hide on touch)-->
                <!-- For performance and layout reasons, only render this when used (emulating is-hidden-touch) -->
                <IfMedia query="(min-width: 1024px)">
                    <div
                        class="level-item is-flex-shrink-1 is-narrow"
                        title="Duration (until next cue)"
                    >
                        <div class="cue-duration-container">
                            <TimeDisplay
                                class="cue-duration"
                                :model-value="cue.Duration"
                            >
                            </TimeDisplay>
                        </div>
                    </div>

                    <div
                        v-if="useMeasureNumbers"
                        v-experiment="experimentalUseMeter"
                        class="level-item is-flex-shrink-1"
                    >
                        <button class="button is-indicator">
                            <MeasureDifferenceDisplay
                                :model-value="cue.Duration"
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
                                    placeholder="shortcut"
                                    size="9"
                                    @change="updateShortcut($event)"
                                    @input="updateShortcut($event)"
                                />
                            </p>
                        </div>
                    </div>
                </IfMedia>
            </div>

            <!-- Right side -->
            <div class="level-right">
                <div class="level-item">
                    <!-- Slot for additional level display items -->
                    <slot name="right-start"></slot>

                    <!-- This menu is only used on smaller devices, otherwise the actions are directly available via dedicated buttons -->
                    <CueContextMenu class="is-hidden-tablet">
                        <DropdownMenuButton
                            title="Remove"
                            sub-title="(remove the cue from the track)"
                            :icon-path="mdiTrashCanOutline"
                            @click="deleteThisCue()"
                        />
                        <DropdownMenuItem v-if="preRollDuration">
                            <PreRollSwitch
                                title="Toggle pre-roll usage"
                                :model-value="props.cue.OmitPreRoll"
                                @update:model-value="updateOmitPreRoll"
                            ></PreRollSwitch
                        ></DropdownMenuItem>
                        <DropdownMenuItem v-if="fadeInDuration">
                            <FadeInSwitch
                                title="Toggle fade-in usage"
                                :model-value="props.cue.OmitFadeIn"
                                @update:model-value="updateOmitFadeIn"
                            ></FadeInSwitch
                        ></DropdownMenuItem>
                    </CueContextMenu>
                </div>
                <div class="field is-hidden-mobile">
                    <p class="control" title="Trash this cue">
                        <button class="button" @click="deleteThisCue()">
                            <!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC -->
                            <i class="icon mdi">
                                <svg viewBox="0 0 24 24">
                                    <path
                                        v-once
                                        fill="currentColor"
                                        :d="mdiTrashCanOutline"
                                    />
                                </svg>
                            </i>
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
import { type PropType, computed, inject, ref, type Ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import CueButton from '@/components/buttons/CueButton.vue';
import AdjustTimeButton from '@/components/buttons/AdjustTimeButton.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import TimeInput from '@/components/TimeInput.vue';
import LabeledInput from '@/components/editor/LabeledInput.vue';
import CoveredPanel from '@/components/CoveredPanel.vue';
import IfMedia from '@/components/IfMedia.vue';
import { mdiTrashCanOutline, mdiTextBoxPlusOutline } from '@mdi/js';
import { useAppStore } from '@/store/app';
import MeasureDisplay from '@/components/MeasureDisplay.vue';
import MeasureDifferenceDisplay from '@/components/MeasureDifferenceDisplay.vue';
import MetricalEditor from '@/components/editor/MetricalEditor.vue';
import { useSettingsStore } from '@/store/settings';
import {
    useMeasureNumbersInjectionKey,
    trackPreRollDurationInjectionKey,
    trackFadeInDurationInjectionKey,
} from '@/components/track/TrackInjectionKeys';
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import DropdownMenuButton from '@/components/dropdown-menu/DropdownMenuButton.vue';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
import MenuItemContent from '@/components/dropdown-menu/MenuItemContent.vue';
import type { ICue } from '@/store/ICue';
import type { PlaybackMode } from '@/store/PlaybackMode';
import PreRollSwitch from './buttons/PreRollSwitch.vue';
import FadeInSwitch from './buttons/FadeInSwitch.vue';
import CueContextMenu from '@/components/context-menu/CueContextMenu.vue';

const emit = defineEmits([
    /** Invokes the cue (using it's time) */
    'click',
    /** Requires a seek to the cue's time */
    'seek',
    /** Requires adjustment of the cue time to the current playback time */
    'adjust',
]);

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

const cueTime = computed(() => props.cue.Time);

const cueDescription: Ref<InstanceType<typeof HTMLInputElement> | null> =
    ref(null);

/** Updates the set cue description */
function updateDescription(event: Event) {
    const cueId = props.cue.Id;
    const shortcut = props.cue.Shortcut;
    const description = (event.target as HTMLInputElement).value;
    const remarks = props.cue.Remarks;
    app.updateCueData(cueId, description, remarks, shortcut, cueTime.value);
}

/** Updates the set cue remarks */
function updateRemarks(event: Event) {
    const cueId = props.cue.Id;
    const shortcut = props.cue.Shortcut;
    const description = props.cue.Description;
    const remarks = (event.target as HTMLInputElement).value;
    app.updateCueData(cueId, description, remarks, shortcut, cueTime.value);
}

// --- focus ---

/** Focus of the description follows the cue selection */
watch(
    () => props.isCueSelected,
    () => {
        if (props.isCueSelected) {
            focusDescription();
        }
    },
    {
        immediate: true,
    },
);

/** Sets the focus to the description input and sets the cursor to the start position */
function focusDescription() {
    cueDescription.value?.focus();
    cueDescription.value?.setSelectionRange(0, 0);
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
    const remarks = props.cue.Remarks;
    app.updateCueData(cueId, description, remarks, shortcut, time);

    //Also , for user convenience, to simplify adjusting cues, play at change
    //(while keeping the focus at the number spinner)
    seekTo(time);
}

/** Seeks to the cue time */
function seekTo(time: number | null) {
    if (Number.isFinite(time)) {
        emit('seek');
    }
}

/** Updates the set cue shortcut */
function updateShortcut(event: Event) {
    const cueId = props.cue.Id;
    const description = props.cue.Description;
    const remarks = props.cue.Remarks;
    const shortcut = (event.target as HTMLInputElement).value;
    app.updateCueData(cueId, description, remarks, shortcut, cueTime.value);
}

/** Handles the click event of the cue button */
function cueClick() {
    emit('click');
    focusDescription();
}

const settings = useSettingsStore();
const { experimentalUseMeter, experimentalShowRemarksEditors } =
    storeToRefs(settings);

const cuePlaceholder = computed(() => `Cue description`);

const useMeasureNumbers = inject(useMeasureNumbersInjectionKey);

// --- pre-roll ---
const preRollDuration = inject(trackPreRollDurationInjectionKey);

/** Updates the set omit pre-roll option */
function updateOmitPreRoll(omit: boolean) {
    const cueId = props.cue.Id;
    app.updateCueOmitPreRoll(cueId, omit);
}

// --- fade-in ---
const fadeInDuration = inject(trackFadeInDurationInjectionKey);

/** Updates the set omit fade-in option */
function updateOmitFadeIn(omit: boolean) {
    const cueId = props.cue.Id;
    app.updateCueOmitFadeIn(cueId, omit);
}
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
        padding-left: 0.5rem;
        padding-right: 0.5rem;
    }
}
/** desktop */
@media screen and (min-width: 1024px) {
    .cue.button {
        padding-left: 1rem;
        padding-right: 1rem;
    }
}

/** widescreen */
@media screen and (min-width: 1216px) {
    .cue.button {
        padding-left: 1.5rem;
        padding-right: 1.5rem;
    }
}

/* fullhd */
@media screen and (min-width: 1408px) {
    .cue.button {
        padding-left: 2rem;
        padding-right: 2rem;
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

<style lang="scss">
/*************************************************************
 * Specific styles for the cue duration
**************************************************************
*/
/** Use a really small font for the time display
(NOTE: this is similar to the playhead slider) */
.cue-duration.is-family-monospace {
    font-size: 0.65rem !important;
    margin-bottom: -40px;
}

.cue-duration-container {
    position: absolute;
    /** keep the duration inside the track editor outline */
    display: contents;
}

/*************************************************************
 * Specific styles for the cue remarks
**************************************************************
*/
/** Do not restrict height specifically */
.cue textarea.textarea {
    height: inherit;
}
</style>
