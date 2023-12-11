<template>
    <div class="container is-fullhd">
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
            :trackViewode="trackViewode"
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
            <!-- Offer the demo only when no compilation/track is shown -->
            <MediaDropZone :offerDemo="!hasCompilation" />
        </div>
        <template v-if="isEditMode && hasAvailableMedia">
            <div class="has-text-centered block">
                <CollapsiblePanel>
                    <template #caption>
                        <span class="has-opacity-half">Available media</span>
                    </template>

                    <div class="block mt-5">
                        <MediaList></MediaList>
                    </div>
                </CollapsiblePanel>
            </div>
        </template>
        <div class="navbar is-fixed-bottom" v-if="!hasCompilation">
            <WelcomeText />
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Compilation from '@/components/Compilation.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import WelcomeText from '@/components/WelcomeText.vue';
import CompilationLoader from '@/components/CompilationLoader.vue';
import CollapsiblePanel from '@/components/CollapsiblePanel.vue';
import MediaList from '@/components/MediaList.vue';
import CompilationKeyboardHandler from '@/components/CompilationKeyboardHandler.vue';
import { mapState } from 'pinia';
import { useAppStore } from '@/store/app';
import { TrackViewMode } from '@/store/TrackViewMode';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Playback',
    components: {
        Compilation,
        CompilationKeyboardHandler,
        MediaDropZone,
        CompilationLoader,
        WelcomeText,
        CollapsiblePanel,
        MediaList,
    },
    data() {
        return {};
    },

    watch: {},
    methods: {},
    computed: {
        ...mapState(useAppStore, [
            'compilation',
            'hasCompilation',
            'mediaUrls',
            'hasAvailableMedia',
        ]),

        /** Gets the track display mode */
        trackViewode(): TrackViewMode {
            if (this.$route.name === 'Edit') {
                return TrackViewMode.Edit;
            }
            if (this.$route.name === 'Mix') {
                return TrackViewMode.Mix;
            }
            return TrackViewMode.Play;
        },
        /** Whether the compilation is shown as editable */
        isEditMode(): boolean {
            return this.trackViewode === TrackViewMode.Edit;
        },
    },
});
</script>
import { TrackViewMode } from '@/store/TrackViewMode';
