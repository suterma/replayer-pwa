<template>
    <slot></slot>
    <!-- Let the attributes fall through the input element: -->
    <input
        v-bind="$attrs"
        :value="modelValue"
        ref="styled-input"
        @input="
            $emit(
                'update:modelValue',
                ($event.target as HTMLInputElement).value,
            )
        "
        type="text"
        inputmode="text"
        :placeholder="placeholder"
        tabindex="0"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** A text input, which has a dedicated edit icon.
 * @remarks Provides a slot for a prefix content
 */
export default defineComponent({
    name: 'StyledInput',
    components: {},
    emits: ['update:modelValue'],
    props: {
        /* The input text */
        modelValue: {
            type: String,
            default: undefined,
        },
        /** The placeholder to show in edit mode, when empty
         */
        placeholder: {
            type: String,
            default: undefined,
        },

        /** Whether this input should get focus when mounted
         * @devdoc v-focus does not work since the directive does not fall through
         */
        focus: {
            type: Boolean,
            default: false,
        },
    },
    mounted: function (): void {
        if (this.focus) {
            (this.$refs['styled-input'] as HTMLInputElement).focus();
        }
    },
});
</script>
<style scoped></style>
