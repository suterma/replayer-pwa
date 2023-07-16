<template>
    <button
        :class="{
            button: true,
            'is-loading': isLoading,
        }"
        :title="isTrackPlaying ? 'Pause' : 'Play'"
    >
        <BaseIcon v-if="isTrackPlaying" :path="mdiPause" />
        <BaseIcon v-else :path="mdiPlay" />
        <slot></slot>
    </button>
</template>

<script setup lang="ts">
/** A toggle button for the playing state
 */
import { inject } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiPlay, mdiPause } from '@mdi/js';
import { isPlayingInjectionKey } from '../TrackInjectionKeys';

defineProps({
    /** Flag to indicate the loading state */
    isLoading: {
        type: Boolean,
        required: false,
        default: false,
    },
});
/** Flag to indicate whether this track's player is currently playing
 */
const isTrackPlaying = inject(isPlayingInjectionKey);
</script>
