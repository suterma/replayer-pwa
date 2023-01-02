<template>
        <slot></slot>
        <!-- Let the attributes fall through the input element: -->
        <input
            v-bind="$attrs"
            v-focus
         
            :value="modelValue"
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
    },
    data() {
        return {};
    },
    computed: {},
    methods: {
        updateValue() {
            // this.$emit('update:modelValue', this.modelValue);
            //this.$emit('update:modelValue', event);
        },
    },
    watch: {},
});
</script>
<style scoped></style>
