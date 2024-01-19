<template>
    <ToggleButton
        :class="{
            'is-inactive': !modelValue,
        }"
        :is-engaged="modelValue"
        engaged-label="fullscreen is on"
        disengaged-label="fullscreen is off"
        @click="emit('update:modelValue', !modelValue)"
    >
        <BaseIcon v-if="modelValue" :path="mdiFullscreenExit" />
        <BaseIcon v-else :path="mdiFullscreen" />
    </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/buttons/ToggleButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';

/** A toggle button for the fading state
 */
const modelValue = defineModel({ type: Boolean, required: true });

const emit = defineEmits(['update:modelValue']);
</script>
