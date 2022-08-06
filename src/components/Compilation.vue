<template>
    <div class="compilation">
        <!-- Handle all relevant Replayer events for the compilation level -->
        <ReplayerEventHandler
            @tonextcue="toNextCue"
            @topreviouscue="toPreviousCue"
            @tomnemoniccue="toMnemonicCue($event)"
        />

        <CompilationHeader
            :compilation="compilation"
            :isEditable="isHeaderEditable"
        />
        <!-- Tracks to work with -->
        <template v-for="track in tracks" :key="track.Id">
            <Track
                :track="track"
                :ref="'track-' + track.Id"
                :displayMode="tracksDisplayMode"
            />
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import VueScrollTo from 'vue-scrollto';
import {
    Compilation,
    ITrack,
    ICue,
    TrackDisplayMode,
} from '@/store/compilation-types';
import Track from '@/components/Track.vue';
import { MutationTypes } from '@/store/mutation-types';
import ReplayerEventHandler from '@/components/ReplayerEventHandler.vue';
import CompilationHeader from '@/components/CompilationHeader.vue';

/** Displays the contained list of tracks as tiles
 * @remarks Also handles the common replayer events for compilations
 */
export default defineComponent({
    name: 'Compilation',
    components: {
        Track,
        ReplayerEventHandler,
        CompilationHeader,
    },
    props: {
        compilation: Compilation,
        /** The display mode of the contained tracks.
         * @devdoc Allows to reuse this component for more than one DisplayMode.
         * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        tracksDisplayMode: {
            type: String as () => TrackDisplayMode,
            default: TrackDisplayMode.Collapsible,
            required: false,
        },
    },
    data() {
        return {};
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
                    /** empirical value (taking into account the non-existing fixed top navbar) */
                    offset: -22,
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
         * @remarks This is intentionally only invoked on when the active track changes. If a user scrolls to a
         * certain cue within the same track, no scrolling should occurr, to keep the UI calm.
         */
        activeTrack(track: ITrack | null) {
            console.debug('scrolling to track ', track?.Name);
            if (track) {
                this.scrollToTrack(track);
            }
        },
    },
    computed: {
        /** Whether the header component shows editable inputs for the contained data
         * @remarks For simplicity, the header is shown as editable, as long as the tracks are editable, too.
         * @devdoc Allows to reuse this component for more than one display mode.
         */
        isHeaderEditable(): boolean {
            return this.tracksDisplayMode === TrackDisplayMode.Edit;
        },
        tracks(): Array<ITrack> | undefined {
            return this.$store.getters.tracks as Array<ITrack> | undefined;
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
