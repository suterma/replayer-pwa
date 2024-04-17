<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div v-if="compilation" class="compilation" data-cy="compilation">
        <!-- Handle all relevant Replayer events for the compilation level -->
        <ReplayerEventHandler
            @tonextcue="toNextCue"
            @topreviouscue="toPreviousCue"
            @tomnemoniccue="toMnemonicCue($event)"
        />

        <CompilationHeader
            id="compilation-header"
            :compilation="compilation"
            :is-editable="trackViewMode === TrackViewMode.Edit"
        />

        <div class="tracks">
            <template v-for="(track, index) in allTracks" :key="track.Id">
                <MediaTrack
                    v-if="CompilationHandler.isMediaTrack(track)"
                    :id="'track-' + track.Id"
                    :ref="'track-' + track.Id"
                    class="block"
                    :track="track"
                    :playback-mode="playbackMode as PlaybackMode"
                    :is-fading-enabled="isFadingEnabled"
                    :is-pre-roll-enabled="isPreRollEnabled"
                    :is-only-media-track="hasSingleMediaTrack"
                    :is-first="index === 0"
                    :is-last="index === (tracks?.length ?? 0) - 1"
                    @update:playback-mode="updatePlaybackMode($event)"
                    @update:is-fading-enabled="updatedIsFadingEnabled($event)"
                    @update:is-pre-roll-enabled="
                        updatedIsPreRollEnabled($event)
                    "
                    @previous-track="
                        toPreviousTrack(track.Id, isLoopingPlaybackMode)
                    "
                    @next-track="toNextTrack(track.Id, isLoopingPlaybackMode)"
                    @track-ended="continueAfterTrack(track.Id)"
                />
                <NoticeTrack
                    v-else-if="CompilationHandler.isTextTrack(track)"
                    :id="'track-' + track.Id"
                    class="block"
                    :track="track"
                >
                </NoticeTrack>
                <PdfTrack
                    v-else-if="CompilationHandler.isPdfTrack(track)"
                    :id="'track-' + track.Id"
                    class="block"
                    :track="track"
                >
                </PdfTrack>
            </template>
        </div>
        <!-- Multi-track-Controller -->
        <Teleport to="#media-player-panel">
            <div
                v-if="trackViewMode === TrackViewMode.Mix"
                class="section has-background-grey-dark pb-0"
            >
                <MasterTrack></MasterTrack>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import {
    type PropType,
    computed,
    watch,
    nextTick,
    inject,
    onMounted,
    onUnmounted,
} from 'vue';
import VueScrollTo from 'vue-scrollto';
import MediaTrack from '@/components/track/MediaTrack.vue';
import MasterTrack from '@/components/track/MasterTrack.vue';
import ReplayerEventHandler from '@/components/ReplayerEventHandler.vue';
import NoticeTrack from '@/components/track/NoticeTrack.vue';
import PdfTrack from '@/components/track/PdfTrack.vue';
import CompilationHeader from '@/components/CompilationHeader.vue';
import CompilationHandler from '@/store/compilation-handler';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/store/app';
import NoSleep from 'nosleep.js';
import { useSettingsStore } from '@/store/settings';
import type { ICompilation } from '@/store/ICompilation';
import { PlaybackMode } from '@/store/PlaybackMode';
import type { ITrack } from '@/store/ITrack';
import { trackViewModeInjectionKey } from '@/components/track/TrackInjectionKeys';
import { TrackViewMode } from '@/store/TrackViewMode';

/** Displays the contained set of tracks according to the required mode.
 * @remarks Also handles the common replayer events for compilations
 * @remarks Also supports shuffling of tracks
 */
const props = defineProps({
    compilation: { type: Object as PropType<ICompilation>, required: true },
});

const trackViewMode = inject(trackViewModeInjectionKey);

/** The wake lock fill-in that can prevent screen timeout */
const noSleep: NoSleep = new NoSleep();

/** A seed for the deterministic shuffling (until next shuffling is requested)
 * @remarks Reshuffling occurs when the PlaybackMode is toggled to ShuffleCompilation.
 * @devdoc This allows to keep the shuffled order.
 */
let shuffleSeed: number = 1;

const app = useAppStore();

const {
    activeTrackId,
    hasSingleMediaTrack,
    mediaTracks,
    allTracks,
    playbackMode,
    isFadingEnabled,
    isPreRollEnabled,
} = storeToRefs(app);

const settings = useSettingsStore();
const { preventScreenTimeout } = storeToRefs(settings);

