<template>
    <slot></slot>
    <div class="is-flex is-justify-content-space-between">
        <!-- Let the attributes fall through the input element: -->
        <input
            class="input time-signature has-text-right"
            v-bind="$attrs"
            type="number"
            inputmode="numeric"
            step="1"
            min="1"
            v-model.number="vModelNumerator"
            size="2"
            data-cy="input-timeSignatureNumerator"
            tabindex="0"
            title="Time signature numerator"
        />
        <span class="mt-2">/</span>
        <!-- Let the attributes fall through the input element: -->
        <input
            class="input time-signature has-text-right"
            v-bind="$attrs"
            type="number"
            inputmode="numeric"
            step="1"
            min="1"
            v-model.number="vModelDenominator"
            size="2"
            data-cy="input-timeSignatureDenominator"
            tabindex="0"
            title="Time signature denominator"
        />
    </div>
</template>

<script setup lang="ts">
import { ITimeSignature } from '@/code/music/ITimeSignature';
import { TimeSignature } from '@/code/music/TimeSignature';
import { PropType, computed } from 'vue';

/** A field of large cue buttons for a track
 */

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
    modelValue: {
        type: null as unknown as PropType<ITimeSignature | null>,
        required: false,
        default: null,
    },
});

const vModelNumerator = computed<number | null>({
    get(): number | null {
        return props.modelValue?.Numerator ?? null;
    },
    set(value): void {
        emit(
            'update:modelValue',
            new TimeSignature(value, props.modelValue?.Denominator ?? null),
        );
    },
});
const vModelDenominator = computed<number | null>({
    get(): number | null {
        return props.modelValue?.Denominator ?? null;
    },
    set(value): void {
        emit(
            'update:modelValue',
            new TimeSignature(props.modelValue?.Numerator ?? null, value),
        );
    },
});
</script>
<style lang="scss">
input.time-signature {
    width: 7ch;
}
</style>
