<template>
    <ToggleButton
        class="button is-danger"
        :class="{
            'is-inactive': !isMuted,
        }"
        :is-engaged="isMuted"
        >M
    </ToggleButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ToggleButton from '@/components/buttons/ToggleButton.vue';

/** A toggle button for the mute state
 */
export default defineComponent({
    name: 'MuteButton',
    components: { ToggleButton },

    props: {
        isMuted: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
});
</script>
