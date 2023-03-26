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
import { onMounted, defineProps, onUnmounted, ref, PropType } from 'vue';

/** An simple audio visualizer, for a single track, using the Web Audio API.
 */

const props = defineProps({
    /** The external audio source to use.
     */
    audioSource: {
        type: MediaElementAudioSourceNode,
        required: true,
    },
    /** The external audio context to use.
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
    //NOTE: currently gives error on second mount
    console.debug('TrackAudioMeter::onMounted');

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

    console.debug('TrackAudioMeter::analyser');

    props.audioSource.connect(analyser);
    console.debug('TrackAudioMeter::loop');

    loop();
});

onUnmounted(() => {
    cancelAnimationFrame(loopRequestId);
    console.debug('TrackAudioMeter::onUnmounted');
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

    // Note that you should then add or subtract as appropriate to
    // get the _reference level_ suitable for your application.

    // Display value.
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
</script>
<style type="scss">
.audio-level-meter {
    width: 100%;
    height: 1.5em;
    background-color: transparent;

    /* border: 1px solid red; */
    border: none;

    border-radius: 4px;
}

meter {
    --background: black;

    /* The gray background in Firefox */
    background: var(--background);
    display: block;
    margin-bottom: 1em;
    width: 100%;
}

meter::-webkit-meter-bar {
    background: none; /* Required to get rid of the default background property */
    background-color: black;
    border: 0px;
    border-radius: 4px;
    height: 1em;
}

meter::-webkit-meter-optimum-value {
    background-image: linear-gradient(
        90deg,
        #ee5f5b 100px,
        #f9e406 20px,
        #62c462 5px,
        #62c462 0px
    );
}
</style>
