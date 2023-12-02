<template>
    <span
        v-if="currentDisplayMeasure"
        class="is-minimum-7-characters is-family-monospace is-single-line"
        title="Measure.Beat"
        >{{ currentDisplayMeasure }}</span
    >
</template>

<script setup lang="ts">
/** A display for a measure/beat value as a duration (measure difference) */

import { Meter } from '@/code/music/Meter';
import { computed, inject, type PropType } from 'vue';
import { meterInjectionKey } from '@/components/track/TrackInjectionKeys';

/** The musical meter */
const meter = inject(meterInjectionKey);

const props = defineProps({
    /** The current playhead position in the track
     */
    modelValue: {
        type: null as unknown as PropType<number | null>,
        default: null,
    },
});
const currentDisplayMeasure = computed(() => {
    if (
        props.modelValue != null &&
        meter?.value != null &&
        Meter.isValid(meter.value) &&
        meter.value.OriginTime != null
    ) {
        return Meter.toMultiMeasureRestDisplay(props.modelValue, meter.value);
    }
    return '';
});
</script>
