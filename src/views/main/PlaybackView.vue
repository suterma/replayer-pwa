<template>
    <div class="container is-fullhd">
        <CompilationLoader />

        <!-- Handle and translate the keyboard shortcuts into Replayer events -->
        <!-- In playback/mix view, do not require the CTRL modifier -->
        <!-- In edit view, the CTRL modifier helps disambiguate
         between other uses of the shortcut keys-->
        <CompilationKeyboardHandler :require-ctrl-modifier="isEditMode" />

        <!-- Show a loading panel, similar to the edit view, but not in edit mode -->
        <Compilation
            v-if="hasCompilation"
            :compilation="compilation"
            :track-viewode="trackViewode"
        />

        <div v-else class="section pl-0 pr-0 block">
            <p class="has-text-centered">
                Replayer is a free, cue-based media player for rehearsals with
                playback music.
            </p>
        </div>
        <div
            v-if="isEditMode || !hasCompilation"
            class="section pt-6 pl-0 pr-0 block"
        >
            <!-- Offer the demo only when no compilation/track is shown -->
            <MediaDropZone :offer-demo="!hasCompilation" />
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
        <!-- The application footer (not for printout) -->
        <footer
            v-if="!hasCompilation"
            class="footer navbar is-fixed-bottom is-hidden-print"
        >
            <small>
                <div class="content has-text-centered">
                    <p>
                        <FooterLinks />
                    </p>
                </div>
            </small>
        </footer>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Compilation from '@/components/Compilation.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import FooterLinks from '@/components/FooterLinks.vue';
import CompilationLoader from '@/components/CompilationLoader.vue';
import CollapsiblePanel from '@/components/CollapsiblePanel.vue';
import MediaList from '@/components/MediaList.vue';
import CompilationKeyboardHandler from '@/components/CompilationKeyboardHandler.vue';
import { mapState } from 'pinia';
import { useAppStore } from '@/store/app';
import { TrackViewMode } from '@/store/TrackViewMode';
import { Route } from '@/router';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'PlaybackView',
    components: {
        Compilation,
        CompilationKeyboardHandler,
        MediaDropZone,
        CompilationLoader,
        FooterLinks,
        CollapsiblePanel,
        MediaList,
    },

    computed: {
        ...mapState(useAppStore, [
            'compilation',
            'hasCompilation',
            'mediaUrls',
            'hasAvailableMedia',
        ]),

        /** Gets the track display mode */
        trackViewode(): TrackViewMode {
            if (this.$route.name === Route.Edit) {
                return TrackViewMode.Edit;
            }
            if (this.$route.name === Route.Mix) {
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
