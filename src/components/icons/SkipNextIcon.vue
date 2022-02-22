<template>
    <Icon d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/components/icons/Icon.vue';

/** A button to select the collapsed or expanded state
 */
export default defineComponent({
    name: 'SkipNextIcon',
    components: { Icon },
});
</script>
