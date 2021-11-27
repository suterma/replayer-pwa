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
            <!-- The track with the currently selected cue is highlighted -->
            <a
                title="Scroll to track"
                v-if="activeTrack?.Id == track.Id"
                class="button is-success"
                href="#"
                v-scroll-to="{
                    el: '#track-' + track.Id,
                    /* Try to target the scroll somewhat above the element in question
                        to make it fully visible */
                    offset: -100,
                }"
                >{{ track.Name }}</a
            >
            <!-- A track without the currently selected cue is not highlighted, but can be selected (will also trigger scrolling) -->
            <a
                title="Select first cue and scroll to track"
                v-else
                class="button is-primary"
                href="#"
                @click="this.selectFirstCueOfTrack(track.Id)"
            >
                {{ track.Name }}</a
            >
        </template>
    </div>
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
        /** Visually scrolls to the given track, making it visually at the top of
         * the view.
         */
        scrollToTrack(track: ITrack) {
            if (track) {
                const trackElement = document.getElementById(
                    'track-' + track.Id,
                );
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
        },

        /** Selects the first cue of the given track, if any exists and the track is different than the currently active track. */
        selectFirstCueOfTrack(trackId: string) {
            if (trackId) {
                if (this.activeTrack?.Id != trackId) {
                    const matchingTrack = this.tracks?.filter(
                        (t) => t.Id == trackId,
                    );
                    if (matchingTrack && matchingTrack[0]) {
                        const firstMatchingCue = matchingTrack[0].Cues[0];
                        if (firstMatchingCue) {
                            this.$store.commit(
                                MutationTypes.UPDATE_SELECTED_CUE_ID,
                                firstMatchingCue.Id,
                            );
                        }
                    }
                }
            }
        },

        toPreviousCue() {
            const allCueIds = this.allCues.map((cue) => cue.Id);
            const indexOfSelected = allCueIds.indexOf(this.selectedCueId);
            const prevCueId = allCueIds[indexOfSelected - 1];
            this.$store.commit(MutationTypes.UPDATE_SELECTED_CUE_ID, prevCueId);
        },

        toNextCue() {
            const allCueIds = this.allCues.map((cue) => cue.Id);
            const indexOfSelected = allCueIds.indexOf(this.selectedCueId);
            const nextCueId = allCueIds[indexOfSelected + 1];
            this.$store.commit(MutationTypes.UPDATE_SELECTED_CUE_ID, nextCueId);
        },

        toMnemonicCue(event: Event) {
            const allCues = this.allCues;
            const matchingCue = allCues.find(
                (cue) => cue.Shortcut == (event as CustomEvent).detail,
            );
            if (matchingCue) {
                this.$store.commit(
                    MutationTypes.UPDATE_SELECTED_CUE_ID,
                    matchingCue.Id,
                );
            }
        },
    },
    watch: {
        /** Handle scrolling to the active track.
         * @remarks This is intentionally only invoked on when the active track changes. If a user scrolls to a certain
         * certain cue within the same track, no scrolling should occurr, to keep the UI calm.
         */
        activeTrack(track) {
            console.debug('scrolling to track ', track);
            this.scrollToTrack(track);
        },
    },
    computed: {
        /** Gets the list of tracks within this compilation */
        tracks(): Array<ITrack> | undefined {
            return this.compilation?.Tracks;
        },
        selectedCueId(): string {
            return this.$store.getters.selectedCueId as string;
        },
        allCues(): Array<ICue> {
            const cues = new Array<ICue>();
            this.tracks?.forEach((track) => cues.push(...track.Cues));
            return cues;
        },
        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },
        /** Determines the active track (the one that contains the selected cue ) */
        activeTrack(): ITrack | null {
            const selectedCueId = this.selectedCueId;
            if (!selectedCueId) {
                //if none selected, this track is not active anyway
                return null;
            }

            //Check for matching Ids
            const track = this.tracks?.find((t) =>
                t.Cues.find((c) => c.Id === selectedCueId),
            );

            if (track) {
                return track as ITrack;
            }
            return null;
        },
    },
});
</script>
