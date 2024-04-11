<template>
    <ToggleButton
        class="button is-warning is-yellow"
        :class="{
            'is-inactive': !isSoloed,
        }"
        :is-engaged="isSoloed"
        engaged-label=""
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
        isSoloed: {
            type: Boolean,
            required: true,
            default: null,
        },
    },
});
</script>
