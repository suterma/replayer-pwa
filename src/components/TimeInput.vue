<template>
    <input
        class="input"
        type="number"
        inputmode="decimal"
        :step="step"
        :value="modelValue"
        @change="updateTime($event)"
        @paste="updateTime($event)"
        @input="debouncedUpdateTime($event)"
        placeholder="time [seconds]"
        size="5"
        data-cy="input-time-position"
    />
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import CompilationHandler from '@/store/compilation-handler';
import { useDebounceFn } from '@vueuse/core';

/** An input for a time value in [seconds]
 * @remarks Debounces on typed user input (not debouncing when using the spinner buttons)
 */
const emit = defineEmits(['change', 'update:modelValue']);
const props = defineProps({
    modelValue: {
        type: null as unknown as PropType<number | null>,
        default: null,
    },
    /** The step size of the numerical input (0.1 is default) */
    step: {
        type: Number,
        default: 0.1,
        required: false,
    },
});

/** Updates the set cue time after debouncing */
const debouncedUpdateTime = useDebounceFn((event: Event) => {
    updateTime(event);
}, 600);

/** Updates the set cue time */
function updateTime(event: Event) {
    const text = (event.target as HTMLInputElement).value;
    const time = text
        ? CompilationHandler.roundTime(
              parseFloat((event.target as HTMLInputElement).value),
          )
        : null;
    if (props.modelValue != time) {
        if (!Number.isFinite(time)) {
            emit('update:modelValue', null);
        } else {
            emit('update:modelValue', time);
        }
    }
}
</script>

<style scoped>
/*************************************************************
 * Time input width depending on viewport size
**************************************************************
*/

/* minimum input width for decimal time */
input[type='number'][inputmode='decimal'] {
    min-width: 9ch;
    max-width: 12ch;
}

/* fullhd */
@media screen and (min-width: 1408px) {
    /* minimum input width for decimal time */
    input[type='number'][inputmode='decimal'] {
        min-width: 11ch;
        max-width: 15ch;
    }
}
</style>
