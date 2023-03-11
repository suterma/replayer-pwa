<template>
    <button
        :class="{
            button: true,
        }"
        :title="isMuted ? 'Unmute' : 'Mute'"
    >
        M
        <slot></slot>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** A toggle button for the mute state
 */
export default defineComponent({
    name: 'MuteButton',

    props: {
        isMuted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
});
</script>
