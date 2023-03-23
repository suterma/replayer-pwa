<template>
    <div
        :disabled="disabled"
        ref="meter"
        style="width: 100%; height: 5em; margin: 1em 0"
    ></div>
</template>

<script setup lang="ts">
import { onMounted, defineProps, onUnmounted, ref } from 'vue';
import { createMeter, createMeterNode } from 'web-audio-peak-meter';

/** An audio visualizer, for a single track, using the Web Audio API.
 * @devdoc Also see https://www.w3.org/TR/webaudio/#vu-meter-mode
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
    meterNode = createMeterNode(props.audioSource, props.audioContext);
    createMeter(meter.value, meterNode, {});
});

onUnmounted(() => {
    console.debug('TrackAudioPeakMeter::onUnmounted');
    meterNode.disconnect();
    props.audioSource.disconnect(meterNode);
});
</script>
