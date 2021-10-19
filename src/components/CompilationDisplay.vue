<template>
    <h1 class="title">
        {{ compilation?.Title }}
    </h1>

    <template v-for="track in tracks" :key="track.Id">
        <TrackTile :track="track" />
    </template>

    <!-- Handle the keyboard shortcuts for the compilation -->
    <CompilationKeyboardHandler :compilation="compilation" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Compilation, ITrack } from '@/store/compilation-types';
import TrackTile from '@/components/TrackTile.vue';
import CompilationKeyboardHandler from '@/components/CompilationKeyboardHandler.vue';

/** Displays the contained list of tracks as tiles  */
export default defineComponent({
    name: 'CompilationDisplay',
    components: { TrackTile, CompilationKeyboardHandler },
    props: {
        compilation: Compilation,
    },
    methods: {},
    computed: {
        /** Gets the list of tracks within this compilation */
        tracks(): Array<ITrack> | undefined {
            return this.compilation?.Tracks;
        },
    },
});
</script>
