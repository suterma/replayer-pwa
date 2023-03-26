<template>
    <div>
        <p>
            Short average
            <meter
                class="audio-level-meter rms"
                :disabled="disabled"
                ref="rmsLevelMeter"
                min="-60"
                max="0"
                value="-60"
                title="dBFS (RMS)"
            >
                RMS level
            </meter>
            <span ref="rmsLevelDisplay">—</span> dB
        </p>

        <p>
            Instantaneous
            <meter
                class="audio-level-meter peak"
                :disabled="disabled"
                ref="peakLevelMeter"
                min="-60"
                max="0"
                value="-60"
                title="dBFS (peak)"
            >
                Peak level
            </meter>
            <span ref="peakLevelDisplay">—</span> dB
        </p>
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
import { useElementBounding } from '@vueuse/core';

/** An simple audio level meter (visualizer), for a single audio source node, using the Web Audio API.
 * @remarks Internally uses the Web Audio API's AnalyserNode. Therefor, because it down-mixes time domain data (See https://webaudio.github.io/web-audio-api/#time-domain-down-mixing), the level is only mono.
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
const rmsLevelMeter = ref(null);
const peakLevelMeter = ref(null);
const rmsLevelDisplay = ref(null);
const peakLevelDisplay = ref(null);

onMounted(() => {
    console.debug('TrackAudioLevelMeter::onMounted');

    analyser = props.audioContext.createAnalyser();

    canUseFloatTimeDomainData =
        typeof analyser.getFloatTimeDomainData === 'function';

    // Time domain samples are always provided with the count of
    // fftSize even though there is no FFT involved.
    // (Note that fftSize can only have particular values (powers of two),
    // not an arbitrary integer.)
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

function displayNumber(
    meter: HTMLMeterElement,
    text: HTMLSpanElement,
    value: number,
): void {
    if (text) {
        text.textContent = value.toFixed(2);
    }
    if (meter) {
        meter.value = isFinite(value) ? value : meter.min;
    }
}

function loop() {
    if (canUseFloatTimeDomainData) {
        analyser.getFloatTimeDomainData(floatSampleBuffer);
    } else {
        analyser.getByteTimeDomainData(byteSampleBuffer);
    }

    // Compute average power over the interval.
    let sumOfSquares = 0;
    let avgPowerDecibels: number;

    if (canUseFloatTimeDomainData) {
        for (let i = 0; i < floatSampleBuffer.length; i++) {
            const sample = floatSampleBuffer[i];
            if (sample) {
                sumOfSquares += sample ** 2;
            }
        }
        avgPowerDecibels =
            10 * Math.log10(sumOfSquares / floatSampleBuffer.length);
    } else {
        for (let i = 0; i < byteSampleBuffer.length; i++) {
            const sample = byteSampleBuffer[i];
            if (sample) {
                sumOfSquares += (sample / 128 - 1) ** 2;
            }
        }
        avgPowerDecibels =
            10 * Math.log10(sumOfSquares / byteSampleBuffer.length);
    }

    // Compute peak instantaneous power over the interval.
    let peakInstantaneousPower = 0;
    let peakInstantaneousPowerDecibels: number;
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
    peakInstantaneousPowerDecibels = 10 * Math.log10(peakInstantaneousPower);

    displayNumber(
        rmsLevelMeter.value as unknown as HTMLMeterElement,
        rmsLevelDisplay.value as unknown as HTMLSpanElement,
        avgPowerDecibels,
    );

    displayNumber(
        peakLevelMeter.value as unknown as HTMLMeterElement,
        peakLevelDisplay.value as unknown as HTMLSpanElement,
        peakInstantaneousPowerDecibels,
    );

    loopRequestId = requestAnimationFrame(loop);
}

// --- meter styles, depending on actual component extent ---

/** The styles for the meter range element are dynamically calculated to be able to
 * use a pixel-defined gradient. This makes the gradient regions visually fixed (non-dependent from the
 * actual meter value)
 */
//See https://stackoverflow.com/a/69078238/79485 for the v-bind mechanism
const { width } = useElementBounding(rmsLevelMeter);

/** 0dBFS */
const widthFullScale = computed(() => {
    return `${width.value}px`;
});
/** Overload warning at -3dBFS */
const widthWarnOverload = computed(() => {
    return `${width.value * 0.95}px`;
});

/** Saturation at -12dBFS */
const widthSaturation = computed(() => {
    return `${width.value * 0.8}px`;
});

/** Scale minimum is at -60dBFS */
const widthMinimum = computed(() => {
    return `${0}px`;
});
</script>
<style lang="scss">
.audio-level-meter {
    width: 100%;
    height: 1.5em;
    background-color: transparent;
    border: none;
    border-radius: 4px;
}

meter::-webkit-meter-bar {
    background: none; /* Required to get rid of the default background property */
    background-color: black;
    border: 0px; /* do not show a border (border none seems not to work)*/
    border-radius: 4px;
    height: 1em;
}

/* See also https://css-tricks.com/html5-meter-element/ */
meter::-webkit-meter-optimum-value {
    background-image: linear-gradient(
        90deg,
        #62c462 v-bind('widthMinimum'),
        #62c462 v-bind('widthSaturation'),
        #f9e406 v-bind('widthSaturation'),
        #f9e406 v-bind('widthWarnOverload'),
        #ee5f5b v-bind('widthWarnOverload'),
        #ee5f5b v-bind('widthFullScale')
    );
}
</style>
