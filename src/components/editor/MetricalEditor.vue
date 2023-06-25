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
        data-cy="input-beatsPerMinute"
        :placeholder="placeholder"
        tabindex="0"
    />
</template>

<script setup lang="ts">
import { ITimeSignature } from '@/code/compilation/ITimeSignature';
import { MetricalPosition } from '@/code/compilation/MetricalPosition';
import CompilationHandler from '@/store/compilation-handler';
import { PropType, computed } from 'vue';

/** An time editor, which is using the measure number for manipulation
 */

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
    /** The beats per Minute
     */
    modelValue: {
        type: null as unknown as PropType<number | null>,
        required: false,
        default: null,
    },
    /** The beat origin (offset in the track time)
     */
    origin: {
        type: Number,
        required: true,
    },

    /** The tempo in beats per minute.
     */
    beatsPerMinute: {
        type: Number,
        required: true,
    },
    /** The time signature
     */
    timeSignature: {
        type: null as unknown as PropType<ITimeSignature>,
        required: true,
    },
    placeholder: {
        type: String,
        default: undefined,
    },
});
/**  */
const vModel = computed<number | null>({
    get(): number | null {
        return (
            CompilationHandler.convertToMetricalPosition(
                props.modelValue,
                props.origin,
                props.beatsPerMinute,
                props.timeSignature,
            )?.Measure ?? null
        );
    },
    set(value): void {
        if (value != null) {
            const temporalPosition =
                CompilationHandler.convertFromMetricalPosition(
                    new MetricalPosition(value, null),
                    props.origin,
                    props.beatsPerMinute,
                    props.timeSignature,
                );
            // only actual numbers should be emitted, not empty strings or NaN
            if (temporalPosition != null && Number.isFinite(temporalPosition)) {
                emit(
                    'update:modelValue',
                    CompilationHandler.roundTime(temporalPosition),
                );
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
