<template>
    <CollapsiblePanel
        :iconPath="mdiPlus"
        :modelValue="modelValue"
        :hideButton="modelValue"
        @update:modelValue="reveal"
    >
        <template #caption @click="reveal" v-if="!modelValue"
            ><slot name="caption"></slot
        ></template>

        <slot></slot>
    </CollapsiblePanel>
</template>
<script setup lang="ts">
/** A panel with an expander button that controls the expansion state of the slotted content.
 * @remarks Internally uses the "CollapsiblePanel" component, with some changes:
 * The caption and icon is only shown when the content is collapsed/cloaked. This supports a "one-off" expansion use case.
 * @remarks the v-if directive is used, completely omitting collapsed content, if not displayed.
 */
import CollapsiblePanel from '@/components/CollapsiblePanel.vue';
import { mdiPlus } from '@mdi/js';
import { ref } from 'vue';

const modelValue = ref(false);

function reveal() {
    modelValue.value = true;
}
</script>
