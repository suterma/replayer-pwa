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
import { inject, ref } from 'vue';
import { logInjectionKey } from '@/AppInjectionKeys';
import type { ILogObj, Logger } from 'tslog';

const log = inject(logInjectionKey) as Logger<ILogObj>;
const container = ref<HTMLElement | null>(null);
const hasNative = ref(document.fullscreenEnabled);

/// --- fullscreen API ---
let { isFullscreen, exit, toggle } = useFullscreen(container);

if (!hasNative.value) {
    // set a fallback for the already assumed functions
    log.debug('Providing Fullscreen API fallback features');
    isFullscreen = ref(false);
    toggle = () => {
        isFullscreen.value = !isFullscreen.value;
        log.debug('Fullscreen API fallback state: ' + isFullscreen.value);
        return Promise.resolve();
    };
    exit = () => {
        isFullscreen.value = false;
        log.debug('Fullscreen API fallback exit state: ' + isFullscreen.value);
        return Promise.resolve();
    };
}

defineExpose({
    /** A parent component can exit fullscreen */
    exit,
});
</script>
