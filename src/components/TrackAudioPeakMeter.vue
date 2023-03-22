<template>
    <div
        id="my-peak-meter"
        style="width: 5em; height: 20em; margin: 1em 0"
    ></div>
</template>

<script setup lang="ts">
import { onMounted, defineProps, onUnmounted } from 'vue';
import { createMeter, createMeterNode } from 'web-audio-peak-meter';

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

onMounted(() => {
    //TODO currently does not work after second mount
    context = new AudioContext();
    var myMeterElement = document.getElementById('my-peak-meter');
    var sourceNode = context.createMediaElementSource(props.mediaElement);
    sourceNode.connect(context.destination);
    var meterNode = createMeterNode(sourceNode, context);
    createMeter(myMeterElement, meterNode, {});
});

onUnmounted(() => {
    console.debug('TrackAudioMeter::onUnmounted');
    // analyser.disconnect();
    // source.disconnect(analyser);
    context.close();
});
</script>
