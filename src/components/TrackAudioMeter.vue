<template>
    <button id="start">Start</button>

    <p>
        Short average
        <meter
            id="avg-level"
            min="-100"
            max="10"
            value="-100"
            style="width: 100%"
        ></meter>
        <span id="avg-level-text">—</span> dB
    </p>

    <p>
        Instantaneous
        <meter
            id="inst-level"
            min="-100"
            max="10"
            value="-100"
            style="width: 100%"
        ></meter>
        <span id="inst-level-text">—</span> dB
    </p>
</template>

<script setup lang="ts">
import { onMounted, defineProps, onUnmounted } from 'vue';

/** An audio visualizer, for a single track, using the Web Audio API.
 * @devdoc Also see https://www.w3.org/TR/webaudio/#vu-meter-mode
 */

const props = defineProps({
    /** The external media element to use.
     */
    mediaElement: {
        type: HTMLMediaElement,
        required: true,
    },
});

const AudioContext = window.AudioContext;
let context: AudioContext;
context = new AudioContext();

let analyser: AnalyserNode;
let sampleBuffer: Float32Array;
let source: MediaElementAudioSourceNode;

onMounted(() => {
    //NOTE: currently gives error on second mount
    console.debug('TrackAudioMeter::onMounted');

    analyser = context.createAnalyser();
    // Time domain samples are always provided with the count of
    // fftSize even though there is no FFT involved.
    // (Note that fftSize can only have particular values, not an
    // arbitrary integer.)
    analyser.fftSize = 2048;

    sampleBuffer = new Float32Array(analyser.fftSize);
    console.debug('TrackAudioMeter::createMediaElementSource');

    source = context.createMediaElementSource(props.mediaElement);
    console.debug('TrackAudioMeter::analyser');

    source.connect(analyser);
    console.debug('TrackAudioMeter::loop');

    loop();
});

onUnmounted(() => {
    console.debug('TrackAudioMeter::onUnmounted');
    analyser.disconnect();
    source.disconnect(analyser);
    //context.close();
});

function displayNumber(id: string, value: number) {
    const meter = document.getElementById(id + '-level') as HTMLMeterElement;
    const text = document.getElementById(id + '-level-text') as HTMLSpanElement;
    if (text) {
        text.textContent = value.toFixed(2);
    }
    if (meter) {
        meter.value = isFinite(value) ? value : meter.min;
    }
}

function loop() {
    // Vary power of input to analyser. Linear in amplitude, so
    // nonlinear in dB power.
    //gain1.gain.value = 0.5 * (1 + Math.sin(Date.now() / 4e2));

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
    displayNumber('avg', avgPowerDecibels);
    displayNumber('inst', peakInstantaneousPowerDecibels);

    requestAnimationFrame(loop);
}
</script>
