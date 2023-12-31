<script setup lang="ts">
/** A component that is only rendered if the given media query is currently matching
 * @devdoc Maybe later rework this for more simple use
 */
import { useMediaQuery } from '@vueuse/core';

const props = defineProps<{
    query: string;
}>();

/** Whether the given media query is currently matching */
const isMatch = useMediaQuery(props.query);
</script>

<template>
    <slot v-if="isMatch"></slot>
    <slot v-if="!isMatch" name="else"></slot>
</template>
