<template>
    <span
        v-if="shortcut || hasSlot"
        class="is-hidden-touch is-hidden-desktop-only ml-2 tag is-light is-outlined has-opacity-third is-family-monospace"
        >{{ shortcut }}<slot></slot
    ></span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** A display for a keyboard shortcut
 * @remarks Shortcuts hidden below desktop width
 */
export default defineComponent({
    name: 'ShortcutDisplay',
    props: {
        shortcut: {
            type: String,
            default: null,
        },
    },
    computed: {
        hasSlot() {
            return !!this.$slots.default;
        },
    },
});
</script>
