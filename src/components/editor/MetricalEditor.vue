<template>
    <slot></slot>
    <!-- Let the attributes fall through the input element: -->
    <input
        class="input bpm has-text-right"
        v-bind="$attrs"
        type="number"
        inputmode="numeric"
        step="1"
        min="1"
        v-model.number="vModel"
        size="3"
        data-cy="input-measure"
        :placeholder="placeholder"
        tabindex="0"
    />
</template>

<script setup lang="ts">
import { IMeter } from '@/code/music/IMeter';
import { Meter } from '@/code/music/Meter';
import { MetricalPosition } from '@/code/music/MetricalPosition';
import CompilationHandler from '@/store/compilation-handler';
import { PropType, computed } from 'vue';

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
    /** The musical meter */
    meter: {
        type: null as unknown as PropType<IMeter | null>,
        required: true,
        default: null,
    },
    placeholder: {
        type: String,
        default: undefined,
    },
});
/**  */
const vModel = computed<number | null>({
    get(): number | null {
        if (props.meter) {
            return (
                Meter.fromTime(props.modelValue, props.meter)?.Measure ?? null
            );
        }
        return null;
    },
    set(value): void {
        if (value != null) {
            if (props.meter) {
                const temporalPosition = Meter.toTime(
                    new MetricalPosition(value, null),
                    props.meter,
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
