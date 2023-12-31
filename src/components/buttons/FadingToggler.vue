<template>
    <ToggleButton
        class="button"
        :class="{
            'is-inactive': !modelValue,
        }"
        :is-engaged="modelValue"
        engaged-label="fading is on"
        disengaged-label="fading is off"
        @click="togglePlaybackMode()"
    >
        <BaseIcon v-if="modelValue" :path="mdiNetworkStrength4" />
        <BaseIcon v-else :path="mdiNetworkStrengthOutline" />
    </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/buttons/ToggleButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiNetworkStrength4, mdiNetworkStrengthOutline } from '@mdi/js';

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
