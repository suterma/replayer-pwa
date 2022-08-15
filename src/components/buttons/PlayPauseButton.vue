<template>
    <button
        :class="{
            button: true,
            disabled: isDisabled,
            'is-loading': isLoading,
        }"
        :title="isPlaying ? 'Pause' : 'Play'"
    >
        <BaseIcon v-if="isPlaying" name="pause" />
        <BaseIcon v-else name="play" />
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