/** Whether the tracks are currently in a shuffled order.
 */
const isTracksShuffled = computed(
    () => playbackMode.value === PlaybackMode.ShuffleCompilation,
);

/** The currently available media tracks in the compilation
 * @remarks The order may also be shuffled, depending on the PlaybackMode
 */
const tracks = computed(() => {
    const tracks = mediaTracks.value as Array<ITrack> | undefined;
    //Deterministically shuffle if required
    if (tracks && isTracksShuffled.value) {
        return CompilationHandler.shuffle(tracks, shuffleSeed);
    }
    return tracks;
});

/** Whether this compilation has any tracks.
 */
const hasTracks = computed(() => {
    if (mediaTracks.value && mediaTracks.value.length > 0) {
        return true;
    }
    return false;
});

/** Whether the PlaybackMode is looping the tracks
 * in the compilation.
 * @remarks These are PlaybackMode.ShuffleCompilation
 * and PlaybackMode.ShuffleCompilation
 */
const isLoopingPlaybackMode = computed(() => {
    return (
        playbackMode.value === PlaybackMode.ShuffleCompilation ||
        playbackMode.value === PlaybackMode.LoopCompilation
    );
});

/** Handle scrolling to the changed active track.
 * @remarks This is intentionally only invoked on when the active track changes (and it's not the only audio track).
 * If a user scrolls to a certain cue within the same track, no scrolling should occur, to keep the UI calm.
 */
watch(
    () => activeTrackId,
    (trackId) => {
        if (trackId && !hasSingleMediaTrack) {
            console.debug('scrolling to activated track ', trackId.value);
            nextTick(() => {
                scrollToTrack(trackId.value);
            });
        }
    },
    { immediate: true /* to handle it at least once after mount time */ },
);

/** Handle scrolling to the active track, when the display mode changes.
 * @remarks This is intentionally only invoked on when the display mode changes (and it's not the only track).
 */
watch(
    () => trackViewMode,
    () => {
        const trackId = activeTrackId;

        if (trackId.value && !hasSingleMediaTrack) {
            console.debug('scrolling to mode-changed track ', trackId.value);
            nextTick(() => {
                if (trackId != null) {
                    scrollToTrack(trackId.value);
                }
            });
        }
    },
    { immediate: true /* to handle it at least once after mount time */ },
);

/** Updates the shuffle seed if required by a playback mode change.
 */
watch(
    () => isTracksShuffled,
    (isShuffled) => {
        if (isShuffled) {
            shuffleSeed = ++shuffleSeed;
            console.debug('Compilation::playbackMode:shuffleSeed', shuffleSeed);
        }
    },
    { immediate: true /* to handle it at least once after mount time */ },
);

/**
 * @remarks Implements #26 in a simple way, as soon as a compilation is shown (disregarding the actual selection of a track)
 */

onMounted(() => {
    activateWakeLock();
});

onUnmounted(() => {
    deactivateWakeLock();
});

/** Activates the wake lock (if enabled in settings)
 * @remarks Implements https://github.com/suterma/replayer-pwa/issues/26
 * @devdoc Uses a wake-lock fill in, because this feature is not yet available on all browsers
 */
function activateWakeLock(): void {
    if (preventScreenTimeout) {
        if (!noSleep.isEnabled) {
            noSleep.enable().catch((error) => {
                console.warn(
                    `Swallowed error for failed WakeLock promise: ${error.name}, ${error.message}`,
                );
            });
        }
    }
}
/** Deactivates the wake lock
 * @devdoc Uses a wake-lock fill in, because this feature is not yet available on all browsers
 */
function deactivateWakeLock(): void {
    if (noSleep.isEnabled) {
        noSleep.disable();
    }
}

/** Visually scrolls to the given track, making it visually at the top of
 * the view.
 */
function scrollToTrack(trackId: string) {
    if (trackId) {
        const trackElement = document.getElementById('track-' + trackId);

        VueScrollTo.scrollTo(trackElement, {
            /** Always scroll, make it on top of the view */
            force: true,
            /** empirical value (taking into account the non-existing fixed top navbar) */
            offset: -22,
            /** Avoid interference with the key press overlay */
            cancelable: false,
        });
    }
}

function updatePlaybackMode(mode: PlaybackMode): void {
    //omit the modes that affect more than one track
    if (hasSingleMediaTrack.value) {
        if (
            mode === PlaybackMode.LoopCompilation ||
            mode === PlaybackMode.ShuffleCompilation
        ) {
            mode = PlaybackMode.PlayTrack;
        }
    }

    playbackMode.value = mode;
}

