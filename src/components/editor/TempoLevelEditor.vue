<template>
    <div class="level">
        <div class="level-left">
            <!-- BPM -->
            <div class="level-item has-text-centered">
                <span class="has-opacity-half is-single-line">Tempo</span>
            </div>
            <div class="level-item is-flex-shrink-2">
                <div class="field">
                    <p class="control">
                        <BpmEditor
                            class="input"
                            :modelValue="props.beatsPerMinute"
                            @change="
                                emit(
                                    'update:beatsPerMinute',
                                    Number.parseInt($event.target.value),
                                )
                            "
                            placeholder="BPM"
                            title="BPM (Beats per minute)"
                        >
                        </BpmEditor>
                    </p>
                </div>
            </div>

            <!-- Time Signature -->
            <div class="level-item has-text-centered">
                <span class="has-opacity-half">Time Signature</span>
            </div>
            <div class="level-item is-flex-shrink-2">
                <div class="field">
                    <p class="control">
                        <TimeSignatureEditor
                            class="input"
                            :modelValue="props.timeSignature"
                            @update:modelValue="(value:ITimeSignature|null) => {emit('update:timeSignature', value);}"
                            title="Time signature"
                        >
                        </TimeSignatureEditor>
                    </p>
                </div>
            </div>

            <!-- Origin -->
            <div class="level-item has-text-centered">
                <span class="has-opacity-half">Origin</span>
            </div>
            <!-- A normal input for the time, with an adjustment add-on (from a bit wider screens)-->
            <div class="level-item">
                <div class="field has-addons has-addons-except-mobile">
                    <p class="control">
                        <TimeInput
                            class="has-text-right"
                            :modelValue="props.originTime"
                            @update:modelValue="(value:number|null) => {emit('update:originTime', value);}"
                            size="9"
                        />
                    </p>
                    <div class="control is-hidden-mobile">
                        <AdjustCueButton
                            @adjustCue="$emit('adjustOriginTime')"
                        ></AdjustCueButton>
                    </div>
                </div>
            </div>
            <div class="level-item is-flex-shrink-2">
                <div class="field">
                    <p class="control">
                        <LabeledCheckbox
                            :modelValue="props.useMeasureNumberAsPosition"
                            @update:modelValue="(value:boolean|null) => {emit('update:useMeasureNumberAsPosition', value);}"
                            label="Use measure number as position"
                            :disabled="!hasAllTempoValues"
                        ></LabeledCheckbox>
                    </p>
                </div>
            </div>
        </div>
        <div class="level-right">
            <!-- Metronome -->
            <div class="level-item is-flex-shrink-2">
                <div class="field">
                    <p class="control">
                        <a href="https://tic.replayer.app" target="_blank"
                            >TAP</a
                        >
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType, computed, watch } from 'vue';
import BpmEditor from '@/components/editor/BpmEditor.vue';
import TimeSignatureEditor from '@/components/editor/TimeSignatureEditor.vue';
import TimeInput from '@/components/TimeInput.vue';
import LabeledCheckbox from '@/components/editor/LabeledCheckbox.vue';
import AdjustCueButton from '@/components/buttons/AdjustCueButton.vue';
import { ITimeSignature } from '@/code/compilation/ITimeSignature';

/** A level-based Editor for tempo-related values
 * @remarks Shows a level with inputs for BPM, time signature etc., as level items
 */

const emit = defineEmits([
    'update:timeSignature',
    'update:denominator',
    'update:beatsPerMinute',
    'update:originTime',
    'update:useMeasureNumberAsPosition',
]);

const props = defineProps({
    timeSignature: {
        type: null as unknown as PropType<ITimeSignature | null>,
        required: true,
        default: null,
    },
    beatsPerMinute: {
        type: null as unknown as PropType<number | null>,
        required: true,
        default: null,
    },
    /** The origin of the track beats (the first downbeat of the first measure) */
    originTime: {
        type: null as unknown as PropType<number | null>,
        required: true,
        default: null,
    },
    /** Whether to use the measure number to set and display the cue positions */
    useMeasureNumberAsPosition: {
        type: null as unknown as PropType<boolean | null>,
        required: true,
        default: null,
    },
});

/** Whether all required values for the use of the measure number as position are available.
 */
const hasAllTempoValues = computed(() => {
    return (
        (Number.isFinite(props.beatsPerMinute) &&
            Number.isFinite(props.timeSignature?.Denominator) &&
            Number.isFinite(props.timeSignature?.Numerator) &&
            Number.isFinite(props.originTime)) ??
        false
    );
});

/** Watches whether any of the required values for the use of the measure number as position is missing; reset the option if true.
 */
watch(
    hasAllTempoValues,
    (hasAllValues) => {
        console.debug('hasAllValues:', hasAllValues);
        if (hasAllValues === false) {
            emit('update:useMeasureNumberAsPosition', false);
        }
    },
    { immediate: true },
);
</script>
<style scoped>
/** Actually never use the adjust button hotkey area, because it's never used here */

:deep(.button .is-invisible) {
    display: none;
}
</style>
