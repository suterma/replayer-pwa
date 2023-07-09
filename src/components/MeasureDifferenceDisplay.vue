<template>
    <span
        v-if="currentDisplayMeasure"
        class="is-minimum-7-characters is-family-monospace is-single-line"
        title="Measure.Beat"
        >{{ currentDisplayMeasure }}</span
    >
</template>

<script lang="ts">
import { IMeter } from '@/code/music/IMeter';
import { Meter } from '@/code/music/Meter';
import _ from 'lodash';
import { defineComponent, PropType } from 'vue';

/** A display for a measure/beat value as a duration (measure difference) */
export default defineComponent({
    name: 'MeasureDisplay',
    props: {
        /** The time difference in [seconds]
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
        /** Converts the time into a displayable measure duration format
         */
        currentDisplayMeasure(): string | null {
            if (
                this.modelValue != null &&
                this.meter != null &&
                Meter.isValid(this.meter) &&
                this.meter.OriginTime != null
            ) {
                return Meter.toMultiMeasureRestDisplay(
                    this.modelValue,
                    this.meter,
                );
            }
            return '';
        },
    },
});
</script>
