<template>
    <ToggleButton
        class="button"
        :isEngaged="isSolo"
        engaged-label="Listen all"
        disengaged-label="Listen solo"
        >S
    </ToggleButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ToggleButton from '@/components/buttons/ToggleButton.vue';

/** A toggle button for the mute state
 */
export default defineComponent({
    name: 'SoloButton',
    components: { ToggleButton },

    props: {
        isSolo: {
            type: Boolean,
            required: true,
            default: false,
        },
    },
});
</script>
