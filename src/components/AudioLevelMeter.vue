<template>
    <div class="audio-level-container flex-gap">
        <LevelMeter
            v-if="showBar"
            class="audio-level-meter"
            :disabled="disabled"
            :minLevel="minLevel"
            :lowLevel="lowLevel"
            :highLevel="highLevel"
            :maxLevel="maxLevel"
            :lowRangeColor="lowRangeColor"
            :midRangeColor="midRangeColor"
            :highRangeColor="highRangeColor"
            :backgroundColor="backgroundColor"
            :value="clampedLevel"
            :title="title"
        >{{ clampedLevelText }} dB
        </LevelMeter>
        <span
            v-if="showText"
            class="audio-level-text"
            :disabled="disabled"
            :class="{ disabled: disabled }"
        >{{ clampedLevelText }} dB</span>
    </div>
</template>

<script setup lang="ts">
import {
    onMounted,
    defineProps,
    onUnmounted,
    ref,
    PropType,
    computed,
} from 'vue';
import LevelMeter from './LevelMeter.vue';

/** An simple audio level meter (visualizer), for a single audio source node, using the Web Audio API.
 * @remarks Internally uses the Web Audio API's AnalyserNode. Therefore, because it down-mixes time domain data (See https://webaudio.github.io/web-audio-api/#time-domain-down-mixing), the level is only mono.
 */

const props = defineProps({
    /** The audio source node to use.
     */
    audioSource: {
        type: AudioNode,
        required: true,
    },
    /** The audio context to use.
     */
    audioContext: {
        //Defining other than straight AudioContext is necessary for iOS < v14 compatibility of the compiled code
        type: null as unknown as PropType<AudioContext>,
        required: true,
    },

    /** The minimum level value to display, in [dBFS]. Default is -48.
     * @remarks This indicates the level to use for the low end in the display.
     */
    minLevel: {
        type: Number,
        required: false,
        default: -48,
    },

    lowRangeColor: {
        type: String,
        required: false,
        default: '#62c462',
    },

    /** The optimum level value to display, in [dBFS]. Default is -12.
     * @remarks The term optimum does make little sense in already processed signals.
     * Here, however, it is used to indicate the start of the "yellow" area in the display.
     */
    lowLevel: {
        type: Number,
        required: false,
        default: -12,
    },

    midRangeColor: {
        type: String,
        required: false,
        default: '#f9e406',
    },

    /** The overload level value to display, in [dBFS]. Default is -3.
     * @remarks The term overload does make little sense in already processed signals.
     * Here, however, it is used to indicate the start of the "red" area in the display.
     */
    highLevel: {
        type: Number,
        required: false,
        default: -3,
    },

    highRangeColor: {
        type: String,
        required: false,
        default: '#ee5f5b',
    },

    backgroundColor: {
        type: String,
        required: false,
        default: '#000000',
    },

    /** The full scale level value (max value) to display, in [dBFS]. Default is 0.
     * @remarks A definition of "Full Scale" does make little sense in already processed signals.
     * Here, however, it is used to indicate the level to use for the top end in the display.
     */
    maxLevel: {
        type: Number,
        required: false,
        default: 0,
    },

    /** The algorithm to use (one of 'peak' (default) or 'average')
     */
    algorithm: {
        type: String,
        required: false,
        default: 'peak',
    },

    showBar: {
        type: Boolean,
        required: false,
        default: true,
    },

    showText: {
        type: Boolean,
        required: false,
        default: true,
    },

    /** Whether to show the component in a disabled state
     * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
     */
    disabled: Boolean,
});

let analyser: AnalyserNode;

/** Whether the float time domain data can be obtained.
 * @devdoc The float time domain version is not available for Safari on iOS below version 14.5
 * (See https://caniuse.com/mdn-api_analysernode_getfloattimedomaindata)
 *  * The byte time domain version is available with Safari from iOS version 6.
 * (See https://caniuse.com/mdn-api_analysernode_getbytetimedomaindata)
 */
let canUseFloatTimeDomainData: boolean;

/** The float data buffer to possibly use.
 */
let floatSampleBuffer: Float32Array;

/** The byte data buffer to possibly use, as an alternative, when float data is not available.
 * @remarks The 8bit data only covers a dynamic range of about 36dB.
 */
