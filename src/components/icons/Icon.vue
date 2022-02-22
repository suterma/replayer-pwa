<template>
    <span class="icon">
        <i class="mdi mdi-24px">
            <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
                <path fill="currentColor" :d="d" />
            </svg>
        </i>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** A button to select the collapsed or expanded state
 */
export default defineComponent({
    name: 'Icon',
    props: {
        /** The icon path data for the icon to draw, if any */
        d: {
            type: String,
            default: '',
        },
    },
});
</script>
