<template>
    <div class="progress-circle" :value="value.toFixed(0)"></div>
</template>

<script setup lang="ts">
/** A circualr progress indicator, for values in [percent]
 *
 */
defineProps({
    /** The progress, in [percent]
     * @remarks There is no min/max, the used value must be between 0 and 100.
     */
    value: {
        type: Number,
        required: true,
    },
});
</script>
