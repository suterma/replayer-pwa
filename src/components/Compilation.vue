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

        <div
            class="tracks"
            :class="{
                vertical: showVertical && isMixable,
            }"
        >
            <template v-for="(track, index) in tracks" :key="track.Id">
                <NoticeTrack
                    v-if="track.Url.endsWith('.txt')"
                    :id="'track-' + track.Id"
                    :track="track"
                >
                </NoticeTrack>
                <Track
                    v-else
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
                    :isActiveTrack="activeTrackId === track.Id"
                    @isPlaying="updateIsTrackPlaying($event)"
                    @seekToSeconds="handleTrackSeekToSeconds($event)"
                    :playbackMode="playbackMode"
                    @update:playbackMode="updatePlaybackMode($event)"
                    :hasPreviousTrack="index > 0 || isLoopingPlaybackMode"
                    :hasNextTrack="
                        index < (tracks?.length ?? 0) - 1 ||
                        isLoopingPlaybackMode
                    "
                    :isOnlyAudioTrack="isSingleAudioTrack"
                    :isFirst="isFirstTrack(track.Id)"
                    :isLast="isLastTrack(track.Id)"
                    :isAnySoloed="isAnyTrackSoloed"
                    @previousTrack="
                        toPreviousTrack(track.Id, isLoopingPlaybackMode)
                    "
                    @nextTrack="toNextTrack(track.Id, isLoopingPlaybackMode)"
                    @trackEnded="continueAfterTrack(track.Id)"
                    @trackLoopedTo="multitrackHandler?.seekToSeconds($event)"
                />
            </template>
            <!-- separate Pseudo-Track with "Master" Controls for the Mixer -->
            <template v-if="isMixable">
                <hr />
                <div class="track is-together-print" data-cy="master-track">
                    <!-- Level, also on mobile 
                NOTE: The 100% width is necessary to keep the level's right items fully a the end of the available space. -->
                    <div style="width: 100%" class="level is-mobile">
                        <!-- Left side -->
                        <div class="level-left">
                            <div
                                class="level-item is-justify-content-flex-start"
                            >
                                <SoloButton
                                    :disabled="!isAllTrackLoaded"
                                    :isSoloed="isAllTrackSoloed"
                                    @click="multitrackHandler?.toggleSolo()"
                                    data-cy="solo-all"
                                    title="Solo ALL"
                                />
                                <MuteButton
                                    :disabled="!isAllTrackLoaded"
                                    :isMuted="isAllTrackMuted"
                                    @click="multitrackHandler?.toggleMute()"
                                    data-cy="mute-all"
                                    title="Mute ALL"
                                />
                            </div>
                            <div
                                class="level-item is-narrow is-flex-shrink-2 is-justify-content-flex-start"
                            >
                                <ToggleButton
                                    class="button is-primary"
                                    :class="{
                                        'is-inactive': !showVertical,
                                    }"
                                    :isEngaged="showVertical"
                                    engaged-label="show Horizontal"
                                    disengaged-label="show Vertical"
                                    @click="toggleVertical($event)"
                                >
                                    <BaseIcon
                                        v-if="!showVertical"
                                        :path="mdiRotateLeftVariant"
                                    />
                                    <BaseIcon
                                        v-else
                                        :path="mdiRotateRightVariant"
                                        :style="{
                                            transform: 'rotate(' + 90 + 'deg)',
                                        }"
                                    />
                                </ToggleButton>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
        </div>

        <!-- Multi-track-Controller -->
        <Teleport to="#media-player">
            <div class="section has-background-grey-dark" v-if="isMixable">
                <!-- 
                Track playback bar (In mix mode, this contains:
                - a wide slider
                - the play/pause/mute/solo combo
                - a set of transport controls
                    -->
                <nav class="level is-editable is-unselectable">
                    <div class="level-left">
                        <div class="level-item is-justify-content-flex-start">
                            <SoloButton
                                :disabled="!isAllTrackLoaded"
                                :isSoloed="isAllTrackSoloed"
                                @click="multitrackHandler?.toggleSolo()"
                                data-cy="mute"
                            />
                            <MuteButton
                                :disabled="!isAllTrackLoaded"
                                :isMuted="isAllTrackMuted"
                                @click="multitrackHandler?.toggleMute()"
                                data-cy="mute"
                            />
                        </div>
                        <div
                            class="level-item is-narrow is-flex-shrink-2 is-justify-content-flex-start"
                        >
                            <ToggleButton
                                class="button is-primary"
                                :class="{
                                    'is-inactive': !showVertical,
                                }"
                                :isEngaged="showVertical"
                                engaged-label="show Horizontal"
                                disengaged-label="show Vertical"
                                @click="toggleVertical($event)"
                            >
                                <BaseIcon
                                    v-if="!showVertical"
                                    :path="mdiRotateLeftVariant"
                                />
                                <BaseIcon
                                    v-else
                                    :path="mdiRotateRightVariant"
                                    :style="{
                                        transform: 'rotate(' + 90 + 'deg)',
                                    }"
                                />
                            </ToggleButton>
                        </div>
                    </div>

                    <!-- A central level item. Margins are set to provide nice-looking spacing at all widths -->
                    <div class="level-item mt-4-mobile">
                        <PlayheadSlider
                            class="is-fullwidth"
                            :modelValue="getMultitrackPosition.position"
                            @update:modelValue="
                                (position) =>
                                    multitrackHandler?.seekToSeconds(position)
                            "
                            @seek="
                                (seconds) => multitrackHandler?.seek(seconds)
                            "
                            :trackDuration="
                                multitrackHandler?.getAllTrackDuration()
                            "
                        >
                        </PlayheadSlider>
                    </div>
                    <div class="level-right">
                        <div class="level-item is-justify-content-flex-end">
                            <MediaControlsBar
                                :playbackMode="playbackMode"
                                @update:playbackMode="
                                    updatePlaybackMode($event)
                                "
                                :hasPreviousTrack="false"
                                :hasNextTrack="false"
                                :hasNextCue="false"
                                :hasPreviousCue="false"
                                :hideStopButton="true"
                                @stop="multitrackHandler?.stop()"
                                @togglePlaying="
                                    multitrackHandler?.togglePlayPause()
                                "
                                :hideVolumeButton="true"
                                :isPlaying="isAllPlaying"
                                :isFading="isAnyFading"
                                data-cy="mix-media-controls-bar"
                            >
                                <template #after-play> </template>
                                <button class="button is-nav is-indicator">
                                    <TimeDisplay
                                        :modelValue="
                                            getMultitrackPosition.position
                                        "
                                        :subSecondDigits="1"
                                    ></TimeDisplay>
                                </button>
                                <!-- Sync Time display -->
                                <!-- //TODO make this display a setting -->
                                <button class="button is-nav is-indicator">
                                    <span
                                        class="is-minimum-7-characters is-family-monospace has-text-info"
                                        title="Click to synch tracks"
                                        >({{
                                            getMultitrackPosition.range?.toFixed(
                                                6,
                                            )
                                        }}s)</span
                                    >
                                </button>
                                <button
                                    class="button is-info"
                                    @click="multitrackHandler?.synchTracks"
                                >
                                    Synch
                                </button>
                                <PlaybackIndicator
                                    :isReady="!isAllPlaying && isAllTrackLoaded"
                                    :isPlaying="isAllPlaying"
                                    :isUnloaded="!isAllTrackLoaded"
                                    :isUnavailable="!isAllMediaAvailable"
                                    data-cy="playback-indicator"
                                />
                            </MediaControlsBar>
                        </div>
                    </div>
                </nav>
            </div>
        </Teleport>
    </div>