/** Handle fading enabled updated
 */
function updatedIsFadingEnabled(enabled: boolean): void {
    isFadingEnabled.value = enabled;
}

/** Handle pre-roll enabled updated
 */
function updatedIsPreRollEnabled(enabled: boolean): void {
    isPreRollEnabled.value = enabled;
}

/** Moves playback to the previous track
 * @param trackId - The Id of the track to use the previous of
 * @param loop - When true, and the previous track is not defined, the last track is used.
 */
function toPreviousTrack(trackId: string, loop = false): void {
    //TODO maybe use a method with the media handers in the audio store to skip to the next track

    if (tracks.value) {
        const prevTrackId = CompilationHandler.getPreviousTrackById(
            tracks.value,
            trackId,
            loop,
        )?.Id;
        if (prevTrackId) {
            //getTrackInstance(prevTrackId).skipToPlayPause();
        }
    }
}

/** Moves playback to the next track
 * @remarks Optionally supports looping back to the beginning, if the end was reached.
 * @param trackId - The Id of the track to use the next of
 * @param loop - When true, and the next track is not defined, the first track is used.
 */
function toNextTrack(trackId: string, loop = false): void {
    //TODO maybe use a method with the media handers in the audio store to skip to the next track
    console.debug('toNextTrack', trackId);
    if (tracks.value) {
        const nextTrackId = CompilationHandler.getNextTrackById(
            tracks.value,
            trackId,
            loop,
        )?.Id;
        if (nextTrackId) {
            //getTrackInstance(nextTrackId).skipToPlayPause();
        }
    }
}

/** Handles the playback mode after a track has ended. Implement the compilation loop and shuffle modes.
 */
function continueAfterTrack(trackId: string): void {
    console.debug('continueAfterTrack', trackId);
    if (hasTracks.value) {
        if (
            playbackMode.value === PlaybackMode.LoopCompilation ||
            playbackMode.value === PlaybackMode.ShuffleCompilation
        ) {
            toNextTrack(trackId, true);
        }
    }
}

/** Gets a reference to the track component instance.
 * @devdoc $ref's are non-reactive, see https://v3.vuejs.org/api/special-attributes.html#ref
 * Thus, referencing an instance after it has been removed from the DOM (e.g. by v-if)
 * does not work, even after it's rendered again later.
 */
// function getTrackInstance(trackId: string): InstanceType<typeof MediaTrack> {
//     const trackRef = 'track-' + trackId;
//     const track = ($refs[trackRef] as never)[0] as InstanceType<
//         typeof MediaTrack
//     >;
//     return track;
// };

/** Selects the previous cue, if any. Otherwise, loop to the last cue */
function toPreviousCue() {
    // console.debug('Compilation::toPreviousCue');
    // const allCueIds = this.allCues.map((cue) => cue.Id);
    // const indexOfSelected = allCueIds.indexOf(this.selectedCueId);
    // if (indexOfSelected > 0) {
    //     const prevCueId = allCueIds[indexOfSelected - 1];
    //     if (prevCueId) {
    //         this.updateSelectedCueId(prevCueId);
    //     }
    // } else {
    //     //loop to last
    //     const lastCueId = allCueIds.at(-1);
    //     if (lastCueId) {
    //         this.updateSelectedCueId(lastCueId);
    //     }
    // }
}

/** Selects the next cue, if any. Otherwise, loop to the first cue */
function toNextCue() {
    // console.debug('Compilation::toNextCue');
    // const allCueIds = this.allCues.map((cue) => cue.Id);
    // //TODO maybe just use the scheduled cue here, if available?
    // const indexOfSelected = allCueIds.indexOf(this.selectedCueId);
    // if (indexOfSelected < allCueIds.length - 1) {
    //     const nextCueId = allCueIds[indexOfSelected + 1];
    //     if (nextCueId) {
    //         this.updateSelectedCueId(nextCueId);
    //     }
    // } else {
    //     //loop to first
    //     const firstCueId = allCueIds.at(0);
    //     if (firstCueId) {
    //         this.updateSelectedCueId(firstCueId);
    //     }
    // }
}

function toMnemonicCue(event: Event) {
    // console.debug('Compilation::toMnemonicCue');
    // const allCues = this.allCues;
    // const matchingCue = allCues.find(
    //     (cue) => cue.Shortcut == (event as CustomEvent).detail,
    // );
    // if (matchingCue) {
    //     this.updateSelectedCueId(matchingCue.Id);
    // }
}
</script>
