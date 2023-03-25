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
import { onMounted, defineProps, onUnmounted, ref } from 'vue';

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
        type: AudioContext,
        required: true,
    },

    /** Whether to show the component in a disabled state
     * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
     */
    disabled: Boolean,
});

let analyser: AnalyserNode;
let sampleBuffer: Float32Array;
let loopRequestId: number;
const rmsLevelMeter = ref(null);
const peakLevelMeter = ref(null);
const rmsLevelDisplay = ref(null);
const peakLevelDisplay = ref(null);

onMounted(() => {
    //NOTE: currently gives error on second mount
    console.debug('TrackAudioMeter::onMounted');

    analyser = props.audioContext.createAnalyser();

    // Time domain samples are always provided with the count of
    // fftSize even though there is no FFT involved.
    // (Note that fftSize can only have particular values (powers of two),
    // not an arbitrary integer.)
    analyser.fftSize = 1024;

    sampleBuffer = new Float32Array(analyser.fftSize);

    console.debug('TrackAudioMeter::analyser');

    props.audioSource.connect(analyser);
    //props.audioSource.connect(props.audioContext.destination);
    console.debug('TrackAudioMeter::loop');

    loop();
});

onUnmounted(() => {
    cancelAnimationFrame(loopRequestId);
    console.debug('TrackAudioMeter::onUnmounted');
    analyser.disconnect();
    props.audioSource.disconnect(analyser);
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
    analyser.getFloatTimeDomainData(sampleBuffer);

    // Compute average power over the interval.
    let sumOfSquares = 0;
    for (let i = 0; i < sampleBuffer.length; i++) {
        const sample = sampleBuffer[i];
        if (sample) {
            sumOfSquares += sample ** 2;
        }
    }
    const avgPowerDecibels =
        10 * Math.log10(sumOfSquares / sampleBuffer.length);

    // Compute peak instantaneous power over the interval.
    let peakInstantaneousPower = 0;
    for (let i = 0; i < sampleBuffer.length; i++) {
        const sample = sampleBuffer[i];
        if (sample) {
            const power = sample ** 2;
            peakInstantaneousPower = Math.max(power, peakInstantaneousPower);
        }
    }
    const peakInstantaneousPowerDecibels =
        10 * Math.log10(peakInstantaneousPower);

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
    /* --optimum: forestgreen;
    --sub-optimum: gold;
    --sub-sub-optimum: crimson; */

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
