<template>
    <!-- Slider with time info around it -->
    <div class="playhead-slider level is-mobile is-unselectable">
        <!-- Left side -->
        <div class="level-left">
            <div class="level-item">
                <button
                    :disabled="disabled"
                    class="button is-outlined is-inverted p-0 pr-2 is-multiline"
                    @click="seek(-5)"
                    title="Current time: click to rewind"
                >
                    <BaseIcon
                        v-once
                        :path="mdiRewind"
                        class="is-align-self-flex-start"
                    />
                    <!-- NOTE: As a update performance optimization,
                        the TimeDisplay component is not used, but the
                        value is directly computed with the desired number
                        of subSecond digits. This avoids
                        unnecessary update for actually non-distinctly displayed values. -->
                    <span
                        class="has-text-left is-size-7 is-minimum-7-characters is-family-monospace"
                        data-cy="current-time"
                        >{{ convertToDisplayTime(modelValue, 1) }}</span
                    >
                </button>
            </div>
        </div>
        <div class="level-item mr-0">
            <div style="width: 100%">
                <slot></slot>
                <label
                    ><span class="is-sr-only">Time slider</span>
                    <input
                        :disabled="disabled"
                        class="slider is-fullwidth is-slim"
                        :step="stepSize"
                        min="0"
                        id=""
                        :max="trackDuration ?? 0"
                        :value="modelValue"
                        @change="onValueChange"
                        @input="onValueChange"
                        type="range"
                /></label>
            </div>
        </div>
        <!-- Right side -->
        <div class="level-right">
            <div class="level-item">
                <button
                    :disabled="disabled"
                    class="button is-outlined is-inverted p-0 pl-2 is-multiline"
                    @click="seek(+5)"
                    title="Remaining time: click to forward"
                >
                    <BaseIcon
                        v-once
                        :path="mdiFastForward"
                        class="is-align-self-flex-end mr-0"
                    />
                    <!-- NOTE: As a update performance optimization,
                        the TimeDisplay component is not used, but the
                        value is directly computed with the desired number
                        of subSecond digits. This avoids
                        unnecessary update for actually non-distinctly displayed values. -->
                    <span
                        class="has-text-left is-size-7 is-minimum-7-characters is-family-monospace"
                        data-cy="remaining-time"
                        >{{ convertToDisplayTime(remainingTime, 1) }}</span
                    >
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiRewind, mdiFastForward } from '@mdi/js';
import CompilationHandler from '@/store/compilation-handler';

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
    components: { BaseIcon },
    props: {
        /** Whether to show the component in a disabled state
         * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
         */
        disabled: Boolean,
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
            default: 0.1,
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
        convertToDisplayTime(
            value: number | null,
            subSecondDigits: number,
        ): string {
            return CompilationHandler.convertToDisplayTime(
                value,
                subSecondDigits,
            );
        },
    },
    computed: {
        remainingTime(): number | null {
            return CompilationHandler.calculateRemainingTime(
                this.modelValue,
                this.trackDuration,
            );
        },
        percentagePlayed(): string {
            const played = CompilationHandler.calculatePlayedPercentage(
                this.modelValue,
                this.trackDuration,
            );
            return `${played}%`;
        },
    },
});
</script>
<style scoped lang="css">
/** The color for the slider bar (Firefox)
* @devdoc For Firefox (moz), see https://support.mozilla.org/en-US/questions/1308191 
* These must stand separately from webkit, because otherwise they would disturb each other 
*/
input[type='range'].slider::-moz-range-track {
    background: linear-gradient(
        to right,
        #707070
            /* one-third darker (similar to the cue button progress darkening) */
            0%,
        #707070
            /* one-third darker (similar to the cue button progress darkening) */
            v-bind('percentagePlayed'),
        #aaa /*$text*/ v-bind('percentagePlayed'),
        #aaa /*$text*/ 100%
    ) !important;
}

/** The color for the slider bar (Chrome and Webkit) 
* @devdoc For webkit, see https://css-tricks.com/html5-meter-element/ 
* @devdoc https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-meter-bar
*/
input[type='range'].slider::-webkit-slider-runnable-track {
    background: linear-gradient(
        to right,
        #707070
            /* one-third darker (similar to the cue button progress darkening) */
            0%,
        #707070
            /* one-third darker (similar to the cue button progress darkening) */
            v-bind('percentagePlayed'),
        #aaa /*$text*/ v-bind('percentagePlayed'),
        #aaa /*$text*/ 100%
    ) !important;
}
input[type='range'].slider::-ms-track,
input[type='range'].slider::-ms-fill-lower,
input[type='range'].slider::-ms-fill-upper {
    background: linear-gradient(
        to right,
        #707070
            /* one-third darker (similar to the cue button progress darkening) */
            0%,
        #707070
            /* one-third darker (similar to the cue button progress darkening) */
            v-bind('percentagePlayed'),
        #aaa /*$text*/ v-bind('percentagePlayed'),
        #aaa /*$text*/ 100%
    );
}
</style>
