<template>
    <!-- Slider without time info around it, as a single control -->

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
    <div class="playhead-slider level is-mobile is-unselectable">
        <!-- Left side -->
        <div class="level-left">
            <div class="level-item">
                <button
                    class="button is-outlined is-inverted p-0 pr-2 is-multiline"
                    @click="seek(-5)"
                    title="Current time: click to rewind"
                >
                    <TimeDisplay
                        class="has-text-left is-size-7 has-text-warning"
                        :modelValue="modelValue"
                    ></TimeDisplay>
                    <BaseIcon
                        v-once
                        :path="mdiRewind"
                        class="has-text-warning is-align-self-flex-start"
                    />
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
                    :max="trackDuration ?? 0"
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
                    class="button is-outlined is-inverted p-0 pl-2 is-multiline"
                    @click="seek(+5)"
                    title="Remaining time: click to forward"
                >
                    <TimeDisplay
                        class="has-text-right is-size-7 has-text-warning"
                        :modelValue="remainingTime"
                    ></TimeDisplay>
                    <BaseIcon
                        v-once
                        :path="mdiFastForward"
                        class="has-text-warning is-align-self-flex-end"
                    />
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiRewind, mdiFastForward } from '@mdi/js';

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
        /** The duration of the track to represent the playhead position for
         */
        trackDuration: {
            type: Number as () => number | null,
            required: false,
            default: null,
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
    data() {
        return {
            /** Icons from @mdi/js */
            mdiRewind: mdiRewind,
            mdiFastForward: mdiFastForward,
        };
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
            if (this.trackDuration != null) {
                return -(this.trackDuration - this.modelValue);
            } else return null;
        },
    },
});
</script>
<style>
.playhead-slider svg {
    height: 20px !important;
}
.playhead-slider .button {
    max-height: 40px;
}

.playhead-slider .button .icon:last-child:not(:first-child) {
    margin-left: 0;
    margin-right: 0;
}

/** Use a really small font for the time display */
.playhead-slider .is-size-7.is-family-monospace {
    padding-top: 0.4rem;
    font-size: 0.65rem !important;
}
</style>
