<template>
    <button
        v-tooltip:[isActive]="volumeDeciBelFullScaleDisplay"
        class="button is-nav pl-0 pr-0"
    >
        <ValueKnob
            title="Drag, scroll or use the arrow keys to change volume"
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
            @update:drag="updateDrag"
            @mouseover="onMouseOver($event)"
            @mouseleave="onMouseLeave($event)"
        />
    </button>
</template>

<script setup lang="ts">
import AudioUtil from '@/code/media/AudioUtil';
import ValueKnob from '@/components/controls/ValueKnob.vue';
import { DefaultTrackVolume } from '@/store/Track';
import { computed, ref } from 'vue';

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

const emit = defineEmits([
    /** The volume has changed */
    'update:volume',
    /** The drag state has changed
     * @remarks When true: the user is manipulating the knob by a drag gesture
     */
    'update:drag',
]);

/** Handle a volume update
 */
function updateVolume(volume: number): void {
    emit('update:volume', volume);
}

// --- value/tooltip display ---

/** Whether this element is active
 * @remarks It's tri-state:
 * When hovered, but not actively manipulated, it neither (null)
 * When actively manipulated, it active (true)
 * When neither hovered nor actively manipulated, it's inactive (false)
 */
const isActive = computed(() => {
    if (manipulated.value) {
        return true;
    }
    if (hovered.value && !manipulated.value) {
        return null;
    }

    return false;
});

/** Whether the mouse is hovering over the target,
 * but only when no buttons pressed */
const hovered = ref(false);
const manipulated = ref(false);

/** Handle a drag update
 */
function updateDrag(drag: boolean): void {
    manipulated.value = drag;
    emit('update:drag', drag);
}

/** Set the hovered value, but only if no mouse button is pressed */
function onMouseOver(event: MouseEvent): void {
    hovered.value = event.buttons == 0;
}

/** Reset the hovered value */
function onMouseLeave(_event: MouseEvent): void {
    hovered.value = false;
}

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
