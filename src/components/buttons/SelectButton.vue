<template>
    <ToggleButton
        class="button "
        :class="{
            'is-inactive': !isSelected,
        }"
        :isEngaged="isSelected"
        engaged-label=""
        disengaged-label="Select"
        >SEL
    </ToggleButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ToggleButton from '@/components/buttons/ToggleButton.vue';

/** A toggle button for the mute state
 */
export default defineComponent({
    name: 'SelectButton',
    components: { ToggleButton },

    props: {
        isSelected: {
            type: Boolean,
            required: true,
            default: null,
        },
    },
});
</script>
<style scoped>
.button.is-warning.is-yellow,
.button.is-warning:not(.is-outlined):not(.is-inverted).is-yellow {
    filter: hue-rotate(20deg);
}
</style>
