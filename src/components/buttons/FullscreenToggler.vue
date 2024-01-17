<template>
    <ToggleButton
        class="button"
        :class="{
            'is-inactive': !model,
        }"
        :is-engaged="model"
        engaged-label="fullscreen is on"
        disengaged-label="fullscreen is off"
        @click="emit('update:modelValue', !model)"
    >
        <BaseIcon v-if="model" :path="mdiFullscreenExit" />
        <BaseIcon v-else :path="mdiFullscreen" />
    </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/buttons/ToggleButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';

/** A toggle button for the fading state
 */
const model = defineModel({ default: false, required: true });

const emit = defineEmits(['update:modelValue']);
</script>
