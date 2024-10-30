<!-- Taken from https://github.com/suterma/vue-audio-level-meter/blob/main/src/components/AudioLevelMeter.vue (MIT-Licensed) -->
<!-- Credits: https://web.replayer.app/#/about -->
<!-- This code has been slightly adapted for the Replayer project -->
<template>
    <div class="audio-level-container flex-gap" :class="{ vertical: vertical }">
        <LevelMeter
            v-if="showBar"
            class="audio-level-meter"
            :class="{ vertical: vertical }"
            :disabled="disabled"
            :min-level="minLevel"
            :low-level="lowLevel"
            :high-level="highLevel"
            :max-level="maxLevel"
            :low-range-color="lowRangeColor"
            :mid-range-color="midRangeColor"
            :high-range-color="highRangeColor"
            :background-color="backgroundColor"
            :value="clampedLevel"
            :title="title"
            >{{ clampedLevelText }} dB
        </LevelMeter>
        <span
            v-if="showText"
            class="audio-level-text"
            :disabled="disabled"
            :class="{ disabled: disabled }"
            >{{ clampedLevelText }} dB</span
        >
    </div>
</template>

<script setup lang="ts">
import {
    ref,
    type PropType,
    computed,
    watchEffect,
    onBeforeUnmount,
    onMounted,
} from 'vue';
import LevelMeter from './LevelMeter.vue';
import useLog from '@/composables/LogComposable';
const { log } = useLog();

/** An simple audio level meter (visualizer), for a single audio source node, using the Web Audio API.
 * @remarks Internally uses the Web Audio API's AnalyserNode. Therefore, because it down-mixes time domain data (See https://webaudio.github.io/web-audio-api/#time-domain-down-mixing), the level is only mono.
 */

