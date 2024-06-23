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
        <!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC -->
        <i class="icon mdi">
            <svg viewBox="0 0 24 24">
                <path
                    fill="currentColor"
                    :d="modelValue ? mdiFullscreenExit : mdiFullscreen"
                />
            </svg>
        </i>
    </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/buttons/ToggleButton.vue';
import { mdiFullscreen, mdiFullscreenExit } from '@mdi/js';

/** A toggle button for the fading state
 */
const modelValue = defineModel({ type: Boolean, required: true });

const emit = defineEmits(['update:modelValue']);
</script>
