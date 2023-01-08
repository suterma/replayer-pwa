<template>
    <CollapsibleButton
        class="is-nav"
        v-model="isExpanded"
        collapsedText="Click to expand "
        expandedText="Click to collapse"
        ><span><slot name="caption"></slot></span
    ></CollapsibleButton>
    <template v-if="isExpanded"><slot></slot></template>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';

/** A panel with an expander button that controls the expansion state of the slotted content.
 * @remarks the v-if directive is used, completely omitting collapsed content, if not displayed.
 */
export default defineComponent({
    name: 'CollapsiblePanel',
    components: { CollapsibleButton },

    data() {
        return {
            /** Whether the panel displayed in the expanded state */
            isExpanded: false,
        };
    },
});
</script>
