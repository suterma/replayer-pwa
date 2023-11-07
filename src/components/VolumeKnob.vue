<template>
    <Knob
        title="Drag, scroll or use the arrow keys to change volume"
        class="button is-nav is-rounded"
        :class="{ 'is-static': disabled, 'has-cursor-not-allowed': disabled }"
        :disabled="disabled ? true : null"
        :modelValue="volume"
        @update:modelValue="updateVolume"
        :minValue="0"
        :maxValue="1"
        valueClass="has-text-light"
        rimClass="has-text-grey-light"
        data-cy="volume"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { DefaultTrackVolume } from '@/store/compilation-types';

import Knob from '@/components/buttons/Knob.vue';

/** A volume knob.
 */
export default defineComponent({
    name: 'VolumeKnob',
    components: {
        Knob,
    },
    emits: ['update:volume'],
    props: {
        /** The volume in the range [0..1]
         * @remarks Implements a two-way binding */
        volume: {
            type: Number,
            default: DefaultTrackVolume,
        },

        /** Whether to show the component in a disabled state
         */
        disabled: Boolean,
    },

    methods: {
        /** Handle a volume update
         */
        updateVolume(volume: number): void {
            this.$emit('update:volume', volume);
        },
    },
});
</script>
