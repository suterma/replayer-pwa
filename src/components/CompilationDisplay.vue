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
import { Compilation, ITrack } from '@/store/compilation-types';

export default defineComponent({
    name: 'CompilationDisplay',
    components: {},
    props: {
        compilation: Compilation,
    },
    methods: {},
    computed: {
        tracks(): Array<ITrack> | undefined {
            return this.compilation?.Tracks;
        },
        //TODO display the ready-state of the corresponding file object
    },
});
</script>
