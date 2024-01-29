<template>
    <span class="icon">
        <i class="mdi mdi-24px">
            <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
                <path fill="currentColor" :d="path" />
            </svg>
        </i>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { mdiHeart } from '@mdi/js';

/** A basic icon, using a path
 * @remarks This component provides icons based on a path, intended to be taken from @mdi/js
 * (material design icon set, see credits in the about page)
 */
export default defineComponent({
    name: 'BaseIcon',
    props: {
        /** The icon path, according to @mdi/js */
        path: {
            type: String,
            default: mdiHeart,
        },
    },
});
</script>
