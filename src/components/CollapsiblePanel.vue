<template>
    <CollapsibleButton
        v-if="!hideExpandedButton || !isExpanded"
        class="is-nav"
        v-model="isExpanded"
        collapsedText="Click to expand "
        expandedText="Click to collapse"
        ><span><slot name="caption"></slot></span
    ></CollapsibleButton>
    <template v-if="isExpanded"><slot></slot></template>
</template>
<script setup lang="ts">
/** A panel with an expander button that controls the expansion state of the slotted content.
 * @remarks the v-if directive is used, completely omitting collapsed content, if not displayed.
 */
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import { ref, defineProps } from 'vue';

defineProps({
    /** Hides the toggle button in the expanded state */
    hideExpandedButton: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const isExpanded = ref(false);
</script>
