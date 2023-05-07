<template>
    <CompilationLoader />

    <!-- Handle and translate the keyboard shortcuts into Replayer events -->
    <!-- In playback/mix view, do not require the CTRL modifier -->
    <!-- In edit view, the CTRL modifier helps disambiguate
         between other uses of the shortcut keys-->
    <CompilationKeyboardHandler :requireCtrlModifier="isEditMode" />

    <!-- Show a loading panel, similar to the edit view, but not in edit mode -->
    <Compilation
        v-if="hasCompilation"
        :compilation="compilation"
        :tracksDisplayMode="tracksDisplayMode"
    />

    <div v-else class="section pl-0 pr-0 block">
        <p class="has-text-centered">
            Replayer is a free, cue-based media player for rehearsals with
            playback music.
        </p>
    </div>
    <div
        class="section pt-6 pl-0 pr-0 block"
        v-if="isEditMode || !hasCompilation"
    >
        <DismissiblePanel
            @dismissed="collapseMediaDropZone"
            :dismissible="isMediaDropZoneExpanded"
        >
            <!-- Offer the demo only when no compilation/track is shown -->
            <MediaDropZone
                v-model:isExpanded="isMediaDropZoneExpanded"
                :offerDemo="!hasCompilation"
            />
        </DismissiblePanel>
    </div>
    <template v-if="isEditMode && hasAvailableMedia">
        <div class="has-text-centered block">
            <CollapsiblePanel>
                <template #caption>
                    <span>Available media</span>
                </template>

                <div class="block mt-5">
                    <MediaList></MediaList>
                </div>
            </CollapsiblePanel>
        </div>
    </template>
    <div class="section pl-0 pr-0 block" v-if="!hasCompilation">
        <div class="content box">
            <WelcomeText />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Compilation from '@/components/Compilation.vue';
import { TrackDisplayMode } from '@/store/compilation-types';
import MediaDropZone from '@/components/MediaDropZone.vue';
import WelcomeText from '@/components/WelcomeText.vue';
import CompilationLoader from '@/components/CompilationLoader.vue';
import CollapsiblePanel from '@/components/CollapsiblePanel.vue';
import DismissiblePanel from '@/components/DismissiblePanel.vue';
import MediaList from '@/components/MediaList.vue';
import CompilationKeyboardHandler from '@/components/CompilationKeyboardHandler.vue';
import { mapState } from 'pinia';
import { useAppStore } from '@/store/app';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Play',
    id: 'play-view',
    components: {
        Compilation,
        CompilationKeyboardHandler,
        MediaDropZone,
        CompilationLoader,
        WelcomeText,
        CollapsiblePanel,
        MediaList,
        DismissiblePanel,
    },
    data() {
        return {
            /** Whether the media drop zone is displayed in the expanded state */
            isMediaDropZoneExpanded: false,
        };
    },

    watch: {
        /** When the compilation loads or closes, update the media loader expansion accordingly
         * @remarks When there is already something loaded, only the unobtrusive icon should be shown
         */
        hasCompilation: {
            handler(newVal) {
                this.updateMediaDropZoneExpansion(!newVal);
            },
            immediate: true,
        },
    },
    methods: {
        collapseMediaDropZone(): void {
            this.isMediaDropZoneExpanded = !this.hasCompilation;
        },

        updateMediaDropZoneExpansion(expanded: boolean): void {
            this.isMediaDropZoneExpanded = expanded;
        },
    },
    computed: {
        ...mapState(useAppStore, [
            'compilation',
            'hasCompilation',
            'mediaUrls',
            'hasAvailableMedia',
        ]),

        /** Gets the track display mode */
        tracksDisplayMode(): TrackDisplayMode {
            if (this.$route.name === 'Edit') {
                return TrackDisplayMode.Edit;
            }
            if (this.$route.name === 'Mix') {
                return TrackDisplayMode.Mix;
            }
            return TrackDisplayMode.Play;
        },
        /** Whether the compilation is shown as editable */
        isEditMode(): boolean {
            return this.tracksDisplayMode === TrackDisplayMode.Edit;
        },
    },
});
</script>
