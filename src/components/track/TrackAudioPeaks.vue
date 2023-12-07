<template>
    <AudioPeaks :options="options" :mediaElement="mediaElement">
        <template #overview v-if="!showOverview">
            <template />
            <!-- Using an empty template on a slot 
         prevents the default content --></template
        >
        <template #controls
            ><template />
            <!-- Using an empty template on a slot 
         prevents the default content -->
        </template>
        <template #zoomview> </template>
    </AudioPeaks>
</template>

<script lang="ts">
//@ts-ignore (because vue-peaks does not provide types)
import { AudioPeaks } from 'vue-peaks';
import 'vue-peaks/dist/style.css';
import { defineComponent } from 'vue';

/** An audio visualizer, for a single track, using the Web Audio API.
 */
export default defineComponent({
    name: 'TrackAudioPeaks',
    components: {
        AudioPeaks,
    },
    props: {
        /** The external media element to use.
         */
        mediaElement: {
            type: HTMLMediaElement,
            required: true,
        },
        /** The external media element to use.
         */
        showOverview: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    data() {
        return {
            /** The configuration options
             * @remarks The colors are taken from the Bulma color scheme.
             */
            options: {
                overview: {
                    /* container is provided and handled internally by AudioPeaks */
                    waveformColor: '#f89406' /*theme warning color*/,
                    playedWaveformColor: 'rgba(248,148,6,.67)',
                    highlightColor: '#aaa',
                    highlightOffset: 0,
                    axisGridlineColor: '#00000000' /* transparent */,
                    axisLabelColor: '#fafafa',
                },
                zoomview: {
                    /* container is provided and handled internally by AudioPeaks */
                    waveformColor: '#aaa',
                    playedWaveformColor:
                        '#707070' /* one-third darker (similar to the cue button progress darkening) */,
                    axisGridlineColor: '#00000000' /* transparent */,
                    axisLabelColor: '#fafafa',
                },
                webAudio: { audioContext: new AudioContext() },
                zoomLevels: [256],
                playheadColor: '#fafafa',
            },
        };
    },
});
</script>
