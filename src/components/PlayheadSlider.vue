<template>
    <input
        step="stepSize"
        min="0"
        :max="track.Duration ?? 0"
        :value="modelValue"
        @change="onValueChange"
        @input="onValueChange"
        type="range"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track } from '@/store/compilation-types';

/** Slider that represents the playhead position in a track as the modelValue in a ranged input (slider).
 */
export default defineComponent({
    name: 'PlayheadSlider',
    emits: ['update:modelValue'],
    components: {},
    props: {
        /** The current time of the slider
         */
        modelValue: {
            type: Number,
            required: false,
            default: 0,
        },
        /** The track to represent the playhead position for
         */
        track: {
            type: Track,
            required: true,
        },
        /** The playhead step size in [seconds]
         */
        stepSize: {
            type: Number,
            required: false,
            default: 0.5,
        },
    },
    methods: {
        onValueChange(e: Event): void {
            const position = parseFloat((e.target as HTMLInputElement).value);
            this.$emit('update:modelValue', position);
        },
    },
});
</script>
