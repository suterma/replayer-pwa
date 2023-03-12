<template>
    <div class="compilation" v-if="compilation" data-cy="compilation">
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
                :id="'track-' + track.Id"
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
                :isOnlyTrack="isSingleTrack"
                :isFirst="isFirstTrack(track.Id)"
                :isLast="isLastTrack(track.Id)"
                @previousTrack="
                    toPreviousTrack(track.Id, isLoopingPlaybackMode)
                "
                @nextTrack="toNextTrack(track.Id, isLoopingPlaybackMode)"
                @trackEnded="continueAfterTrack(track.Id)"
            />
        </template>

        <Experimental>
            <!-- Multi-track-Controller -->
            <Teleport to="#media-player">
                <div class="section has-background-grey-dark">
                    <MediaControlsBar
                        :playbackMode="compilation.PlaybackMode"
                        @update:playbackMode="updatePlaybackMode($event)"
                        :hasPreviousTrack="false"
                        :hasNextTrack="false"
                        :hideStopButton="false"
                        @stop="stopMix()"
                        @togglePlaying="skipToPlayPauseMix()"
                        data-cy="mix-media-controls-bar"
                    >
                        <template #after-play>
                            <MuteButton
                                :disabled="!isAllTrackLoaded"
                                :class="{
                                    'is-danger': true,
                                    'is-inactive': !isAllTrackMuted,
                                }"
                                :isMuted="isAllTrackMuted"
                                @click="toggleMuteMix"
                                data-cy="mute"
                            />
                        </template>
                        <PlaybackIndicator
                            :isReady="!isAllPlaying && isAllTrackLoaded"
                            :isPlaying="isAllPlaying"
                            :isUnloaded="!isAllTrackLoaded"
                            :isUnavailable="!isAllMediaAvailable"
                            data-cy="playback-indicator"
                        />
                    </MediaControlsBar>
                </div>
            </Teleport>
        </Experimental>
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
import MediaControlsBar from '@/components/MediaControlsBar.vue';
import PlaybackIndicator from '@/components/PlaybackIndicator.vue';
import MuteButton from '@/components/buttons/MuteButton.vue';
import ReplayerEventHandler from '@/components/ReplayerEventHandler.vue';
import CompilationHeader from '@/components/CompilationHeader.vue';
import CompilationHandler from '@/store/compilation-handler';

/** Displays the contained set of tracks according to the required mode.
 * @remarks Also handles the common replayer events for compilations
 * @remarks Also supports shuffling of tracks
 */
