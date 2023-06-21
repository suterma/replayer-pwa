<template>
    <!-- Let the disabled attribute go to the label and input element: -->
    <label class="checkbox" :disabled="disabled">
        <input
            type="checkbox"
            v-model.number="vModel"
            tabindex="0"
            :disabled="disabled"
        />
        {{ label }}
    </label>
</template>

<script setup lang="ts">
import { PropType, computed } from 'vue';

/** A simple checkbox with an associated label
 */

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
    /** The checked state
     * @remarks Accepts null as initial state, which will be handled as false.
     */
    modelValue: {
        type: null as unknown as PropType<boolean | null>,
        required: false,
        default: false,
    },
    label: {
        type: String,
        default: undefined,
    },
    /** Whether to show the component in a disabled state
     * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
     */
    disabled: Boolean,
});

const vModel = computed<boolean | null>({
    get(): boolean | null {
        return props.modelValue;
    },
    set(value): void {
        // only actual booleans should be emitted, not (empty or other) strings
        emit('update:modelValue', value ? true : false);
    },
});
</script>
