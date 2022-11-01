<template>
    <progress
        class="progress is-fullwidth is-small is-slim is-warning"
        step="stepSize"
        min="0"
        :max="track.Duration ?? 0"
        :value="modelValue"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track } from '@/store/compilation-types';

/** A slim progress bar that represents the playhead position in a track as the modelValue.
 */
export default defineComponent({
    name: 'PlayheadProgressBar',
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
<style lang="css" scoped>
.progress.is-slim {
    height: 1px;
}
</style>
