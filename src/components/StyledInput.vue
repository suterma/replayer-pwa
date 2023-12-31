<template>
    <slot></slot>
    <!-- Let the attributes fall through the input element: -->
    <input
        v-bind="$attrs"
        ref="styled-input"
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

        /** Whether this input should get focus when mounted
         * @devdoc v-focus does not work since the directive does not fall through
         */
        focusOnMounted: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue'],
    mounted: function (): void {
        if (this.focusOnMounted) {
            // Since the input might not be rendered until the next DOM update,
            // defer the actual focussing
            // See https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/Vue_refs_focus_management#vues_nexttick_method
            this.$nextTick(() => {
                (this.$refs['styled-input'] as HTMLInputElement).focus();
            });
        }
    },
});
</script>
