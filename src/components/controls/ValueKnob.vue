<template>
    <ControlKnob
        v-model="value"
        class="is-knob is-unselectable"
        :options="knobOptions"
    >
    </ControlKnob>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import ControlKnob from '@/components/controls/ControlKnob.vue';

/** A rotary know for manipulating values in a (expectedly positive) range.
 */
const props = defineProps({
    modelValue: {
        type: Number,
        required: true,
    },
    maxValue: {
        type: Number,
        required: false,
        default: Number.MAX_VALUE,
    },
    minValue: {
        type: Number,
        required: false,
        default: Number.MIN_VALUE,
    },
    /** Class of the outer rim (outline of the knob) */
    rimClass: {
        type: String,
        required: false,
        default: '',
    },
    /** Class of the value-part of the rim, including the text (value of the knob) */
    valueClass: {
        type: String,
        required: false,
        default: '',
    },
});

const emit = defineEmits(['update:modelValue']);

const knobOptions = computed(() => {
    return {
        imageSize: 40,
        showValue: false,
        hideDefaultValue: false,
        minValue: props.minValue,
        maxValue: props.maxValue,
        valueTextX: 50,
        valueTextY: 55,
        tickLength: 6,
        tickOffset: -8,
        tickStroke: 8,
        rimStroke: 4,
        valueArchStroke: 10,
        bgRadius: 40,
        rimClass: props.rimClass,
        bgClass: 'has-text-grey-dark',
        tickClass: props.valueClass,
        ariaLabel: 'Knob',
        svgClass: props.valueClass,
        valueTextClass: props.valueClass,
        valueArchClass: props.valueClass,
    };
});

const value = computed<number>({
    get() {
        return props.modelValue;
    },
    set(value) {
        emit('update:modelValue', value);
    },
});
</script>