const props = defineProps({
    /** The audio source node to use.
     */
    audioSource: {
        type: null as unknown as PropType<AudioNode>,
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

    /** Whether the meter is shown in vertical orientation */
    vertical: {
        type: Boolean,
        required: false,
        default: false,
    },

    /** Whether the meter is running (actually providing peak measurements)
     * @remarks Default is true. Set to false, to optimize performance,
     * if you know that the meter is not visible or otherwise not used.
     */
    running: {
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

/** The value of the signal starts with the absolute minimum level. */
const value = ref(Number.NEGATIVE_INFINITY);

/** The value, the meter actually displays in dBFS. */
const clampedLevel = computed(() =>
    Math.min(props.maxLevel, Math.max(props.minLevel, value.value)),
);

/** The textual representation of the signal level. */
const clampedLevelText = computed(() =>
    isFinite(value.value) ? value.value.toFixed(2) : '—',
);

const title = computed(() => `Level in dB (${props.algorithm})`);

const isUsingPeakAlgorithm = computed(() => props.algorithm === 'peak');

const isUsingAverageAlgorithm = computed(() => props.algorithm === 'average');

/** Handles the running state of the meter */
watchEffect(() => {
    if (props.running) {
        start();
    } else {
        stop();
    }
});

onMounted(() => {
    // Make sure, this gets stopped even on unexpected page unload
    window.addEventListener('beforeunload', stop);
});

onBeforeUnmount(() => {
    window.removeEventListener('beforeunload', stop);
    stop();
});

/** Starts running the analyser */
function start() {
    log.debug('AudioLevelMeter::start');

    if (!analyser) {
        analyser = props.audioContext.createAnalyser();
    }

    /** Whether the use of floating point time domain data is possible
     * @remarks This allows for more precistion. It's supported on all major
     * browsers as of today.
     */
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
}

function stop() {
    log.debug('AudioLevelMeter::stop');

    cancelAnimationFrame(loopRequestId);
    if (analyser) {
        analyser.disconnect(); //the input
    }
    value.value = Number.NEGATIVE_INFINITY;
}

/** Calculates the power level for the most recent set of time domain data
 * @remarks chooses the appropriate algorithm according to the settings
 */
function loop() {
    if (canUseFloatTimeDomainData) {
        analyser.getFloatTimeDomainData(floatSampleBuffer);
    } else {
        analyser.getByteTimeDomainData(byteSampleBuffer);
    }

    // Compute power over the interval.
    // NOTE: Performance is quite optimal using this for loop, as a performance test shows:
    // https://perf.link/#eyJpZCI6InFzbHZ5YmNjMGN0IiwidGl0bGUiOiJGaW5kaW5nIG51bWJlcnMgaW4gYW4gYXJyYXkgb2YgMTAwMCIsImJlZm9yZSI6ImNvbnN0IGZmdFNpemUgPSAxMDI0O1xuLy9GbG9hdDMyQXJyYXlcbmxldCBmbG9hdFNhbXBsZUJ1ZmZlciA9IG5ldyBGbG9hdDMyQXJyYXkoQXJyYXkuZnJvbSh7bGVuZ3RoOiBmZnRTaXplfSwgKCkgPT4gTWF0aC5yYW5kb20oKSAqIDIgLSAxKSk7XG5sZXQgcGVha0luc3RhbnRhbmVvdXNQb3dlciA9IDA7IiwidGVzdHMiOlt7Im5hbWUiOiJVc2UgbWF0aCBvbiBlYWNoIHNhbXBsZSIsImNvZGUiOiJmb3IgKGxldCBpID0gMDsgaSA8IGZsb2F0U2FtcGxlQnVmZmVyLmxlbmd0aDsgaSsrKSB7XG4gIGNvbnN0IHNhbXBsZSA9IGZsb2F0U2FtcGxlQnVmZmVyW2ldO1xuICBpZiAoc2FtcGxlKSB7XG4gICAgY29uc3QgcG93ZXIgPSBzYW1wbGUgKiogMjtcbiAgICBwZWFrSW5zdGFudGFuZW91c1Bvd2VyID0gTWF0aC5tYXgocG93ZXIsIHBlYWtJbnN0YW50YW5lb3VzUG93ZXIpO1xuICB9XG59XG5cbmNvbnN0IHZhbHVlID0gMTAgKiBNYXRoLmxvZzEwKHBlYWtJbnN0YW50YW5lb3VzUG93ZXIpOyIsInJ1bnMiOlsxMDAwLDQwMDAsNjAwMCwyMDAwLDE5MDAwLDIwMDAsMTAwMCwxOTAwMCw4MDAwLDIwMDAsOTAwMCw4MDAwLDUwMDAsMzAwMCwxMDAwLDE4MDAwLDYwMDAsMjAwMCw1MDAwLDE0MDAwLDgwMDAsMTAwMDAsMTAwMCwxMTAwMCw2MDAwLDQwMDAsMTAwMDAsOTAwMCw2MDAwLDE2MDAwLDQwMDAsMjAwMCw0MDAwLDIxMDAwLDUwMDAsOTAwMCw3MDAwLDE3MDAwLDQwMDAsMTMwMDAsMTAwMCwyMDAwMCwyMDAwLDE0MDAwLDExMDAwLDIwMDAsMTUwMDAsNjAwMCwxMDAwLDgwMDAsNzAwMCwxMTAwMCwxNjAwMCwxNjAwMCwzMDAwLDE1MDAwLDQwMDAsOTAwMCwzMDAwLDQwMDAsMzAwMCwxMTAwMCwxMDAwMCw3MDAwLDMwMDAsMTUwMDAsNzAwMCwxMDAwLDcwMDAsNjAwMCw4MDAwLDE4MDAwLDMwMDAsMTQwMDAsNTAwMCwxMDAwLDE1MDAwLDQwMDAsMTMwMDAsMzAwMCwxMDAwMCw4MDAwLDQwMDAsMzAwMCw1MDAwLDEyMDAwLDUwMDAsMTUwMDAsMTAwMCwxMTAwMCw3MDAwLDcwMDAsMTkwMDAsMTAwMCwxNzAwMCwxMTAwMCwxMDAwLDIwMDAwLDEwMDAwLDEzMDAwXSwib3BzIjo4MDQwfSx7Im5hbWUiOiJVc2UgbWluL21heCIsImNvZGUiOiJjb25zdCBtYXhTYW1wbGUgPSBNYXRoLm1heCguLi5mbG9hdFNhbXBsZUJ1ZmZlcik7XG5jb25zdCBtaW5TYW1wbGUgPSBNYXRoLm1pbiguLi5mbG9hdFNhbXBsZUJ1ZmZlcik7XG5cbnBlYWtJbnN0YW50YW5lb3VzUG93ZXIgPSBNYXRoLm1heChtYXhTYW1wbGUgKiogMiwgbWluU2FtcGxlICoqIDIpO1xuXG5jb25zdCB2YWx1ZSA9IDEwICogTWF0aC5sb2cxMChwZWFrSW5zdGFudGFuZW91c1Bvd2VyKTsiLCJydW5zIjpbOTAwMCwzMDAwLDUwMDAsMTIwMDAsMTAwMDAsMzAwMCwxMjAwMCwxMDAwMCw2MDAwLDEwMDAsNTAwMCw0MDAwLDQwMDAsMTAwMCw5MDAwLDkwMDAsNTAwMCwxMDAwLDQwMDAsNzAwMCw0MDAwLDgwMDAsMTAwMCw3MDAwLDQwMDAsNDAwMCw2MDAwLDYwMDAsNDAwMCw4MDAwLDMwMDAsOTAwMCwyMDAwLDEzMDAwLDQwMDAsNjAwMCw1MDAwLDMwMDAsMzAwMCw5MDAwLDEyMDAwLDEyMDAwLDEwMDAsOTAwMCw4MDAwLDEwMDAsNjAwMCw0MDAwLDkwMDAsNjAwMCw0MDAwLDQwMDAsOTAwMCw5MDAwLDMwMDAsOTAwMCw1MDAwLDYwMDAsOTAwMCw1MDAwLDMwMDAsNDAwMCw0MDAwLDcwMDAsMjAwMCw4MDAwLDEwMDAsOTAwMCw1MDAwLDUwMDAsNjAwMCw4MDAwLDIwMDAsODAwMCw0MDAwLDkwMDAsOTAwMCwzMDAwLDcwMDAsMTAwMCw3MDAwLDYwMDAsMzAwMCwyMDAwLDQwMDAsODAwMCw1MDAwLDkwMDAsMjAwMCw4MDAwLDUwMDAsNjAwMCw5MDAwLDEyMDAwLDkwMDAsOTAwMCwxMjAwMCwxMDAwMCw5MDAwLDkwMDBdLCJvcHMiOjYwOTB9XSwidXBkYXRlZCI6IjIwMjMtMTAtMjVUMDk6MTc6MjkuNTMyWiJ9
    if (isUsingPeakAlgorithm.value) {
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
    } else if (isUsingAverageAlgorithm.value) {
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
    } else {
        throw new Error("algorithm must be one of 'peak', 'average'");
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
