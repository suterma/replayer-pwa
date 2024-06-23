<template>
    <button
        class="button is-nav"
        :title="title"
        tabindex="0"
        :disabled="disabled"
    >
        <!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC -->
        <i class="icon mdi" :class="iconClass">
            <svg viewBox="0 0 24 24">
                <path fill="currentColor" :d="iconPath" />
            </svg>
        </i>
        <slot></slot>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** A button for navigational purposes, featuring an optional icon
 * @remarks This button is intended for non-actionable buttons like menu togglers, edit togglers etc.
 * These are buttons that do not effectively change the data, but serve a more navigational purpose.
 * The are styled distinctively, without border and just a slight hover indication.
 */
export default defineComponent({
    name: 'NavButton',
    props: {
        /** The text for a tooltip */
        title: {
            type: String,
            default: '',
        },

        /** The icon path, if any */
        iconPath: {
            type: String,
            default: '',
        },
        /** The class of the icon, if any
         * @remarks Allows to specifically style the icon, without affecting the button
         */
        iconClass: {
            type: String,
            default: '',
        },
        /** Whether to show the component in a disabled state
         * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
         */
        disabled: Boolean,
    },
});
</script>
