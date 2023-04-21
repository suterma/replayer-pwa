<template>
    <div class="is-experimental">
        <slot> </slot>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

/** A wrapper around experimental content
 * @remarks To effectively control rendering, the v-if directive must be used
 */
export default defineComponent({
    name: 'Experimental',
});
</script>
