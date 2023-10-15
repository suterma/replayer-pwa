<template>
    <ToggleButton
        class="button"
        :class="{
            'is-inactive': !modelValue,
        }"
        :isEngaged="modelValue"
        engaged-label="fade-in-out active"
        disengaged-label="no fading"
        @click="togglePlaybackMode()"
    >
        <BaseIcon v-if="modelValue" :path="mdiNetworkStrength4" />
        <BaseIcon v-else :path="mdiNetworkStrengthOff" />
    </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/buttons/ToggleButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiNetworkStrength4, mdiNetworkStrengthOff } from '@mdi/js';

/** A toggle button for the fading state
 */
const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue']);

function togglePlaybackMode() {
    emit('update:modelValue', !props.modelValue);
}
</script>
