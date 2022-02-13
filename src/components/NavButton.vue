<template>
    <button class="button is-nav" :title="title" tabindex="0">
        <span
            :class="{
                icon: true,
            }"
        >
            <i class="mdi mdi-24px">
                <!-- An icon -->
                <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
                    <path fill="currentColor" :d="iconPathData" />
                </svg>
            </i>
        </span>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** A button for navigational purposes
 * @remarks This button is intended for non-actional buttons like menu togglers, edit togglers etc.
 * These are buttons that do not effectively change the data, but serve a more navigational purpose.
 * The are styled distinctivel, without border and just a slight hover indication.
 */
export default defineComponent({
    name: 'NavButton',
    components: {},
    props: {
        /** The text for a tooltip */
        title: {
            type: String,
            default: '',
        },

        /** The icon path data for the icon to draw, if any */
        iconPathData: {
            type: String,
            default: '',
        },
    },
    methods: {},
});
</script>
