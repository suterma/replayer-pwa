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
import { Compilation, ITrack, ICue } from '@/store/compilation-types';
import TrackTile from '@/components/TrackTile.vue';
import CompilationKeyboardHandler from '@/components/CompilationKeyboardHandler.vue';
import { MutationTypes } from '@/store/mutation-types';

/** Displays the contained list of tracks as tiles
 * @remarks Also handles the common replayer events for compilations
 */
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
    created: function () {
        //TODO
        //later may be use actually listen to an $emit from a child with v-on. This allows you to keep the convenience of events with added explicitness.
        // `this` points to the vm instance
        // Listen for the event.
        document.addEventListener(
            'replayer-topreviouscue',
            () => {
                // console.debug('CompilationKeyboardHandler::toPreviousCue');
                // console.log(this.selectedCue);
                var allCues = this.allCues;
                // console.debug(
                //     'CompilationKeyboardHandler::toPreviousCue:',
                //     allCues,
                // );
                var indexOfSelected = allCues.indexOf(this.selectedCue);
                // console.debug(
                //     'CompilationKeyboardHandler::indexOfSelected:',
                //     indexOfSelected,
                // );
                var nextCue = allCues[indexOfSelected - 1];
                // console.debug(
                //     'CompilationKeyboardHandler::indexOfSelected:',
                //     nextCue,
                // );
                this.$store.commit(MutationTypes.UPDATE_CURRENT_CUE, nextCue);
            },
            false,
        );

        document.addEventListener(
            'replayer-tonextcue',
            () => {
                // console.debug('CompilationKeyboardHandler::toPreviousCue');
                // console.log(this.selectedCue);
                var allCues = this.allCues;
                // console.debug(
                //     'CompilationKeyboardHandler::toPreviousCue:',
                //     allCues,
                // );
                var indexOfSelected = allCues.indexOf(this.selectedCue);
                // console.debug(
                //     'CompilationKeyboardHandler::indexOfSelected:',
                //     indexOfSelected,
                // );
                var nextCue = allCues[indexOfSelected + 1];
                // console.debug(
                //     'CompilationKeyboardHandler::indexOfSelected:',
                //     nextCue,
                // );
                this.$store.commit(MutationTypes.UPDATE_CURRENT_CUE, nextCue);
            },
            false,
        );

        document.addEventListener(
            'replayer-tomnemoniccue',
            (event: Event) => {
                //TODO test just issue the command
                // console.debug(
                //     'CompilationKeyboardHandler::toMatchingCue:mnemonic',
                //     mnemonic,
                // );
                var allCues = this.allCues;
                var matchingCue = allCues.find(
                    (cue) => cue.Shortcut == (event as CustomEvent).detail,
                );
                // console.debug(
                //     'CompilationKeyboardHandler::toMatchingCue:matchingCue',
                //     matchingCue,
                //                );
                if (matchingCue) {
                    this.$store.commit(
                        MutationTypes.UPDATE_CURRENT_CUE,
                        matchingCue,
                    );
                    //TODO Always pause playback
                }
            },
            false,
        );
    },
});
</script>
