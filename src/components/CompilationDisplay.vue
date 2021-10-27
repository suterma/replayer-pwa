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

    <!-- Buttons as index to the tracks-->
    <div class="buttons">
        <template v-for="track in tracks" :key="track.Id">
            <a
                class="button is-primary"
                href="#"
                v-scroll-to="{
                    el: '#track-' + track.Id,
                    /* Try to target the scroll somewhat above the element in question
                        to make it fully visible */
                    offset: -100,
                }"
                >{{ track.Name }}</a
            >
        </template>
    </div>
    <hr />
    <!-- Tracks to work with -->
    <template v-for="track in tracks" :key="track.Id">
        <TrackTile :track="track" />
    </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import VueScrollTo from 'vue-scrollto';
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
        /** Visually scrolls to the track of the, making it visually at the top of
         * the view.
         */
        scrollToTrackOfCue(cue: ICue) {
            //console.debug('Scroll to cue ', cue);
            if (cue) {
                const track = this.getTrackOf(cue);
                //console.debug('Scroll to track ', track);

                if (track) {
                    const trackElement = document.getElementById(
                        'track-' + track.Id,
                    );
                    //console.debug('Scroll to trackElement ', trackElement);
                    VueScrollTo.scrollTo(trackElement, {
                        /** Always scroll, make it on top of the view */
                        force: true,
                        /* Try to target the scroll somewhat above the element in question
                        to make it fully visible */
                        offset: -100,
                        /** Avoid interference with the key press overlay */
                        cancelable: false,
                    });
                }
            }
        },

        toPreviousCue() {
            const allCues = this.allCues;
            const indexOfSelected = allCues.indexOf(this.selectedCue);
            const previousCue = allCues[indexOfSelected - 1];
            this.$store.commit(MutationTypes.UPDATE_CURRENT_CUE, previousCue);
            this.scrollToTrackOfCue(previousCue);
        },

        toNextCue() {
            const allCues = this.allCues;
            const indexOfSelected = allCues.indexOf(this.selectedCue);
            const nextCue = allCues[indexOfSelected + 1];
            this.$store.commit(MutationTypes.UPDATE_CURRENT_CUE, nextCue);
            this.scrollToTrackOfCue(nextCue);
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
                this.scrollToTrackOfCue(matchingCue);
            }
        },

        /** Determines the active track (i.e. given cue is from this track ) */
        getTrackOf(cue: ICue): ITrack | null {
            const selectedCueId = cue.Id;
            // console.debug(
            //     `TrackTile(${this.track?.Name})::isActiveTrack:selectedCueId`,
            //     selectedCueId,
            // );

            // if (!selectedCueId) {
            //     //if none selected, this track is not active anyway
            //     return null;
            // }

            //Check for matching Ids
            const track = this.tracks?.find((t) =>
                t.Cues.find((c) => c.Id === selectedCueId),
            );

            if (track) {
                return track as ITrack;
            }
            return null;

            // return (
            //     (this.cues?.filter((c) => c.Id === selectedCue.Id).length ??
            //         0) > 0
            // );
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
