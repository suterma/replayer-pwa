<template>
    <div ref="container">
        <slot
            :is-fullscreen="isFullscreen"
            :toggle="toggle"
            :exit="exit"
        ></slot>
    </div>
</template>
<script setup lang="ts">
/** A panel for full-screen display using the Fullscreen API, if available.
 * A fallback with a modal dialog is used otherwise.
 * @remarks The parent component can control the slot's fullscreen state
 * via the slot's passed props and functions
 * @devdoc Apple iPhone devices do not support the Fullscreen API.
 * See https://caniuse.com/fullscreen
 */
import { useFullscreen } from '@vueuse/core';
import { ref } from 'vue';

/// --- fullscreen ---

const container = ref<HTMLElement | null>(null);
const { isFullscreen, exit, toggle } = useFullscreen(container);

defineExpose({
    /** A parent component can exit fullscreen */
    exit,
});
</script>
