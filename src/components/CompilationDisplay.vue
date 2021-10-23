<template>
    <!-- Handle and translate the keyboard shortcuts into Replayer events -->
    <CompilationKeyboardHandler />

    <!-- Handle all relevant Replayer events for the compilation level -->
    <ReplayerEventHandler
        @tonextcue="toNextCue"
        @topreviouscue="toPreviousCue"
        @tomnemoniccue="toMnemonicCue($event)"
    />

    <h1 class="title">
        {{ compilation?.Title }}
    </h1>

    <template v-for="track in tracks" :key="track.Id">
        <TrackTile :track="track" />
    </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Compilation, ITrack, ICue } from '@/store/compilation-types';
import TrackTile from '@/components/TrackTile.vue';
import CompilationKeyboardHandler from '@/components/CompilationKeyboardHandler.vue';
import { MutationTypes } from '@/store/mutation-types';
import ReplayerEventHandler from '@/components/ReplayerEventHandler.vue';

/** Displays the contained list of tracks as tiles
 * @remarks Also handles the common replayer events for compilations
 */
export default defineComponent({
    name: 'CompilationDisplay',
    components: { TrackTile, CompilationKeyboardHandler, ReplayerEventHandler },
    props: {
        compilation: Compilation,
    },
    methods: {
        toPreviousCue() {
            const allCues = this.allCues;
            const indexOfSelected = allCues.indexOf(this.selectedCue);
            const nextCue = allCues[indexOfSelected - 1];
            this.$store.commit(MutationTypes.UPDATE_CURRENT_CUE, nextCue);
        },

        toNextCue() {
            const allCues = this.allCues;
            const indexOfSelected = allCues.indexOf(this.selectedCue);
            const nextCue = allCues[indexOfSelected + 1];
            this.$store.commit(MutationTypes.UPDATE_CURRENT_CUE, nextCue);
        },

        toMnemonicCue(event: Event) {
            const allCues = this.allCues;
            const matchingCue = allCues.find(
                (cue) => cue.Shortcut == (event as CustomEvent).detail,
            );
            if (matchingCue) {
                this.$store.commit(
                    MutationTypes.UPDATE_CURRENT_CUE,
                    matchingCue,
                );
            }
        },
    },
    computed: {
        /** Gets the list of tracks within this compilation */
        tracks(): Array<ITrack> | undefined {
            return this.compilation?.Tracks;
        },
        selectedCue(): ICue {
            return this.$store.getters.selectedCue as ICue;
        },
        allCues(): Array<ICue> {
            const cues = new Array<ICue>();
            this.tracks?.forEach((track) => cues.push(...track.Cues));
            return cues;
        },
        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },
    },
});
</script>
