<template>
    <span
        v-if="currentDisplayMeasure"
        class="is-minimum-7-characters is-family-monospace is-single-line"
        title="Measure|Beat"
        >{{ currentDisplayMeasure }}</span
    >
</template>

<script setup lang="ts">
/** A display for a measure/beat value in the mmm.b format
 * @remarks The display value is calculated according to the set properties
 */
import { Meter } from '@/code/music/Meter';
import { computed, inject, PropType } from 'vue';
import { meterInjectionKey } from './TrackInjectionKeys';

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
    if (props.modelValue != null && meter?.value != null) {
        return Meter.toMeasureDisplay(props.modelValue, meter.value);
    } else {
        return null;
    }
});
</script>
