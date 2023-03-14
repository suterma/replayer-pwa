<template>
    <button
        :class="{
            button: true,
        }"
        :title="isEngaged ? engagedLabel : disengagedLabel"
    >
        {{ text }}
        <slot></slot>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** A simple toggle button with an engaged and disengaged state
 */
export default defineComponent({
    name: 'Toggle',

    props: {
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
    },
});
</script>
