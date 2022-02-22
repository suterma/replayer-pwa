<template>
    <Icon d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/components/icons/Icon.vue';

/** A button to select the collapsed or expanded state
 */
export default defineComponent({
    name: 'ChevronDownIcon',
    components: { Icon },
});
</script>
