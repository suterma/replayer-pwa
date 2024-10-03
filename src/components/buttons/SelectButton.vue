<template>
    <ToggleButton
        class="button is-primary"
        :class="{
            'is-inactive': !isSelected,
        }"
        :is-engaged="isSelected"
        engaged-label="Selected"
        disengaged-label="Select"
    >
        <slot></slot>
    </ToggleButton>
</template>

<script setup lang="ts">
import ToggleButton from '@/components/buttons/ToggleButton.vue';

/** A toggle button for the select state
 */
defineProps({
    isSelected: {
        type: Boolean,
        required: true,
        default: null,
    },
});
</script>
