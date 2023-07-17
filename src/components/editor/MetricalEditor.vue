<template>
    <input
        class="input bpm has-text-right"
        type="number"
        inputmode="numeric"
        step="1"
        :min="minimumValue"
        v-model.number="vModel"
        size="3"
        data-cy="input-measure"
        :placeholder="placeholder"
        tabindex="0"
        title="Measure number"
    />
</template>

<script setup lang="ts">
import { Meter } from '@/code/music/Meter';
import { MetricalPosition } from '@/code/music/MetricalPosition';
import CompilationHandler from '@/store/compilation-handler';
import { PropType, computed, inject } from 'vue';
import { meterInjectionKey } from '@/components/track/TrackInjectionKeys';

/** An editor for the measure number
 */
const emit = defineEmits(['update:modelValue']);

const props = defineProps({
    /** The current playhead position in the track, in [seconds]
     * @remarks This value is internally computed into [measure], with regards to the currently set meter
     */
    modelValue: {
        type: null as unknown as PropType<number | null>,
        default: null,
    },

    placeholder: {
        type: String,
        default: undefined,
    },

    /** Whether to handle the modelValue as differential time (not regarding the origin time)
     */
    differential: {
        type: Boolean,
        default: false,
        required: false,
    },
});

/** The musical meter */
const meter = inject(meterInjectionKey);

/**  */
const vModel = computed<number | null>({
    get(): number | null {
        if (usableMeter.value) {
            return (
                Meter.fromTime(props.modelValue, usableMeter?.value)?.Measure ??
                defaultValue.value
            );
        }
        return defaultValue.value;
    },
    set(value): void {
        if (value != null) {
            if (usableMeter.value) {
                const temporalPosition = Meter.toTime(
                    new MetricalPosition(value, null),
                    usableMeter.value,
                );
                // only actual numbers should be emitted, not empty strings or NaN
                if (
                    temporalPosition != null &&
                    Number.isFinite(temporalPosition)
                ) {
                    emit(
                        'update:modelValue',
                        CompilationHandler.roundTime(temporalPosition),
                    );
                }
            }
        }
    },
});

/** The actual Meter to use. For the differential mode, the origin is replaced with the actual measure duration to allow a zero-based measure time */
const usableMeter = computed(() => {
    const actualMeter = meter?.value;
    if (props.differential && actualMeter) {
        return new Meter(
            meter?.value?.TimeSignature ?? null,
            meter?.value?.BeatsPerMinute ?? null,
            Meter.measureDuration(
                actualMeter,
            ) /* omitting the actual origin time */,
        );
    } else return actualMeter;
});

/** The minimum value to use. For the differential mode, a zero-based measure is applied */
const minimumValue = computed(() => {
    return props.differential ? 0 : 1;
});

/** The default value to use. For the differential mode, zero is the default value */
const defaultValue = computed(() => {
    return props.differential ? 0 : null;
});
</script>
<style lang="scss">
input.bpm {
    width: 8ch;
}
</style>
