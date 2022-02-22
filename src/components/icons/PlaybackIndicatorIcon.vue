<template>
    <Icon
        d="M19,12C19,15.86 15.86,19 12,19C8.14,19 5,15.86 5,12C5,8.14 8.14,5 12,5C15.86,5 19,8.14 19,12Z"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/components/icons/Icon.vue';

/** A button to select the collapsed or expanded state
 */
export default defineComponent({
    name: 'PlaybackIndicatorIcon',
    components: { Icon },
});
</script>
