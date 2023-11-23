<template>
    <div class="stage-mark has-text-warning">{{ stageText }}</div>
</template>
<script setup lang="ts">
import { computed } from 'vue';

/** A watermark with the name of the current stage (empty on production)
 */

/** The current host as the stage, except for production. */
const stageText = computed(() => {
    const host = location.host;
    return host == 'web.replayer.app' ? '' : host;
});
</script>
<style>
/** **********************************************************
 * Plattform-specific CSS 
**************************************************************
*/

.stage-mark {
    position: absolute;
    top: 0;
    right: 3rem;
    font-size: 200%;
}
</style>