export default defineComponent({
    name: 'Compilation',
    components: {
        Track,
        ReplayerEventHandler,
        CompilationHeader,
        MediaControlsBar,
        PlaybackIndicator,
        MuteButton,
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

            mounted: false,
        };
    },
    mounted() {
        this.mounted = true;
    },
    unmounted() {
        this.mounted = false;
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
            //omit the modes that affect more than one track
            if (this.isSingleTrack) {
                if (
                    playbackMode === PlaybackMode.LoopCompilation ||
                    playbackMode === PlaybackMode.ShuffleCompilation
                ) {
                    playbackMode = PlaybackMode.PlayTrack;
                }
            }

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
            return track;
        },

        /** Selects the previous cue, if any. Otherwise, loop to the last cue */
        toPreviousCue() {
            console.debug('Compilation::toPreviousCue');
            const allCueIds = this.allCues.map((cue) => cue.Id);
            const indexOfSelected = allCueIds.indexOf(this.selectedCueId);
            if (indexOfSelected > 0) {
                const prevCueId = allCueIds[indexOfSelected - 1];
                this.$store.commit(
                    MutationTypes.UPDATE_SELECTED_CUE_ID,
                    prevCueId,
                );
            } else {
                //loop to last
                this.$store.commit(
                    MutationTypes.UPDATE_SELECTED_CUE_ID,
                    allCueIds.at(-1),
                );
            }
        },

        /** Selects the next cue, if any. Otherwise, loop to the first cue */
        toNextCue() {
            console.debug('Compilation::toNextCue');
            const allCueIds = this.allCues.map((cue) => cue.Id);
            const indexOfSelected = allCueIds.indexOf(this.selectedCueId);
            if (indexOfSelected < allCueIds.length - 1) {
                const nextCueId = allCueIds[indexOfSelected + 1];
                this.$store.commit(
                    MutationTypes.UPDATE_SELECTED_CUE_ID,
                    nextCueId,
                );
            } else {
                //loop to first
                this.$store.commit(
                    MutationTypes.UPDATE_SELECTED_CUE_ID,
                    allCueIds.at(0),
                );
            }
        },

        toMnemonicCue(event: Event) {
            console.debug('Compilation::toMnemonicCue');
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

        /** Whether this track is the first track in the set of tracks */
        isFirstTrack(trackId: string): boolean {
            if (this.tracks != undefined) {
                return this.tracks[0]?.Id === trackId;
            }
            return false;
        },
        /** Whether this track is the last track in the set of tracks */
        isLastTrack(trackId: string): boolean {
            if (this.tracks != undefined) {
                return this.tracks[this.tracks.length - 1]?.Id === trackId;
            }
            return false;
        },

        stopMix() {
            const instances = this.tracks?.map((track) => {
                return this.getTrackInstance(track.Id);
            });

            if (instances) {
                instances.forEach((instance) => {
                    instance.stop();
                });
            }
        },
        skipToPlayPauseMix() {
            const instances = this.tracks?.map((track) => {
                return this.getTrackInstance(track.Id);
            });

            if (instances) {
                instances.forEach((instance) => {
                    instance.play();
                });
            }
        },
        toggleMuteMix() {
            const allMuted = this.isAllTrackMuted;
            const instances = this.tracks?.map((track) => {
                return this.getTrackInstance(track.Id);
            });

            if (instances) {
                instances.forEach((instance) => {
                    instance.toggleMute(!allMuted);
                });
            }
        },
    },
    watch: {
        /** Handle scrolling to the changed active track.
         * @remarks This is intentionally only invoked on when the active track changes (and it's not the only track).
         * If a user scrolls to a certain cue within the same track, no scrolling should occur, to keep the UI calm.
         */
        activeTrack(track: ITrack | null) {
            if (track && !this.isSingleTrack) {
                console.debug('scrolling to activated track ', track.Name);
                this.$nextTick(() => {
                    this.scrollToTrack(track);
                });
            }
        },
        /** Handle scrolling to the active track, when the display mode changes.
         * @remarks This is intentionally only invoked on when the display mode changes (and it's not the only track).
         */
        tracksDisplayMode() {
            const track = this.activeTrack;
            if (track && !this.isSingleTrack) {
                console.debug('scrolling to mode-changed track ', track.Name);
                this.$nextTick(() => {
                    this.scrollToTrack(track);
                });
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
    },
    computed: {
        /** Whether this compilation has no more than single track.
         */
        isSingleTrack(): boolean {
            if (this.tracks && this.tracks.length > 1) {
                return false;
            }
            return true;
        },

        /** Whether this compilation has any tracks.
         */
        hasTracks(): boolean {
            if (this.tracks && this.tracks.length > 0) {
                return true;
            }
            return false;
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
        /** Returns all cues from all tracks in the current compilation */
        allCues(): Array<ICue> {
            return CompilationHandler.getAllCues(this.tracks);
        },
        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },
        /** Determines the active track */
        activeTrack(): ITrack | null {
            return this.$store.getters.activeTrack;
        },

        /** Determines, whether all tracks in the compilation are currently playing (used with the mix mode) */
        isAllPlaying() {
            //TODO simplify all these 3 methodes
            if (this.hasCompilation && this.mounted) {
                const instances = this.tracks
                    ?.filter((t) => t.Id)
                    .map((track) => {
                        return this.getTrackInstance(track.Id);
                    });

                if (instances) {
                    return instances
                        ?.filter((t) => t)
                        .map((track) => {
                            return track.isPlaying;
                        })
                        .every((v) => v === true);
                }
            }
            return false;
        },

        /** Determines, whether all tracks in the compilation are currently loaded (used with the mix mode) */
        isAllTrackLoaded() {
            if (this.hasCompilation && this.mounted) {
                const instances = this.tracks
                    ?.filter((t) => t.Id)
                    .map((track) => {
                        return this.getTrackInstance(track.Id);
                    });

                if (instances) {
                    return instances
                        ?.filter((t) => t)
                        .map((track) => {
                            return track.isTrackLoaded;
                        })
                        .every((v) => v === true);
                }
            }

            return false;
        },

        /** Determines, whether all tracks in the compilation are currently muted (used with the mix mode) */
        isAllTrackMuted() {
            if (this.hasCompilation && this.mounted) {
                const instances = this.tracks
                    ?.filter((t) => t.Id)
                    .map((track) => {
                        return this.getTrackInstance(track.Id);
                    });

                if (instances) {
                    return instances
                        ?.filter((t) => t)
                        .map((track) => {
                            return track.isMuted;
                        })
                        .every((v) => v === true);
                }
            }

            return false;
        },

        /** Determines, whether all tracks in the compilation have their media available (used with the mix mode) */
        isAllMediaAvailable() {
            if (this.hasCompilation && this.mounted) {
                const instances = this.tracks
                    ?.filter((t) => t.Id)
                    .map((track) => {
                        return this.getTrackInstance(track.Id);
                    });

                if (instances) {
                    return instances
                        ?.filter((t) => t)
                        .map((track) => {
                            return track.isMediaAvailable;
                        })
                        .every((v) => v === true);
                }
            }
            return false;
        },
    },
});
</script>
