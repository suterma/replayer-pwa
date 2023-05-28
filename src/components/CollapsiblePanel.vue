<template>
    <CollapsibleButton
        class="is-nav"
        :modelValue="modelValue"
        @update:modelValue="(value) => emit('update:modelValue', value)"
        collapsedText="Click to expand "
        expandedText="Click to collapse"
        :iconPath="iconPath"
        ><span><slot name="caption"></slot></span
    ></CollapsibleButton>
    <template v-if="modelValue"><slot></slot></template>
</template>
<script setup lang="ts">
/** A panel with an expander button that controls the expansion state of the slotted content.
 * @remarks the v-if directive is used, completely omitting collapsed content, if not displayed.
 */
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import { mdiChevronDown } from '@mdi/js';

// eslint-disable-next-line no-undef
defineProps({
    /** The icon to use, which is a chevron by default
     */
    iconPath: {
        type: String,
        default: mdiChevronDown,
    },
    /** Whether this represents the expanded state. */
    modelValue: {
        type: Boolean,
        default: false,
    },
});

// eslint-disable-next-line no-undef
const emit = defineEmits(['update:modelValue']);
</script>
