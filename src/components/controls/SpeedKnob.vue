<template>
    <ParameterKnob
        title="Drag or scroll to change speed"
        class="button is-nav is-rounded"
        :class="{ 'is-static': disabled, 'has-cursor-not-allowed': disabled }"
        :disabled="disabled ? true : null"
        :model-value="parameterValue"
        :min-value="-2"
        :max-value="+2"
        value-class="has-text-light"
        rim-class="has-text-grey-light"
        data-cy="speed"
        @update:model-value="updateSpeed"
    />
</template>

<script setup lang="ts">
import { DefaultPlaybackRate } from '@/store/Track';
import ParameterKnob from '@/components/controls/ParameterKnob.vue';
import { computed } from 'vue';

/** A speed control knob
 */
const props = defineProps({
    /** The speed factor in the range [0.25-4], where 1 is normal speed (the default)
     * @remarks Implements a two-way binding */
    speed: {
        type: Number,
        default: DefaultPlaybackRate,
    },

    /** Whether to show the component in a disabled state
     */
    disabled: Boolean,
});

/** A logarithmic parameter value from the speed factor */
const parameterValue = computed(() => {
    return Math.log2(props.speed);
});

const emit = defineEmits(['update:speed']);

/** Handle a logarithmic parameter update into a speed factor update
 */
function updateSpeed(parameterValue: number): void {
    const speed = Math.pow(2, parameterValue);
    emit('update:speed', speed);
}
</script>