let byteSampleBuffer: Uint8Array;

let loopRequestId: number;

/** The value of the signal Starts with the minimum level. */
const value = ref(props.minLevel);

/** The value, the meter actually displays in dBFS. */
const clampedLevel = computed(() =>
    Math.min(props.maxLevel, Math.max(props.minLevel, value.value)),
);

/** The textual representation of the signal level. */
const clampedLevelText = computed(() =>
    isFinite(value.value) ? value.value.toFixed(2) : '—',
);

const title = computed(() => `Level in dB (${props.algorithm})`);

onMounted(() => {
    console.debug('AudioLevelMeter::onMounted');

    analyser = props.audioContext.createAnalyser();

    canUseFloatTimeDomainData =
        typeof analyser.getFloatTimeDomainData === 'function';

    // Time domain samples are always provided with the count of
    // fftSize (which is always a power of two) even though there is no FFT involved.
    // The value of 1024 has been empirically determined to be high enough to also include
    // bass and drum kick sounds in the calculated level at a reasonable degree.
    // You may set to a higher value to trade computational expense for more accuracy.
    analyser.fftSize = 1024;

    if (canUseFloatTimeDomainData) {
        floatSampleBuffer = new Float32Array(analyser.fftSize);
    } else {
        byteSampleBuffer = new Uint8Array(analyser.fftSize);
    }

    props.audioSource.connect(analyser);
    loop();
});

onUnmounted(() => {
    cancelAnimationFrame(loopRequestId);
    analyser.disconnect(); //the input
});

function loop() {
    if (canUseFloatTimeDomainData) {
        analyser.getFloatTimeDomainData(floatSampleBuffer);
    } else {
        analyser.getByteTimeDomainData(byteSampleBuffer);
    }

    // Compute power over the interval.
    if (props.algorithm === 'average') {
        let sumOfSquares = 0;
        if (canUseFloatTimeDomainData) {
            for (let i = 0; i < floatSampleBuffer.length; i++) {
                const sample = floatSampleBuffer[i];
                if (sample) {
                    sumOfSquares += sample ** 2;
                }
            }
            /* average power in dB */
            value.value =
                10 * Math.log10(sumOfSquares / floatSampleBuffer.length);
        } else {
            for (let i = 0; i < byteSampleBuffer.length; i++) {
                const sample = byteSampleBuffer[i];
                if (sample) {
                    sumOfSquares += (sample / 128 - 1) ** 2;
                }
            }
            /* average power in dB */
            value.value =
                10 * Math.log10(sumOfSquares / byteSampleBuffer.length);
        }
    } else if (props.algorithm === 'peak') {
        let peakInstantaneousPower = 0;
        if (canUseFloatTimeDomainData) {
            for (let i = 0; i < floatSampleBuffer.length; i++) {
                const sample = floatSampleBuffer[i];
                if (sample) {
                    const power = sample ** 2;
                    peakInstantaneousPower = Math.max(
                        power,
                        peakInstantaneousPower,
                    );
                }
            }
        } else {
            for (let i = 0; i < byteSampleBuffer.length; i++) {
                const sample = byteSampleBuffer[i];
                if (sample) {
                    const power = (sample / 128 - 1) ** 2;
                    peakInstantaneousPower = Math.max(
                        power,
                        peakInstantaneousPower,
                    );
                }
            }
        }
        /* peak instantaneous power in dB */
        value.value = 10 * Math.log10(peakInstantaneousPower);
    } else {
        throw new Error("algorithm must be on of 'peak', 'average'");
    }

    loopRequestId = requestAnimationFrame(loop);
}
</script>
<style lang="css">
.audio-level-text {
    font-family: monospace;
}

.audio-level-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.audio-level-meter,
.audio-level-text {
    text-align: center !important;
    align-items: center;
    display: flex;
}

.audio-level-meter {
    justify-content: flex-start;
    flex-basis: auto;
    flex-grow: 5;
    flex-shrink: 0;
}

.audio-level-text {
    justify-content: flex-end;
    flex-basis: auto;
    flex-grow: 0;
    flex-shrink: 5;
}

.audio-level-text {
    min-width: 9ch;
}

.flex-gap {
    flex-wrap: wrap;
    gap: 0.75rem;
}
</style>
