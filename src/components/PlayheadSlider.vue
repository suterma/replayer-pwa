<template>
    <!-- Slider without time info around it, as a single control -->
    <div>
        <!-- <input
            class="slider is-fullwidth is-small is-slim is-circle is-warning"
            step="stepSize"
            min="0"
            :max="track.Duration ?? 0"
            :value="modelValue"
            @change="onValueChange"
            @input="onValueChange"
            type="range"
        /> -->

        <!-- Slider with time info around it -->
        <div class="level is-mobile is-unselectable">
            <!-- Left side -->
            <div class="level-left">
                <div class="level-item">
                    <button
                        class="button is-outlined is-inverted pr-1"
                        @click="seek(-5)"
                        title="Current time: click to rewind"
                    >
                        <BaseIcon class="has-text-warning" name="rewind" />
                        <TimeDisplay
                            class="is-size-7 has-text-warning"
                            :modelValue="modelValue"
                        ></TimeDisplay>
                    </button>
                </div>
            </div>
            <div class="level-item mr-0">
                <div>
                    <slot></slot>
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
            </div>
            <!-- Right side -->
            <div class="level-right">
                <div class="level-item">
                    <button
                        class="button is-outlined is-inverted pl-1"
                        @click="seek(+5)"
                        title="Current time: click to forward"
                    >
                        <TimeDisplay
                            class="has-text-right is-size-7 has-text-warning"
                            :modelValue="remainingTime"
                        ></TimeDisplay>
                        <BaseIcon
                            class="has-text-warning"
                            name="fast-forward"
                        />
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import { Track } from '@/store/compilation-types';
import BaseIcon from '@/components/icons/BaseIcon.vue';

/** Slider that represents the playhead position in a track as the modelValue in a ranged input (slider).
 */
export default defineComponent({
    name: 'PlayheadSlider',
    emits: [
        'update:modelValue',

        /** Emitted at a seek button click, with the amount of seconds as argument (can also be negative)
         */
        'seek',
    ],
    components: { TimeDisplay, BaseIcon },
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
        seek(seconds: number): void {
            this.$emit('seek', seconds);
        },
    },
    computed: {
        remainingTime(): number | null {
            if (this.track.Duration != null) {
                return -(this.track.Duration - this.modelValue);
            } else return null;
        },
    },
});
</script>
