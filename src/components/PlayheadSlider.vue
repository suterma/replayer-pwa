<template>
    <!-- Slider without time info around it, as a single control -->

    <template v-if="!showPosition && !showDuration">
        <input
            class="slider is-fullwidth is-small is-slim is-circle is-warning"
            step="stepSize"
            min="0"
            :max="track.Duration ?? 0"
            :value="modelValue"
            @change="onValueChange"
            @input="onValueChange"
            type="range"
        />
    </template>
    <template v-else>
        <!-- Slider with time info around it -->
        <div class="level is-mobile is-unselectable">
            <!-- Left side -->
            <div class="level-left" v-if="showPosition">
                <div class="level-item">
                    <TimeDisplay
                        class="is-size-7 has-text-warning"
                        :modelValue="modelValue"
                    ></TimeDisplay>
                </div>
            </div>
            <div class="level-item mr-0">
                <input
                    class="slider is-fullwidth is-small is-slim is-circle is-warning"
                    step="stepSize"
                    min="0"
                    :max="track.Duration ?? 0"
                    :value="modelValue"
                    @change="onValueChange"
                    @input="onValueChange"
                    type="range"
                />
            </div>
            <!-- Right side -->
            <div class="level-right" v-if="showDuration">
                <div class="level-item">
                    <TimeDisplay
                        class="has-text-right is-size-7 has-text-warning"
                        :modelValue="track.Duration"
                    ></TimeDisplay>
                </div>
            </div>
        </div>
    </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import { Track } from '@/store/compilation-types';

/** Slider that represents the playhead position in a track as the modelValue in a ranged input (slider).
 */
export default defineComponent({
    name: 'PlayheadSlider',
    emits: ['update:modelValue'],
    components: { TimeDisplay },
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
        /** Whether to show the playhead position in [seconds]
         */
        showPosition: {
            type: Boolean,
            required: false,
            default: true,
        },
        /** Whether to show the track duration in [seconds]
         */
        showDuration: {
            type: Boolean,
            required: false,
            default: true,
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
