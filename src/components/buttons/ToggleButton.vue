<template>
    <button
        v-tooltip.top="isEngaged ? engagedLabel : disengagedLabel"
        class="button"
    >
        {{ text }}
        <slot></slot>
    </button>
</template>

<script setup lang="ts">
/** A simple toggle button with an engaged and disengaged state
 */
defineProps({
    isEngaged: {
        type: Boolean,
        required: true,
        default: false,
    },

    engagedLabel: {
        type: String,
        required: false,
        default: '',
    },

    disengagedLabel: {
        type: String,
        required: false,
        default: '',
    },

    text: {
        type: String,
        required: false,
        default: '',
    },
});
</script>
