<template>
    <CollapsibleButton
        v-show="!modelValue && !shouldReveal"
        class="is-nav"
        :modelValue="modelValue"
        @update:modelValue="() => reveal()"
        collapsedText="Click to reveal"
        :iconPath="mdiPlus"
        ><span><slot name="caption"></slot></span
    ></CollapsibleButton>
    <!-- Transition for the revealing action. 
        Uses an additional element to make sure that there is a single root within the transition slot -->
    <Transition name="list">
        <div v-if="modelValue || shouldReveal">
            <slot></slot>
        </div>
    </Transition>
</template>
<script setup lang="ts">
/** A panel with an one-off expander button that triggers the expansion state of the slotted content.
 * @remarks Works similar to the "CollapsiblePanel" component, with some differences:
 * The caption and icon is only shown when the content is collapsed/cloaked.
 * @remarks the v-if directive is used, completely omitting collapsed content, if not displayed.
 */
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import { mdiPlus } from '@mdi/js';
import { PropType, computed, ref } from 'vue';

/** Whether to show this panel as expanded */
const modelValue = ref(false);

function reveal() {
    modelValue.value = true;
}
// eslint-disable-next-line no-undef
const props = defineProps({
    /** The values to reveal this panel for, if any of them are set
     */
    revealFor: Array as PropType<Array<unknown>>,
});

/** Whether the panel should be revealed based on available content. */
const shouldReveal = computed(() => {
    if (!props.revealFor) return false;

    const hasContent = props.revealFor.filter((item) => {
        return item ? true : false;
    });
    return hasContent.length > 0 ?? false;
});
</script>
<style>
/* we will explain what these classes do next! */
.v-enter-active,
.v-leave-active {
    transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
    opacity: 0;
}
</style>
