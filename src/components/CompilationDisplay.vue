<template>
    <div>
        <h3>{{ compilation?.Title }}</h3>

        <ul>
            <li v-for="track in tracks" :key="track.Id">
                <TrackDisplay :track="track" />
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Compilation, ITrack } from '@/store/compilation-types';
import TrackDisplay from '@/components/TrackDisplay.vue';

export default defineComponent({
    name: 'CompilationDisplay',
    components: { TrackDisplay },
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