</template>

<script lang="ts">
import { ComponentPublicInstance, defineComponent } from 'vue';
import VueScrollTo from 'vue-scrollto';
import {
    Compilation,
    ITrack,
    ICue,
    TrackDisplayMode,
    PlaybackMode,
} from '@/store/compilation-types';
import Track from '@/components/Track.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import MediaControlsBar from '@/components/MediaControlsBar.vue';
import PlaybackIndicator from '@/components/PlaybackIndicator.vue';
import MuteButton from '@/components/buttons/MuteButton.vue';
import SoloButton from '@/components/buttons/SoloButton.vue';
import ReplayerEventHandler from '@/components/ReplayerEventHandler.vue';
import PlayheadSlider from '@/components/PlayheadSlider.vue';
import NoticeTrack from '@/components/track/NoticeTrack.vue';
import CompilationHeader from '@/components/CompilationHeader.vue';
import CompilationHandler from '@/store/compilation-handler';
import MultitrackHandler from '@/code/audio/MultitrackHandler';
import ToggleButton from '@/components/buttons/ToggleButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiRotateLeftVariant, mdiRotateRightVariant } from '@mdi/js';
import { mapWritableState, mapActions, mapState } from 'pinia';
import { useAppStore } from '@/store/app';

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
        PlayheadSlider,
        MediaControlsBar,
        TimeDisplay,
        PlaybackIndicator,
        MuteButton,
        SoloButton,
        ToggleButton,
        BaseIcon,
        NoticeTrack,
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

            /** The multitrack-handler to use */
            multitrackHandler: undefined as unknown as MultitrackHandler,

            /** Whether to show the track in a vertical orientation */
            showVertical: false,

            /** Icons from @mdi/js */
            mdiRotateLeftVariant: mdiRotateLeftVariant,
            mdiRotateRightVariant: mdiRotateRightVariant,
        };
    },
    mounted() {
        this.multitrackHandler = new MultitrackHandler(
            this.$refs as {
                [name: string]: Element | ComponentPublicInstance | null;
            },
        );
    },
    methods: {
        ...mapActions(useAppStore, ['updateSelectedCueId']),

        /** Visually scrolls to the given track, making it visually at the top of
         * the view.
         */
        scrollToTrack(trackId: string) {
            if (trackId) {
                const trackElement = document.getElementById(
                    'track-' + trackId,
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

        toggleVertical(event: Event): void {
            this.showVertical = !this.showVertical;
            if (this.showVertical) {
                VueScrollTo.scrollTo(event.target, {
                    /** Always scroll, make it on top of the view */
                    force: true,
                    /** empirical value */
                    offset: 0,
                    /** Avoid interference with the key press overlay */
                    cancelable: false,
                });
            }
        },

        updateIsTrackPlayerFullScreen(isFullScreen: boolean): void {
            this.isTrackPlayerFullScreen = isFullScreen;
        },

        /* Handles a change of play state for a single track (before/after fading), by controlling the other tracks
         * @remarks This must only be done when multitrack playback is expected.
         */
        updateIsTrackPlaying(isPlaying: boolean): void {
            if (this.isMixable) {
                console.debug('Compilation::isPlaying:', isPlaying);

                if (isPlaying && !this.isAllPlaying) {
                    console.debug('Compilation::isAnyFading:Playing all...');
                    this.multitrackHandler?.play();
                }
            }
        },

        /* Handles a seek operation of a single track, by replicating it to the other tracks
         * @remarks This must only be done when multitrack playback is expected.
         */
        handleTrackSeekToSeconds(seconds: number): void {
            if (this.isMixable) {
                this.multitrackHandler?.seekToSeconds(seconds);
            }
        },

        updatePlaybackMode(playbackMode: PlaybackMode): void {
            //omit the modes that affect more than one track
            if (this.isSingleAudioTrack) {
                if (
                    playbackMode === PlaybackMode.LoopCompilation ||
                    playbackMode === PlaybackMode.ShuffleCompilation
                ) {
                    playbackMode = PlaybackMode.PlayTrack;
                }
            }

            this.playbackMode = playbackMode;
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
            if (this.hasTracks) {
                if (
                    this.playbackMode === PlaybackMode.LoopCompilation ||
                    this.playbackMode === PlaybackMode.ShuffleCompilation
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
                if (prevCueId) {
                    this.updateSelectedCueId(prevCueId);
                }
            } else {
                //loop to last
                const lastCueId = allCueIds.at(-1);
                if (lastCueId) {
                    this.updateSelectedCueId(lastCueId);
                }
            }
        },

        /** Selects the next cue, if any. Otherwise, loop to the first cue */
        toNextCue() {
            console.debug('Compilation::toNextCue');
            const allCueIds = this.allCues.map((cue) => cue.Id);
            const indexOfSelected = allCueIds.indexOf(this.selectedCueId);
            if (indexOfSelected < allCueIds.length - 1) {
                const nextCueId = allCueIds[indexOfSelected + 1];
                if (nextCueId) {
                    this.updateSelectedCueId(nextCueId);
                }
            } else {
                //loop to first
                const firstCueId = allCueIds.at(0);
                if (firstCueId) {
                    this.updateSelectedCueId(firstCueId);
                }
            }
        },

        toMnemonicCue(event: Event) {
            console.debug('Compilation::toMnemonicCue');
            const allCues = this.allCues;
            const matchingCue = allCues.find(
                (cue) => cue.Shortcut == (event as CustomEvent).detail,
            );
            if (matchingCue) {
                this.updateSelectedCueId(matchingCue.Id);
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
        /** Synchronizes all track positions.
         * @remarks This must only be done when multitrack playback is expected.
         */
        synchTracks() {
            if (this.isMixable) {
                this.multitrackHandler?.synchTracks();
            }
        },
    },
    watch: {
        /** Handle scrolling to the changed active track.
         * @remarks This is intentionally only invoked on when the active track changes (and it's not the only audio track).
         * If a user scrolls to a certain cue within the same track, no scrolling should occur, to keep the UI calm.
         */
        activeTrackId(trackId: string | null) {
            if (trackId && !this.isSingleAudioTrack) {
                console.debug('scrolling to activated track ', trackId);
                this.$nextTick(() => {
                    this.scrollToTrack(trackId);
                });
            }
        },

        /** Handle scrolling to the active track, when the display mode changes.
         * @remarks This is intentionally only invoked on when the display mode changes (and it's not the only track).
         */
        tracksDisplayMode() {
            const trackId = this.activeTrackId;
            if (trackId && !this.isSingleAudioTrack) {
                console.debug('scrolling to mode-changed track ', trackId);
                this.$nextTick(() => {
                    if (trackId != null) {
                        this.scrollToTrack(trackId);
                    }
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

        /** At change of play state (before/after fading), synch tracks)
         * @remarks This must only be done when multitrack playback is expected.
         */
        isAllPlaying(allPlaying: boolean) {
            if (this.isMixable && allPlaying && this.isAllTrackLoaded) {
                this.synchTracks();
            }
        },
        /** At change of play state (before/after fading), synch tracks)
         * @remarks This must only be done when multitrack playback is expected.
         */
        isAllPaused(allPaused: boolean) {
            if (this.isMixable && allPaused && this.isAllTrackLoaded) {
                this.synchTracks();
            }
        },

        /* At change of fading state of any track, replicate the determined action to all tracks
         * @remarks This must only be done when multitrack playback is expected.
         */
        isAnyFading(isAnyFading: boolean, wasAnyFading: boolean) {
            if (this.isMixable) {
                console.debug('Compilation::isAnyFading:', isAnyFading);

                // Still all playing, but now any fading?
                if (!wasAnyFading && isAnyFading && this.isAllPlaying) {
                    // must be a pause operation on a single track
                    console.debug('Compilation::isAnyFading:Pausing all...');
                    this.multitrackHandler?.pause();
                }
            }
        },
    },
    computed: {
        ...mapState(useAppStore, [
            'selectedCueId',
            'activeTrackId',
            'isSingleAudioTrack',
        ]),
        ...mapWritableState(useAppStore, ['playbackMode']),

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
            return this.playbackMode === PlaybackMode.ShuffleCompilation;
        },
        /** Whether the PlaybackMode is looping the tracks
         * in the compilation.
         * @remarks These are PlaybackMode.ShuffleCompilation
         * and PlaybackMode.ShuffleCompilation
         */
        isLoopingPlaybackMode(): boolean {
            return (
                this.playbackMode === PlaybackMode.ShuffleCompilation ||
                this.playbackMode === PlaybackMode.LoopCompilation
            );
        },

        /** Whether the edit mode is active
         * @remarks For simplicity, the header is shown as editable, as long as the tracks are editable, too.
         */
        isEditable(): boolean {
            return this.tracksDisplayMode === TrackDisplayMode.Edit;
        },

        /** Whether the mix mode is active
         */
        isMixable(): boolean {
            return this.tracksDisplayMode === TrackDisplayMode.Mix;
        },

        /** The currently available tracks in the compilation
         * @remarks The order may also be shuffled, depending on the PlaybackMode
         */
        tracks(): Array<ITrack> | undefined {
            const tracks = this.compilation?.Tracks as
                | Array<ITrack>
                | undefined;
            //Deterministically shuffle if required
            if (tracks && this.isTracksShuffled) {
                return CompilationHandler.shuffle(tracks, this.shuffleSeed);
            }
            return tracks;
        },

        /** Returns all cues from all tracks in the current compilation */
        allCues(): Array<ICue> {
            return CompilationHandler.getAllCues(this.tracks);
        },

        /** Determines, whether all tracks in the compilation are currently playing (used with the mix mode) */
        isAllPlaying() {
            return this.multitrackHandler?.isAllPlaying() ?? false;
        },

        /** Determines, whether all tracks in the compilation are currently paused (used with the mix mode) */
        isAllPaused() {
            return this.multitrackHandler?.isAllPaused() ?? false;
        },

        /** Determines, whether all tracks in the compilation are currently loaded (used with the mix mode) */
        isAllTrackLoaded() {
            return this.multitrackHandler?.isAllTrackLoaded() ?? false;
        },

        /** Determines, whether all tracks in the compilation are currently muted (used with the mix mode) */
        isAllTrackMuted() {
            return this.multitrackHandler?.isAllTrackMuted() ?? false;
        },

        /** Determines, whether any track in the compilation is currently soloed (used with the mix mode) */
        isAnyTrackSoloed() {
            return this.multitrackHandler?.isAnyTrackSoloed() ?? false;
        },

        /** Determines, whether all tracks in the compilation are currently soloed (used with the mix mode) */
        isAllTrackSoloed() {
            return this.multitrackHandler?.isAllTrackSoloed() ?? false;
        },

        /** Determines, whether all tracks in the compilation have their media available (used with the mix mode) */
        isAllMediaAvailable(): boolean {
            return this.multitrackHandler?.isAllMediaAvailable() ?? false;
        },

        /** Determines playback progress of all tracks in the compilation, in [seconds] (used with the mix mode).
         * @returns A single representation for the progress as an average
         * @devdoc As a component update performance optimization, the numeric value is truncated to one decimal digit, as displayed, avoiding
         * unnecessary update for actually non-distinctly displayed values.
         */
        getMultitrackPosition(): { position: number; range: number | null } {
            return {
                position:
                    Math.floor(
                        this.multitrackHandler?.getAllTrackPosition() * 10,
                    ) / 10,
                range:
                    //TODO us a setting and only execute this call when required by the setting
                    this.multitrackHandler?.getAllTrackPositionRange() ?? null,
            };
        },

        /** Determines, whether any track in the compilation is currently fading (used with the mix mode) */
        isAnyFading() {
            return this.multitrackHandler?.isAnyFading() ?? false;
        },
    },
});
</script>
<style type="css">
.tracks.vertical {
    /* background-color: darkslategray; */
    max-width: calc(100vh - 200px);
    min-width: calc(100vh - 200px);
    transform: rotate(-90deg) translate(calc(-100vh + 200px), 0);
    transform-origin: top left;
    overflow-y: auto;
}
/** Rotate knobs back to their upright position */
.tracks.vertical .track .is-knob {
    transform: rotate(+90deg);
}

/** Rotate buttons back to their upright position */
.tracks.vertical .track .button {
    transform: rotate(+90deg);
    width: 2.5em;
}
</style>
