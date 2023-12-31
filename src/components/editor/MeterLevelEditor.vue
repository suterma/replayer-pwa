<template>
    <div class="level is-mobile">
        <div class="level-left level-wrap">
            <!-- BPM -->
            <div class="level-item">
                <div class="field is-horizontal">
                    <div class="field-label is-normal">
                        <label class="label is-single-line">BPM</label>
                    </div>
                    <div class="field-body">
                        <div class="field">
                            <p class="control">
                                <BpmEditor
                                    class="input"
                                    :model-value="props.meter?.BeatsPerMinute"
                                    placeholder="BPM"
                                    @update:model-value="
                                        (value: number | null) =>
                                            updateMeterWithBpm(value)
                                    "
                                >
                                </BpmEditor>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Time Signature -->
            <div class="level-item">
                <div class="field is-horizontal">
                    <div class="field-label is-normal">
                        <label class="label is-single-line"
                            >Time Signature</label
                        >
                    </div>
                    <div class="field-body">
                        <div class="field">
                            <p class="control">
                                <TimeSignatureEditor
                                    class="input"
                                    :model-value="props.meter?.TimeSignature"
                                    title="Time signature"
                                    @update:model-value="
                                        (value: ITimeSignature | null) =>
                                            updateMeterWithTimeSignature(value)
                                    "
                                >
                                </TimeSignatureEditor>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Origin -->
            <div class="level-item">
                <div class="field is-horizontal">
                    <div class="field-label is-normal">
                        <label class="label is-single-line">Origin</label>
                    </div>
                    <div class="field-body">
                        <div class="field has-addons has-addons-except-mobile">
                            <p class="control">
                                <TimeInput
                                    class="has-text-right"
                                    :model-value="props.meter?.OriginTime"
                                    size="9"
                                    @update:model-value="
                                        (value: number | null) =>
                                            updateMeterWithOriginTime(value)
                                    "
                                />
                            </p>
                            <p class="control is-hidden-mobile">
                                <AdjustTimeButton
                                    @adjust-time="$emit('adjustOriginTime')"
                                ></AdjustTimeButton>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="level-item is-flex-shrink-2">
                <div class="field">
                    <p class="control">
                        <LabeledCheckbox
                            :model-value="props.useMeasureNumbers"
                            label="Show measure numbers"
                            :disabled="!hasAllTempoValues"
                            @update:model-value="
                                (value: boolean | null) =>
                                    updateUseMeasureNumbers(value)
                            "
                        ></LabeledCheckbox>
                    </p>
                </div>
            </div>
            <!-- Slot for additional level items -->
            <slot name="left-end"></slot>
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
import { type PropType, computed, watch } from 'vue';
import TimeSignatureEditor from '@/components/editor/TimeSignatureEditor.vue';
import BpmEditor from '@/components/editor/BpmEditor.vue';
import TimeInput from '@/components/TimeInput.vue';
import LabeledCheckbox from '@/components/editor/LabeledCheckbox.vue';
import AdjustTimeButton from '@/components/buttons/AdjustTimeButton.vue';
import type { IMeter } from '@/code/music/IMeter';
import { Meter } from '@/code/music/Meter';
import type { ITimeSignature } from '@/code/music/ITimeSignature';

/** A level-based Editor for tempo-related values
 * @remarks Shows a level with inputs for BPM, time signature etc., as level items
 */

const emit = defineEmits([
    'update:meter',
    'adjustOriginTime',
    'update:useMeasureNumbers',
]);

const props = defineProps({
    /** The beats per minute */
    beatsPerMinute: {
        type: null as unknown as PropType<number | null>,
        required: true,
        default: null,
    },
    /** The musical meter */
    meter: {
        type: null as unknown as PropType<IMeter | null>,
        required: true,
        default: null,
    },
    /** Whether to use the measure number to set and display the cue positions */
    useMeasureNumbers: {
        type: null as unknown as PropType<boolean | null>,
        required: true,
        default: null,
    },
});

/** Whether all required values for the use of the measure number as position are available.
 */
const hasAllTempoValues = computed(() => {
    return Meter.isValid(props.meter);
});

function updateMeterWithBpm(beatsPerMinute: number | null): void {
    const meter = new Meter(
        props.meter?.TimeSignature ?? null,
        beatsPerMinute,
        props.meter?.OriginTime ?? null,
    );

    emit('update:meter', meter);
}

function updateMeterWithTimeSignature(
    timeSignature: ITimeSignature | null,
): void {
    const meter = new Meter(
        timeSignature,
        props.meter?.BeatsPerMinute ?? null,
        props.meter?.OriginTime ?? null,
    );

    emit('update:meter', meter);
}

function updateMeterWithOriginTime(originTime: number | null): void {
    const meter = new Meter(
        props.meter?.TimeSignature ?? null,
        props.meter?.BeatsPerMinute ?? null,
        originTime,
    );

    emit('update:meter', meter);
}

function updateUseMeasureNumbers(useMeasureNumbers: boolean | null): void {
    emit('update:useMeasureNumbers', useMeasureNumbers);
}

/** Watches whether any of the required values for the use of the measure number as position is missing; reset the option if true.
 */
watch(
    hasAllTempoValues,
    (hasAllValues) => {
        if (hasAllValues === false) {
            updateUseMeasureNumbers(false);
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
