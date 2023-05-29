<template>
    <slot></slot>
    <!-- Let the attributes fall through the input element: -->
    <input
        class="bpm has-text-right"
        v-bind="$attrs"
        type="number"
        inputmode="numeric"
        step="1"
        min="0"
        v-model.number="vModel"
        size="3"
        data-cy="input-beatsPerMinute"
        :placeholder="placeholder"
        tabindex="0"
    />
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';

/** A field of large cue buttons for a track
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
    placeholder: {
        type: String,
        default: undefined,
    },
});

const vModel = computed<number | null>({
    get(): number | null {
        return props.modelValue;
    },
    set(value): void {
        emit('update:modelValue', value);
    },
});
</script>
<style lang="scss">
input.bpm {
    width: 8ch;
}
</style>
