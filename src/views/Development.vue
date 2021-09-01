<template>
    <div class="development">
        <h1>1) Select a REZ or ZIP file</h1>
        <RezLoader />

        <!-- //TODO later only show when something is loaded -->
        <template v-if="true">
            <h1>2) See and play the compilation</h1>
            <CompilationDisplay :compilation="compilation" />
        </template>

        <hr />
        //TODO's
        <ul>
            <li>Make the cues hideable (but still showing a minimal player)</li>
            <li>
                Stop playing when another player starts playing (by default).
                For this propagate the playing state to the global store. Then,
                create a watch that watches for events on OTHER players.
            </li>
            <li>
                Make a "tracking" option, that allows to play more than one
                track simultaneously, in synch
            </li>
            <li>Make the players "full width", when showing the cues</li>
            <li>
                Create a "live" view, with just one track in full screen mode
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RezLoader from '@/components/RezLoader.vue'; // @ is an alias to /src
import { ICompilation, ITrack } from '@/store/compilation-types';
import CompilationDisplay from '@/components/CompilationDisplay.vue';

export default defineComponent({
    components: {
        RezLoader,
        CompilationDisplay,
    },
    computed: {
        compilation(): ICompilation {
            return this.$store.getters.compilation;
        },
        tracks(): Array<string> {
            return (this.$store.getters.compilation as ICompilation).Tracks.map(
                function (item: ITrack) {
                    return item.Name;
                },
            );
        },
    },
});
</script>
