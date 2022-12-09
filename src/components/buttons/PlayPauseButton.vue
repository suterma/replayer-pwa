<template>
    <button
        :class="{
            button: true,
            'is-loading': isLoading,
        }"
        :disabled="isDisabled"
        :title="isPlaying ? 'Pause' : 'Play'"
    >
        <BaseIcon v-if="isPlaying" :path="mdiPause" />
        <BaseIcon v-else :path="mdiPlay" />
        <slot></slot>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiPlay, mdiPause } from '@mdi/js';
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
    data() {
        return {
            /** Icons from @mdi/js */
            mdiPlay: mdiPlay,
            mdiPause: mdiPause,
        };
    },
});
</script>
