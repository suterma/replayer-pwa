<template>
    <div class="compilation" v-if="compilation">
        <!-- Handle all relevant Replayer events for the compilation level -->
        <ReplayerEventHandler
            @tonextcue="toNextCue"
            @topreviouscue="toPreviousCue"
            @tomnemoniccue="toMnemonicCue($event)"
        />

        <CompilationHeader
            :compilation="compilation"
            :isEditable="isEditable"
        />
        <!-- Tracks to work with -->
        <template v-for="(track, index) in tracks" :key="track.Id">
            <Track
                :track="track"
                :ref="'track-' + track.Id"
                :displayMode="tracksDisplayMode"
                :isTrackPlayerFullScreen="
                    isTrackPlayerFullScreen && !isEditable
                "
                @update:isTrackPlayerFullScreen="
                    updateIsTrackPlayerFullScreen($event)
                "
                :playbackMode="compilation.PlaybackMode"
                @update:playbackMode="updatePlaybackMode($event)"
                :hasPreviousTrack="index > 0 || isLoopingPlaybackMode"
                :hasNextTrack="
                    index < (tracks?.length ?? 0) - 1 || isLoopingPlaybackMode
                "
                @previousTrack="
                    toPreviousTrack(track.Id, isLoopingPlaybackMode)
                "
                @nextTrack="toNextTrack(track.Id, isLoopingPlaybackMode)"
                @trackEnded="continueAfterTrack(track.Id)"
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
    PlaybackMode,
} from '@/store/compilation-types';
import Track from '@/components/Track.vue';
import { MutationTypes } from '@/store/mutation-types';
import ReplayerEventHandler from '@/components/ReplayerEventHandler.vue';
import CompilationHeader from '@/components/CompilationHeader.vue';
import CompilationHandler from '@/store/compilation-handler';

/** Displays the contained list of tracks in a list, ready to play.
 * @remarks Also handles the common replayer events for compilations
 * @remarks Also supports shuffling of tracks
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
            default: TrackDisplayMode.Play,
            required: false,
        },
    },
    data() {
        return {
            /** Whether to show the track player widget in full screen mode
             * @remarks This should apply to all tracks player widgets of a compilation
             * @remarks For layout reasons, a track should not be displayed in full screen,
             * when it's in editing mode.
             */
            isTrackPlayerFullScreen: false,

            /** A seed for the deterministic shuffling (until next shuffling is requested)
             * @remarks Reshuffling occurs when the PlaybackMode is toggled to ShuffleCompilation.
             * @devdoc This allows to keep the shuffled order.
             */
            shuffleSeed: 1,
        };
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

        updateIsTrackPlayerFullScreen(isFullScreen: boolean): void {
            this.isTrackPlayerFullScreen = isFullScreen;
        },

        updatePlaybackMode(playbackMode: PlaybackMode): void {
            this.$store.commit(MutationTypes.UPDATE_PLAYBACK_MODE, {
                playbackMode,
            });
        },

        /** Moves playback to the previous track
         * @param trackId - The Id of the track to use the previous of
         * @param loop - When true, and the previous track is not defined, the last track is used.
         */
        toPreviousTrack(trackId: string, loop = false): void {
            if (this.tracks) {
                const prevTrackId = CompilationHandler.getPreviousTrackById(
                    this.tracks,
                    trackId,
                    loop,
                )?.Id;
                if (prevTrackId) {
                    this.getTrackInstance(prevTrackId).skipToPlayPause();
                }
            }
        },
        /** Moves playback to the next track
         * @remarks Optionally supports looping back to the beginning, if the end was reached.
         * @param trackId - The Id of the track to use the next of
         * @param loop - When true, and the next track is not defined, the first track is used.
         */
        toNextTrack(trackId: string, loop = false): void {
            console.debug('toNextTrack', trackId);
            if (this.tracks) {
                const nextTrackId = CompilationHandler.getNextTrackById(
                    this.tracks,
                    trackId,
                    loop,
                )?.Id;
                if (nextTrackId) {
                    this.getTrackInstance(nextTrackId).skipToPlayPause();
                }
            }
        },

        /** Handles the playback mode after a track has ended. Implement the compilation loop and shuffle modes.
         */
        continueAfterTrack(trackId: string): void {
            console.debug('continueAfterTrack', trackId);
            if (this.compilation) {
                if (
                    this.compilation.PlaybackMode ==
                        PlaybackMode.LoopCompilation ||
                    this.compilation.PlaybackMode ==
                        PlaybackMode.ShuffleCompilation
                ) {
                    this.toNextTrack(trackId, true);
                }
            }
        },

        /** Gets a reference to the track component instance.
         * @devdoc $ref's are non-reactive, see https://v3.vuejs.org/api/special-attributes.html#ref
         * Thus, referencing an instance after it has been removed from the DOM (e.g. by v-if)
         * does not work, even after it's rendered again later.
         */
        getTrackInstance(trackId: string): InstanceType<typeof Track> {
            const trackRef = 'track-' + trackId;
            const track = (this.$refs[trackRef] as never)[0] as InstanceType<
                typeof Track
            >;
            console.debug('ref track', track);
            return track;
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
         * @remarks This is intentionally only invoked on when the active track changes (and it's not the only track).
         * If a user scrolls to a certain cue within the same track, no scrolling should occur, to keep the UI calm.
         */
        activeTrack(track: ITrack | null) {
            if (track && !this.isSingleTrack) {
                console.debug('scrolling to track ', track?.Name);
                this.scrollToTrack(track);
            }
        },

        /** Updates the shuffle seed if required by a playback mode change.
         */
        isTracksShuffled(isShuffled: boolean) {
            if (isShuffled) {
                this.shuffleSeed = ++this.shuffleSeed;
                console.debug(
                    'Compilation::playbackMode:shuffleSeed',
                    this.shuffleSeed,
                );
            }
        },

        //TODO add a watch for the shuffle mode, then add a random seed to the shuffle function
    },
    computed: {
        /** Whether this compilation only has no or only a single track.
         */
        isSingleTrack(): boolean {
            if (this.tracks && this.tracks.length > 1) {
                return false;
            }
            return true;
        },
        /** Whether the tracks are currently in a shuffled order.
         */
        isTracksShuffled(): boolean {
            return (
                this.compilation?.PlaybackMode ==
                PlaybackMode.ShuffleCompilation
            );
        },
        /** Whether the PlaybackMode is looping the tracks
         * in the compilation.
         * @remarks These are PlaybackMode.ShuffleCompilation
         * and PlaybackMode.ShuffleCompilation
         */
        isLoopingPlaybackMode(): boolean {
            return (
                this.compilation?.PlaybackMode ==
                    PlaybackMode.ShuffleCompilation ||
                this.compilation?.PlaybackMode == PlaybackMode.LoopCompilation
            );
        },

        /** Whether the edit mode is active
         * @remarks For simplicity, the header is shown as editable, as long as the tracks are editable, too.
         */
        isEditable(): boolean {
            return this.tracksDisplayMode === TrackDisplayMode.Edit;
        },

        /** The currently available tracks in the compilation
         * @remarks The order may also be shuffled, depending on the PlaybackMode
         */
        tracks(): Array<ITrack> | undefined {
            const tracks = this.$store.getters.tracks as
                | Array<ITrack>
                | undefined;
            //Deterministically shuffle if required
            if (tracks && this.isTracksShuffled) {
                return CompilationHandler.shuffle(tracks, this.shuffleSeed);
            }
            return tracks;
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
        /** Determines the active track */
        activeTrack(): ITrack | null {
            return this.$store.getters.activeTrack;
        },
    },
});
</script>
