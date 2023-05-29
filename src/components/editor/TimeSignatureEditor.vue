<template>
    <slot></slot>
    <div class="is-flex is-justify-content-space-between">
        <!-- Let the attributes fall through the input element: -->
        <input
            class="time-signature has-text-right"
            v-bind="$attrs"
            type="number"
            inputmode="numeric"
            step="1"
            min="1"
            v-model.number="vModelNumerator"
            size="2"
            data-cy="input-timeSignatureNumerator"
            tabindex="0"
            title="Numerator"
        />
        <span class="mt-2">/</span>
        <!-- Let the attributes fall through the input element: -->
        <input
            class="time-signature has-text-right"
            v-bind="$attrs"
            type="number"
            inputmode="numeric"
            step="1"
            min="1"
            v-model.number="vModelDenominator"
            size="2"
            data-cy="input-timeSignatureDenominator"
            tabindex="0"
            title="Denominator"
        />
    </div>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';

/** A field of large cue buttons for a track
 */

const emit = defineEmits(['update:numerator', 'update:denominator']);

const props = defineProps({
    numerator: {
        type: null as unknown as PropType<number | null>,
        required: false,
        default: null,
    },
    denominator: {
        type: null as unknown as PropType<number | null>,
        required: false,
        default: null,
    },
});

const vModelNumerator = computed<number | null>({
    get(): number | null {
        return props.numerator;
    },
    set(value): void {
        emit('update:numerator', value);
    },
});
const vModelDenominator = computed<number | null>({
    get(): number | null {
        return props.denominator;
    },
    set(value): void {
        emit('update:denominator', value);
    },
});
</script>
<style lang="scss">
input.time-signature {
    width: 7ch;
}
</style>
