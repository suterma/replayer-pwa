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
    <!-- Transition for the revealing action. 
        Uses an additional element to make sure that there is a single root within the transition slot -->
    <Transition :name="transitionName">
        <template v-if="modelValue"
            ><slot :modelValue="modelValue"></slot
        ></template>
    </Transition>
</template>
<script setup lang="ts">
/** A panel with an expander button that controls the expansion state of the slotted content.
 * @remarks the v-if directive is used, completely omitting collapsed content, if not displayed.
 *
 * @remarks Works similar to the "CoveredPanel" component, with some differences:
 * - The caption and icon is always shown.
 * - A parent component can explicitly cover and reveal the content via
 * exposed functions
 */

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
    /** The name of the transition to use for revealing
     * @remarks Default is "item-expand"
     *  */
    transitionName: {
        type: String,
        default: 'item-expand',
    },
});

/** Whether to show this panel as expanded */
const modelValue = ref(false);

defineExpose({
    /** A parent component can handle expansion fullscreen */
    modelValue,
});
</script>
