<template>
    <button
        :class="{
            button: true,
            'is-loading': isLoading,
        }"
        :disabled="isDisabled"
        :title="isPlaying ? 'Pause' : 'Play'"
    >
        <BaseIcon v-if="isPlaying" name="pause" />
        <BaseIcon v-else name="play" />
        <slot></slot>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';

/** A toggle button for the playing state
 */
export default defineComponent({
    name: 'PlayPauseButton',
    components: { BaseIcon },
    props: {
        isDisabled: {
            type: Boolean,
            required: false,
            default: false,
        },
        /** Flag to indicated the loading state */
        isLoading: {
            type: Boolean,
            required: false,
            default: false,
        },
        isPlaying: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
});
</script>
