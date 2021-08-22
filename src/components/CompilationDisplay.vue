<template>
    <div>
        <h3>{{ compilation?.Title }}</h3>

        <ul>
            <li v-for="track in tracks" :key="track.Id">
                {{ track.Name }} ( by {{ track.Artist }} on {{ track.Album }} )
                <small>{{ track.Url }})</small>
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import JSZip from 'jszip';
import xml2js from 'xml2js';
import AudioElement from '@/components/AudioElement.vue';
import { MutationTypes } from '../store/mutation-types';
import { MediaFile, RezMimeTypes } from '@/store/state-types';
import { Compilation, ICompilation, ITrack } from '@/store/compilation-types';

export default defineComponent({
    name: 'CompilationDisplay',
    components: {},
    props: {
        compilation: Compilation,
    },
    methods: {},
    computed: {
        tracks(): Array<ITrack> {
            if (this.compilation) {
                return (this.compilation as ICompilation).Tracks;
            } else return new Array<ITrack>();
        },
    },
});
</script>
