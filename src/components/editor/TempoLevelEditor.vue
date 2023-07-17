<template>
    <div class="level is-mobile">
        <div class="level-left level-wrap">
            <!-- BPM -->
            <div class="level-item has-text-left">
                <div class="field is-horizontal">
                    <div class="field-label is-normal">
                        <label class="label">Tempo</label>
                    </div>
                    <div class="field-body">
                        <div class="field">
                            <p class="control">
                                <BpmEditor
                                    class="input"
                                    :modelValue="props.meter?.BeatsPerMinute"
                                    @change="
                                        updateMeterWithBpm(
                                            Number.parseFloat(
                                                $event.target.value,
                                            ),
                                        )
                                    "
                                    placeholder="BPM"
                                    title="BPM (Beats per minute)"
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
                                    :modelValue="props.meter?.TimeSignature"
                                    @update:modelValue="
                              (value:ITimeSignature|null) =>   updateMeterWithTimeSignature(value)
                            "
                                    title="Time signature"
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
                                    :modelValue="props.meter?.OriginTime"
                                    @update:modelValue="(value:number|null) => updateMeterWithOriginTime(value)"
                                    size="9"
                                />
                            </p>
                            <p class="control is-hidden-mobile">
                                <AdjustCueButton
                                    @adjustCue="$emit('adjustOriginTime')"
                                ></AdjustCueButton>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="level-item is-flex-shrink-2">
                <div class="field">
                    <p class="control">
                        <LabeledCheckbox
                            :modelValue="props.useMeasureNumbers"
                            @update:modelValue="(value:boolean|null) => updateUseMeasureNumbers(value)"
                            label="Show measure numbers"
                            :disabled="!hasAllTempoValues"
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
import { PropType, computed, watch } from 'vue';
import BpmEditor from '@/components/editor/BpmEditor.vue';
import TimeSignatureEditor from '@/components/editor/TimeSignatureEditor.vue';
import TimeInput from '@/components/TimeInput.vue';
import LabeledCheckbox from '@/components/editor/LabeledCheckbox.vue';
import AdjustCueButton from '@/components/buttons/AdjustCueButton.vue';
import { IMeter } from '@/code/music/IMeter';
import { Meter } from '@/code/music/Meter';
import { ITimeSignature } from '@/code/music/ITimeSignature';

/** A level-based Editor for tempo-related values
 * @remarks Shows a level with inputs for BPM, time signature etc., as level items
 */

const emit = defineEmits([
    'update:meter',
    'adjustOriginTime',
    'update:useMeasureNumbers',
]);

const props = defineProps({
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

function updateMeterWithBpm(bpm: number): void {
    const meter = new Meter(
        props.meter?.TimeSignature ?? null,
        bpm,
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
