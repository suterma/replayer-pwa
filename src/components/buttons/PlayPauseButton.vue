<template>
    <button
        :class="{
            button: true,
            'is-loading': isLoading,
        }"
        :title="isPlaying ? 'Pause' : 'Play'"
    >
        <BaseIcon v-if="isPlaying" :path="mdiPause" />
        <BaseIcon v-else-if="isOmittingNextFadeIn" :path="mdiPlay" />
        <BaseIcon v-else :path="rFadeInPlay" />
        <slot></slot>
    </button>
</template>

<script setup lang="ts">
/** A toggle button for the playing state
 */
import { inject } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiPause, mdiPlay } from '@mdi/js';
import {
    isPlayingInjectionKey,
    playbackStateInjectionKey,
    isOmittingNextFadeInInjectionKey,
} from '../track/TrackInjectionKeys';
import { rFadeInPlay } from '@/components/icons/ReplayerIcon';

defineProps({
    /** Flag to indicate the loading state */
    isLoading: {
        type: Boolean,
        required: false,
        default: false,
    },
});
const isPlaying = inject(isPlayingInjectionKey);

/** Indicates this track's playback state
 * @remarks This is used to depict the expected action on button press. While playing, this is pause, and vice versa.
 */
const playbackState = inject(playbackStateInjectionKey);

const isOmittingNextFadeIn = inject(isOmittingNextFadeInInjectionKey);
</script>
