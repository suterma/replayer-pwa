<template>
    <ToggleButton
        class="button is-primary"
        :class="{
            'is-inactive': !isSelected,
        }"
        :isEngaged="isSelected"
        engaged-label=""
        disengaged-label="Select"
        >SEL
    </ToggleButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ToggleButton from '@/components/buttons/ToggleButton.vue';

/** A toggle button for the mute state
 */
export default defineComponent({
    name: 'SelectButton',
    components: { ToggleButton },

    props: {
        isSelected: {
            type: Boolean,
            required: true,
            default: null,
        },
    },
});
</script>
