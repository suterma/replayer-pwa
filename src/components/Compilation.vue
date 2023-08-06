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
            <template v-for="track in textTracks" :key="track.Id">
                <NoticeTrack
                    class="block"
                    :id="'track-' + track.Id"
                    :track="track"
                >
                </NoticeTrack>
            </template>
            <template v-for="(track, index) in tracks" :key="track.Id">
                <MediaTrack
                    class="block"
                    :track="track"
                    :ref="'track-' + track.Id"
                    :id="'track-' + track.Id"
                    :viewMode="trackViewode"
                    :isTrackPlayerFullScreen="
                        isTrackPlayerFullScreen && !isEditable
                    "
                    @update:isTrackPlayerFullScreen="
                        updateIsTrackPlayerFullScreen($event)
                    "
                    :isActiveTrack="activeTrackId === track.Id"
                    :playbackMode="playbackMode"
                    @update:playbackMode="updatePlaybackMode($event)"
                    :hasPreviousTrack="index > 0 || isLoopingPlaybackMode"
                    :hasNextTrack="
                        index < (tracks?.length ?? 0) - 1 ||
                        isLoopingPlaybackMode
                    "
                    :isOnlyMediaTrack="hasSingleMediaTrack"
                    :isFirst="isFirstTrack(track.Id)"
                    :isLast="isLastTrack(track.Id)"
                    @previousTrack="
                        toPreviousTrack(track.Id, isLoopingPlaybackMode)
                    "
                    @nextTrack="toNextTrack(track.Id, isLoopingPlaybackMode)"
                    @trackEnded="continueAfterTrack(track.Id)"
                />
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import VueScrollTo from 'vue-scrollto';
import {
    Compilation,
    ITrack,
    ICue,
    TrackViewMode,
    PlaybackMode,
} from '@/store/compilation-types';
import MediaTrack from '@/components/track/MediaTrack.vue';
import ReplayerEventHandler from '@/components/ReplayerEventHandler.vue';
import NoticeTrack from '@/components/track/NoticeTrack.vue';
import CompilationHeader from '@/components/CompilationHeader.vue';
import CompilationHandler from '@/store/compilation-handler';
import { mdiRotateLeftVariant, mdiRotateRightVariant } from '@mdi/js';
import { mapWritableState, mapActions, mapState } from 'pinia';
import { useAppStore } from '@/store/app';
import NoSleep from 'nosleep.js';
import { useSettingsStore } from '@/store/settings';

/** Displays the contained set of tracks according to the required mode.
 * @remarks Also handles the common replayer events for compilations
 * @remarks Also supports shuffling of tracks
 */
export default defineComponent({
    // eslint-disable-next-line vue/multi-word-component-names
    name: 'Compilation',
    components: {
        MediaTrack,
        ReplayerEventHandler,
        CompilationHeader,
        NoticeTrack,
    },
    props: {
        compilation: Object as PropType<Compilation>,

        /** The display mode of the contained tracks.
         * @devdoc Allows to reuse this component for more than one view.
         * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        trackViewode: {
            type: String as () => TrackViewMode,
            default: TrackViewMode.Play,
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

            /** The wake lock fill-in that can prevent screen timeout, while a track is in use */
            noSleep: new NoSleep(),

            /** A seed for the deterministic shuffling (until next shuffling is requested)
             * @remarks Reshuffling occurs when the PlaybackMode is toggled to ShuffleCompilation.
             * @devdoc This allows to keep the shuffled order.
             */
            shuffleSeed: 1,

            /** Whether to show the track in a vertical orientation */
            showVertical: false,

            /** Icons from @mdi/js */
            mdiRotateLeftVariant: mdiRotateLeftVariant,
            mdiRotateRightVariant: mdiRotateRightVariant,
        };
    },
    activated(): void {
        this.activateWakeLock();
    },
    deactivated(): void {
        this.deactivateWakeLock();
    },

    methods: {
        ...mapActions(useAppStore, ['updateSelectedCueId']),

        /** Activates the wake lock (if enabled in settings)
         * @remarks Implements https://github.com/suterma/replayer-pwa/issues/26
         * @devdoc Uses a wake-lock fill in, because this feature is not yet available on all browsers
         */
        activateWakeLock(): void {
            if (this.preventScreenTimeout) {
                if (!this.noSleep.isEnabled) {
                    this.noSleep.enable().catch((error) => {
                        console.warn(
                            `Swallowed error for failed WakeLock promise: ${error.name}, ${error.message}`,
                        );
                    });
                }
            }
        },
        /** Deactivates the wake lock
         * @devdoc Uses a wake-lock fill in, because this feature is not yet available on all browsers
         */
        deactivateWakeLock(): void {
            if (this.noSleep.isEnabled) {
                this.noSleep.disable();
            }
        },

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

        updatePlaybackMode(playbackMode: PlaybackMode): void {
            //omit the modes that affect more than one track
            if (this.hasSingleMediaTrack) {
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
        getTrackInstance(trackId: string): InstanceType<typeof MediaTrack> {
            const trackRef = 'track-' + trackId;
            const track = (this.$refs[trackRef] as never)[0] as InstanceType<
                typeof MediaTrack
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
    },
    watch: {
        /** Handle scrolling to the changed active track.
         * @remarks This is intentionally only invoked on when the active track changes (and it's not the only audio track).
         * If a user scrolls to a certain cue within the same track, no scrolling should occur, to keep the UI calm.
         */
        activeTrackId(trackId: string | null) {
            if (trackId && !this.hasSingleMediaTrack) {
                console.debug('scrolling to activated track ', trackId);
                this.$nextTick(() => {
                    this.scrollToTrack(trackId);
                });
            }
        },

        /** Handle scrolling to the active track, when the display mode changes.
         * @remarks This is intentionally only invoked on when the display mode changes (and it's not the only track).
         */
        trackViewode() {
            const trackId = this.activeTrackId;
            if (trackId && !this.hasSingleMediaTrack) {
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
    },
    computed: {
        ...mapState(useAppStore, [
            'selectedCueId',
            'activeTrackId',
            'hasSingleMediaTrack',
            'textTracks',
            'mediaTracks',
        ]),
        ...mapWritableState(useAppStore, ['playbackMode']),

        ...mapState(useSettingsStore, ['preventScreenTimeout']),

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
            return this.trackViewode === TrackViewMode.Edit;
        },

        /** Whether the mix mode is active
         */
        isMixable(): boolean {
            return this.trackViewode === TrackViewMode.Mix;
        },

        /** The currently available media tracks in the compilation
         * @remarks The order may also be shuffled, depending on the PlaybackMode
         */
        tracks(): Array<ITrack> | undefined {
            const tracks = this.mediaTracks as Array<ITrack> | undefined;
            //Deterministically shuffle if required
            if (tracks && this.isTracksShuffled) {
                return CompilationHandler.shuffle(tracks, this.shuffleSeed);
            }
            return tracks;
        },

        /** Returns all cues from all media tracks in the current compilation */
        allCues(): Array<ICue> {
            return CompilationHandler.getAllCues(this.tracks);
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
