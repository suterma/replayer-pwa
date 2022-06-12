<template>
    <ControlKnob
        class="is-knob is-unselectable"
        v-model="value"
        :options="knobOptions"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ControlKnob from '@slipmatio/control-knob';

/** A Knob for manipulating values
 */
export default defineComponent({
    name: 'Knob',
    components: { ControlKnob },
    props: {
        modelValue: {
            type: Number,
            required: true,
        },
        maxValue: Number,
        minValue: Number,
        /** Class of the outer rim (outline of the knob) */
        rimClass: String,
        /** Class of the value-part of the rim, including the text (value of the knob) */
        valueClass: String,
    },
    emits: ['update:modelValue'],
    computed: {
        knobOptions(): Record<string, unknown> {
            return {
                imageSize: 40,
                hideDefaultValue: false,
                minValue: this.minValue,
                maxValue: this.maxValue,
                valueTextX: 50,
                valueTextY: 55,
                tickLength: 20,
                tickOffset: -7,
                tickStroke: 4,
                rimStroke: 4,
                valueArchStroke: 10,
                bgRadius: 39,
                rimClass: this.rimClass,
                bgClass: 'has-text-dark',
                tickClass: 'has-text-light',
                ariaLabel: 'Knob',
                svgClass: 'has-text-info',
                valueTextClass: this.valueClass,
                valueArchClass: this.valueClass,
            };
        },
        value: {
            get() {
                return this.modelValue;
            },
            set(value: number) {
                this.$emit('update:modelValue', value);
            },
        },
    },
});
</script>
