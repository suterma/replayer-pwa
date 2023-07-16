<template>
    <input
        class="input bpm has-text-right"
        type="number"
        inputmode="numeric"
        step="1"
        min="1"
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
import { meterInjectionKey } from '../TrackInjectionKeys';

/** An editor for the measure number
 */
const emit = defineEmits(['update:modelValue']);

const props = defineProps({
    /** The current playhead position in the track
     */
    modelValue: {
        type: null as unknown as PropType<number | null>,
        default: null,
    },

    placeholder: {
        type: String,
        default: undefined,
    },
});

/** The musical meter */
const meter = inject(meterInjectionKey);

/**  */
const vModel = computed<number | null>({
    get(): number | null {
        if (meter?.value) {
            return (
                Meter.fromTime(props.modelValue, meter?.value)?.Measure ?? null
            );
        }
        return null;
    },
    set(value): void {
        if (value != null) {
            if (meter?.value) {
                const temporalPosition = Meter.toTime(
                    new MetricalPosition(value, null),
                    meter.value,
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
</script>
<style lang="scss">
input.bpm {
    width: 8ch;
}
</style>
