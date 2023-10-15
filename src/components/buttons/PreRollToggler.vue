<template>
    <ToggleButton
        class="button"
        :class="{
            'is-inactive': !modelValue,
        }"
        :isEngaged="modelValue"
        engaged-label="pre-roll is on"
        disengaged-label="pre-roll is off"
        @click="togglePreRollMode()"
    >
        <BaseIcon v-if="modelValue" :path="mdiRayEndArrow" />
        <BaseIcon v-else :path="mdiRayVertex" />
    </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/buttons/ToggleButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiRayEndArrow, mdiRayVertex } from '@mdi/js';

/** A toggle button for the pre-roll state
 */
const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue']);

function togglePreRollMode() {
    emit('update:modelValue', !props.modelValue);
}
</script>
