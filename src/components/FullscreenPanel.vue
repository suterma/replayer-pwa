<template>
    <div ref="container">
        <slot
            :is-fullscreen="isFullscreen"
            :has-native="hasNative"
            :toggle="toggle"
            :exit="exit"
        ></slot>
    </div>
</template>
<script setup lang="ts">
/** A panel for full-screen display using the Fullscreen API, if available.
 * A fallback is used otherwise.
 * @remarks The parent component can control the slot's fullscreen state
 * via the slot's passed props and functions
 * @devdoc Apple iPhone devices do not support the Fullscreen API.
 * See https://caniuse.com/fullscreen
 */
import { useFullscreen } from '@vueuse/core';
import { onMounted, ref } from 'vue';

const container = ref<HTMLElement | null>(null);

/// --- assume fullscreen API ---
const hasNative = ref(true);
let { isFullscreen, exit, toggle } = useFullscreen(container);

/// --- fallback to emulation if API not available ---
onMounted(() => {
    const containerElement = container.value;
    const hasNativeFullscreen = containerElement?.requestFullscreen;
    hasNative.value = hasNativeFullscreen != undefined;

    if (!hasNative) {
        console.log('Providing Fullscreen API fallback features');
        isFullscreen = ref(false);
        toggle = () => {
            isFullscreen.value = !isFullscreen.value;
            return Promise.resolve();
        };
        exit = () => {
            isFullscreen.value = false;
            return Promise.resolve();
        };
    }
});

defineExpose({
    /** A parent component can exit fullscreen */
    exit,
});
</script>
