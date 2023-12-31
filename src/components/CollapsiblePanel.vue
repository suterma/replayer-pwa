<template>
    <CollapsibleButton
        class="is-nav"
        :model-value="modelValue"
        collapsed-text="Click to expand "
        expanded-text="Click to collapse"
        :icon-path="iconPath"
        @update:model-value="(value) => (modelValue = value)"
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
import { ref } from 'vue';

// eslint-disable-next-line no-undef
defineProps({
    /** The icon to use, which is a chevron by default
     */
    iconPath: {
        type: String,
        default: mdiChevronDown,
    },
});

/** Whether to show this panel as expanded */
const modelValue = ref(false);
</script>
