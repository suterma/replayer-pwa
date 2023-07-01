<template>
    <span class="is-minimum-7-characters is-family-monospace">{{
        currentDisplayMeasure
    }}</span>
</template>

<script lang="ts">
import { ITimeSignature } from '@/code/compilation/ITimeSignature';
import CompilationHandler from '@/store/compilation-handler';
import { defineComponent, PropType } from 'vue';

/** A display for a measure/beat value in the mmm.b format
 * @remarks The display value is calculated according to the set properties
 */
export default defineComponent({
    name: 'MeasureDisplay',
    props: {
        /** The current playhead position in the track
         */
        modelValue: {
            type: null as unknown as PropType<number | null>,
            default: null,
        },

        /** The beat origin (offset in the track time)
         */
        origin: {
            type: Number,
            required: true,
        },

        /** The tempo in beats per minute.
         */
        beatsPerMinute: {
            type: Number,
            required: true,
        },
        /** The time signature
         */
        timeSignature: {
            type: null as unknown as PropType<ITimeSignature>,
            required: true,
        },
    },
    computed: {
        /** Converts the time into a measure/beats format.
         */
        currentDisplayMeasure(): string {
            return CompilationHandler.convertToMeasureTime(
                this.modelValue,
                this.origin,
                this.beatsPerMinute,
                this.timeSignature,
            );

        },
    },
});
</script>
