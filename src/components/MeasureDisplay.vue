<template>
    <span
        v-if="currentDisplayMeasure"
        class="is-minimum-7-characters is-family-monospace is-single-line"
        >{{ currentDisplayMeasure }}</span
    >
</template>

<script lang="ts">
import { IMeter } from '@/code/music/IMeter';
import { Meter } from '@/code/music/Meter';
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
        /** The musical meter */
        meter: {
            type: null as unknown as PropType<IMeter | null>,
            required: true,
            default: null,
        },
    },
    computed: {
        /** Converts the time into a measure/beats format.
         */
        currentDisplayMeasure(): string | null {
            if (this.modelValue != null && this.meter != null) {
                return Meter.toMeasureDisplay(this.modelValue, this.meter);
            } else {
                return null;
            }
        },
    },
});
</script>
