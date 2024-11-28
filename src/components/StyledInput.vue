<template>
    <slot></slot>
    <!-- Let the attributes fall through the input element: -->
    <input
        v-bind="$attrs"
        :value="modelValue"
        type="text"
        inputmode="text"
        :placeholder="placeholder"
        tabindex="0"
        @input="
            $emit(
                'update:modelValue',
                ($event.target as HTMLInputElement).value,
            )
        "
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** A text input that accepts fallthrough attributes like class, etc.
 * @remarks Provides a slot for a prefix content
 */
export default defineComponent({
    name: 'StyledInput',
    components: {},
    props: {
        /* The input text */
        modelValue: {
            type: String,
            default: undefined,
        },

        placeholder: {
            type: String,
            default: undefined,
        },
    },
    emits: ['update:modelValue'],
});
</script>
