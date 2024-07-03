<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div v-if="compilation" class="compilation" data-cy="compilation">
        <!-- Handle all relevant Replayer events for the compilation level -->
        <ReplayerEventHandler
            @tonextcue="app.toNextCue()"
            @topreviouscue="app.toPreviousCue()"
            @tomnemoniccue="app.toMnemonicCue(($event as CustomEvent).detail)"
        />

        <CompilationHeader
            id="compilation-header"
            :compilation="compilation"
            :is-editable="isTrackEditable"
        />

        <!-- Selectable tags -->
        <TagsSelector
            v-if="compilationHasTags"
            :all-tags="getAllTags"
            :selected-tags="selectedTags"
            @selected="selectTag"
            @deselected="deselectTag"
        ></TagsSelector>

        <div class="tracks">
            <template v-for="track in allTracks" :key="track.Id">
                <MediaTrack
                    v-if="CompilationHandler.isMediaTrack(track)"
                    :id="'track-' + track.Id"
                    class="block"
                    :track="track"
                    data-cy="track"
                    @previous-track="app.playPreviousTrack()"
                    @next-track="app.playNextTrack()"
                    @track-ended="continueAfterTrack(track.Id)"
                />
                <NoticeTrack
                    v-else-if="CompilationHandler.isTextTrack(track)"
                    :id="'track-' + track.Id"
                    class="block"
                    :track="track"
                    data-cy="notice-track"
                >
                </NoticeTrack>
                <PdfTrack
                    v-else-if="CompilationHandler.isPdfTrack(track)"
                    :id="'track-' + track.Id"
                    class="block"
                    :track="track"
                    data-cy="pdf-track"
                >
                </PdfTrack>
            </template>
        </div>
        <!-- Multi-track-Controller -->
        <Teleport to="#media-player-panel">
            <div
                v-if="isTrackMixable"
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
import TagsSelector from '@/components/editor/TagsSelector.vue';

/** Displays the contained set of tracks according to the required mode.
 * @remarks Also handles the common replayer events for compilations
 * @remarks Also supports shuffling of tracks
 */
defineProps({
    compilation: { type: Object as PropType<ICompilation>, required: true },
});

const app = useAppStore();
const {
    activeTrackId,
    hasSingleMediaTrack,
    allTracks,
    getAllTags,
    trackViewMode,
    isTrackEditable,
    isTrackMixable,
} = storeToRefs(app);

/** The wake lock fill-in that can prevent screen timeout */
const noSleep: NoSleep = new NoSleep();

const settings = useSettingsStore();
const { preventScreenTimeout } = storeToRefs(settings);

/** Handle scrolling to the changed active track.
 * @remarks This is intentionally only invoked on when the active track changes (and it's not the only audio track).
 * If a user scrolls to a certain cue within the same track, no scrolling should occur, to keep the UI calm.
 */
watch(
    () => activeTrackId.value,
    () => {
        const trackId = activeTrackId;

        if (trackId && !hasSingleMediaTrack.value) {
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
    () => trackViewMode.value,
    () => {
        const trackId = activeTrackId;

        if (trackId.value && !hasSingleMediaTrack.value) {
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

/** Handles the playback after a track has ended.
 */
function continueAfterTrack(trackId: string): void {
    console.debug('continueAfterTrack', trackId);
    if (isLoopingPlaybackMode) {
        app.playNextTrack();
    }
}

// --- Tag handling ---

const compilationHasTags = computed(() => {
    return getAllTags.value.size > 0;
});

const { selectedTags, isLoopingPlaybackMode } = storeToRefs(app);

function selectTag(tag: string) {
    console.debug('selectTag', tag);

    selectedTags.value.add(tag);
}
function deselectTag(tag: string) {
    console.debug('deselectTag', tag);

    selectedTags.value.delete(tag);
}
</script>
