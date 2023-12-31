<template>
    <Knob
        title="Drag, scroll or use the arrow keys to change volume"
        class="button is-nav is-rounded"
        :class="{ 'is-static': disabled, 'has-cursor-not-allowed': disabled }"
        :disabled="disabled ? true : null"
        :model-value="volume"
        :min-value="0"
        :max-value="1"
        value-class="has-text-light"
        rim-class="has-text-grey-light"
        data-cy="volume"
        @update:model-value="updateVolume"
    />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import Knob from '@/components/buttons/Knob.vue';
import { DefaultTrackVolume } from '@/store/Track';

/** A volume knob.
 */
export default defineComponent({
    name: 'VolumeKnob',
    components: {
        Knob,
    },
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
    emits: ['update:volume'],

    methods: {
        /** Handle a volume update
         */
        updateVolume(volume: number): void {
            this.$emit('update:volume', volume);
        },
    },
});
</script>
