<template>
    <ToggleButton
        class="button"
        :class="{
            'is-inactive': !model,
        }"
        :is-engaged="model"
        engaged-label="pre-roll is on"
        disengaged-label="pre-roll is off"
        @click="togglePreRollMode()"
    >
        <BaseIcon v-if="model" :path="mdiCircleSmall" />
        <BaseIcon v-else :path="mdiRayEndArrow" />
    </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/buttons/ToggleButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiRayEndArrow, mdiCircleSmall } from '@mdi/js';

/** A toggle button for the pre-roll state
 */
const model = defineModel({ type: Boolean, default: false, required: true });

const emit = defineEmits(['update:modelValue']);

function togglePreRollMode() {
    emit('update:modelValue', !(model.value === true));
}
</script>
