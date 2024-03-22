<template>
    <div v-tooltip="volumeDeciBelFullScaleDisplay">
        <ValueKnob
            title="Drag, scroll or use the arrow keys to change volume"
            class="button is-nav is-rounded"
            :class="{
                'is-static': disabled,
                'has-cursor-not-allowed': disabled,
            }"
            :disabled="disabled ? true : null"
            :model-value="volume"
            :min-value="0"
            :max-value="1"
            value-class="has-text-light"
            rim-class="has-text-grey-light"
            data-cy="volume"
            @update:model-value="updateVolume"
        />
    </div>
</template>

<script setup lang="ts">
import AudioUtil from '@/code/media/AudioUtil';
import ValueKnob from '@/components/controls/ValueKnob.vue';
import { DefaultTrackVolume } from '@/store/Track';
import { computed } from 'vue';

/** A volume knob.
 */

const props = defineProps({
    /** The volume in the range [0..1]
     * @remarks Implements a two-way binding */
    volume: {
        type: Number,
        default: DefaultTrackVolume,
    },

    /** Whether to show the component in a disabled state
     */
    disabled: Boolean,
});

const emit = defineEmits(['update:volume']);

/** Handle a volume update
 */
function updateVolume(volume: number): void {
    emit('update:volume', volume);
}

// --- value display ---

/** A displayable volume in [dBFS]
 * @remarks Shows 1 digit after the decimal point for values close to zero
 */
const volumeDeciBelFullScaleDisplay = computed(() => {
    const dBFS = AudioUtil.getDeciBelFullScale(props.volume);

    if (dBFS > -10) {
        return dBFS.toFixed(1) + ' dBFS';
    }
    return dBFS.toFixed(0) + ' dBFS';
});
</script>
