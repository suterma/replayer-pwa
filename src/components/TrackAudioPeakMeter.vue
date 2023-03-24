<template>
    <div
        :disabled="disabled"
        class="audio-peak-meter"
        :class="{ 'has-opacity-half': disabled }"
        ref="meter"
        style="width: 100%; height: 3em; margin: 0 0"
    ></div>
</template>

<script setup lang="ts">
import { onMounted, defineProps, onUnmounted, ref } from 'vue';
import { createMeter, createMeterNode } from 'web-audio-peak-meter';

/** An audio visualizer, for a single track, using the Web Audio API.
 * @devdoc Uses the https://github.com/esonderegger/web-audio-peak-meter
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

let meterNode: AnalyserNode;
const meter = ref(null);

onMounted(() => {
    console.debug('TrackAudioPeakMeter::onMounted');
    meterNode = createMeterNode(props.audioSource, props.audioContext);
    createMeter(meter.value, meterNode, {
        fontSize: 6,
        tickColor: '#aaa',
        labelColor: '#aaa',

        gradient: [
            '#ee5f5b 0%',
            '#ee5f5b 5%',
            '#f9e406 5%',
            '#f9e406 20%',
            '#62c462 20%',
            '#62c462 100%',
        ],
        dbRange: 60,
        audioMeterStandard: 'peak-sample', // Could be "true-peak" (ITU-R BS.1770, very computationally expensive) or "peak-sample" (computationally faster)
    });
});

onUnmounted(() => {
    console.debug('TrackAudioPeakMeter::onUnmounted');
    meterNode?.disconnect();
    props.audioSource?.disconnect(meterNode);
});
</script>

<style>
/** show not background around the bars */
.audio-peak-meter > div {
    background-color: transparent !important;
}

/** no spacing at begin and end of meter bars 
.audio-peak-meter
    > div
    > div[style^='position: absolute; background-color: black;'] {
    right: 0 !important;
    left: 0 !important;
}
.audio-peak-meter > div > div[style^='position: absolute; height:'] {
    right: 0 !important;
    left: 0 !important;
}*/

/** slightly rounded meter bars */
.audio-peak-meter > div > div[style^='position: absolute;'] {
    border-radius: 4px;
}
.audio-peak-meter
    > div
    > div[style^='position: absolute; background-color: black;'] {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

/** Transition for slow decrease */
.audio-peak-meter
    > div
    > div[style^='position: absolute; background-color: black;'] {
    transition-duration: 48ms;
    transition-property: width height;
    transition-timing-function: linear;
}

/** show no textual peak indicators */
.audio-peak-meter > div > div[style^='text-align: center;'] {
    display: none;
    visibility: hidden;
}
</style>
