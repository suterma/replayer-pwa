<template>
    <Icon d="M8,5.14V19.14L19,12.14L8,5.14Z" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/components/icons/Icon.vue';

/** A button to select the collapsed or expanded state
 */
export default defineComponent({
    name: 'PlayIcon',
    components: { Icon },
});
</script>
