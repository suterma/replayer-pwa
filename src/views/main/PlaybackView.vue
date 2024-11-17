<!--
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
-->
<template>
    <div>
        <CompilationLoader />

        <!-- Handle and translate the keyboard shortcuts into Replayer events -->
        <!-- In playback/mix view, do not require the CTRL modifier -->
        <!-- In edit view, the CTRL modifier helps disambiguate
         between other uses of the shortcut keys-->
        <CompilationKeyboardHandler :require-ctrl-modifier="isTrackEditable" />

        <!-- If available, show the compilation -->
        <Compilation v-if="hasCompilation" />

        <!-- Otherwise, show the claim -->
        <div
            v-else
            class="section pl-0 pr-0 block"
        >
            <p class="has-text-centered">
                Replayer is a free, cue-based media player for rehearsals with
                playback music.
            </p>
        </div>

        <!--During edit or when nothing yet loaded, offer the drop zone -->
        <div
            v-if="isTrackEditable || !hasCompilation"
            class="section pt-6 pl-0 pr-0 block"
        >
            <MediaDropZone />
        </div>

        <!--During edit, with available media, offer the media list -->
        <div
            v-if="isTrackEditable && hasAnyAvailableMedia"
            class="has-text-centered block"
        >
            <CollapsiblePanel>
                <template #caption>
                    <span class="has-opacity-half">Available media files</span>
                </template>

                <div class="block mt-5">
                    <MediaList></MediaList>
                </div>
            </CollapsiblePanel>
        </div>
        <!-- The application footer (not for printout) -->
        <footer
            v-if="!hasCompilation"
            class="footer navbar is-fixed-bottom is-hidden-print"
        >
            <small>
                <p class="has-text-centered">
                    <FooterLinks />
                </p>
            </small>
        </footer>
    </div>
</template>

<script
    setup
    lang="ts"
>
/** A view for playing an existing compilation */

import Compilation from '@/components/Compilation.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import FooterLinks from '@/components/FooterLinks.vue';
import CompilationLoader from '@/components/CompilationLoader.vue';
import CollapsiblePanel from '@/components/CollapsiblePanel.vue';
import MediaList from '@/components/MediaList.vue';
import CompilationKeyboardHandler from '@/components/CompilationKeyboardHandler.vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/store/app';
import { watch } from 'vue';

const app = useAppStore();
const { isTrackEditable, hasCompilation, hasAnyAvailableMedia } =
    storeToRefs(app);

// --- document title (for the compilation)

/** For an unloaded compilation, the title is reverted to the default
 */
watch(
    [hasCompilation],
    ([hasCompilation]) => {
        if (!hasCompilation) {
            // use the default title
            document.title =
                'Replayer is a free, cue-based media player for rehearsals with playback music.';
        }
    },
    { immediate: true },
);
</script>
