<template>
    <AudioPeaks :options="options" :mediaElement="mediaElement">
        <template #overview>
            <template />
            <!-- Using an empty template on a slot 
         prevents the default content -->
        </template>
        <template #controls
            ><template />
            <!-- Using an empty template on a slot 
         prevents the default content -->
        </template>
        <template #zoomview> </template>
    </AudioPeaks>
</template>

<script lang="ts">
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
    },
    data() {
        return {
            /** The configuration options
             * @remarks The colors are taken from the Bulma color scheme.
             */
            options: {
                overview: {
                    /* container is provided and handled internally by AudioPeaks */
                    waveformColor: 'hsl(120, 45%, 58%)',
                    playedWaveformColor: 'hsl(127, 36%, 38%)',
                    highlightColor: 'hsl(206, 70%, 96%)',
                    highlightOffset: 0,
                    axisGridlineColor: 'hsl(0, 0%, 29%)',
                    axisLabelColor: 'hsl(0, 0%, 29%)',
                },
                zoomview: {
                    /* container is provided and handled internally by AudioPeaks */
                    waveformColor: 'hsl(32, 96%, 55%)',
                    playedWaveformColor: 'hsl(33, 76%, 37%)',
                    axisGridlineColor: 'hsl(0, 0%, 29%)',
                    axisLabelColor: 'hsl(0, 0%, 29%)',
                },
                webAudio: { audioContext: new AudioContext() },
                zoomLevels: [256],
                playheadColor: '#fafafa',
            },
        };
    },
});
</script>
