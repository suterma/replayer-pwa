<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div class="compilation" data-cy="compilation">
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
                    :track-id="track.Id"
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
                    :track-id="track.Id"
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
/** Displays the contained set of tracks according to the required mode.
 * @remarks Also handles the common replayer events for compilations
 * @remarks Also supports shuffling of tracks
 */
import { onMounted, onUnmounted } from 'vue';
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
import TagsSelector from '@/components/editor/TagsSelector.vue';
import useLog from '@/composables/LogComposable';
import { useMessageStore } from '@/store/messages';
const { log } = useLog();

const app = useAppStore();
const { allTracks, getAllTags, isTrackEditable, isTrackMixable, compilation } =
    storeToRefs(app);

/** The wake lock fill-in that can prevent screen timeout */
const noSleep: NoSleep = new NoSleep();

const settings = useSettingsStore();
const { preventScreenTimeout } = storeToRefs(settings);

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
                log.warn(
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

/** Handles the playback after a track has ended.
 */
function continueAfterTrack(trackId: string): void {
    log.debug('continueAfterTrack', trackId);
    if (isLoopingPlaybackMode.value) {
        app.playNextTrack();
    }
}

// --- Tag handling with busy display during tag selection ---
const message = useMessageStore();

const { selectedTags, isLoopingPlaybackMode, compilationHasTags } =
    storeToRefs(app);

function selectTag(tag: string) {
    log.debug('selectTag', tag);
    message.asBusy(() => {
        selectedTags.value.add(tag);
    });
}
function deselectTag(tag: string) {
    log.debug('deselectTag', tag);

    message.asBusy(() => {
        selectedTags.value.delete(tag);
    });
}
</script>
