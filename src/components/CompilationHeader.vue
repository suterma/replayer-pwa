<template>
    <!-- Level, also on mobile -->
    <nav class="level">
        <div class="level-left">
            <!-- Title and artist info is only used when set or in compilations with more than one track -->
            <!-- On small devices, only title is used -->
            <template
                v-if="
                    isEditable &&
                    (compilation.hasLabels() || compilation.Tracks.length > 1)
                "
            >
                <!-- Display in edit view, when there is a Title or more than one track -->
                <div
                    class="level-item is-narrow is-flex-shrink-2 is-justify-content-flex-start"
                >
                    <div class="field is-fullwidth">
                        <p class="control is-expanded">
                            <StyledInput
                                v-if="
                                    isEditable &&
                                    (compilation.Title ||
                                        compilation.Tracks.length > 1)
                                "
                                class="input title is-3"
                                :model-value="compilation.Title"
                                placeholder="Compilation title"
                                title="Compilation title"
                                @change="updateTitle($event.target.value)"
                            />
                        </p>
                    </div>
                </div>
                <CoveredPanel
                    v-if="compilation.Title"
                    :reveal-for="[compilation.Artist]"
                    title="Artist name for this compilation"
                >
                    <template #caption>
                        <span class="label">by</span>
                    </template>
                    <div
                        class="level-item is-narrow is-flex-shrink-2 is-justify-content-flex-start"
                    >
                        <div class="field is-fullwidth">
                            <p class="control is-expanded">
                                <LabeledInput label="by">
                                    <StyledInput
                                        class="input is-italic"
                                        :model-value="compilation.Artist"
                                        type="text"
                                        placeholder="Artist"
                                        title="Artist"
                                        data-cy="track-artist"
                                        focus-on-mounted
                                        @update:model-value="
                                            (value) => {
                                                updateArtist(value);
                                            }
                                        "
                                    >
                                    </StyledInput>
                                </LabeledInput>
                            </p>
                        </div>
                    </div>
                </CoveredPanel>
                <CoveredPanel
                    v-if="compilation.Title"
                    :reveal-for="[compilation.Album]"
                    title="Album name for this compilation"
                >
                    <template #caption><span class="label">on</span></template>
                    <div
                        class="level-item is-narrow is-flex-shrink-2 is-justify-content-flex-start"
                    >
                        <div class="field is-fullwidth">
                            <p class="control is-expanded">
                                <LabeledInput label="on">
                                    <StyledInput
                                        class="input is-italic"
                                        :model-value="compilation.Album"
                                        type="text"
                                        placeholder="Album"
                                        title="Album"
                                        data-cy="track-album"
                                        focus-on-mounted
                                        @update:model-value="
                                            (value) => {
                                                updateAlbum(value);
                                            }
                                        "
                                    >
                                    </StyledInput>
                                </LabeledInput>
                            </p>
                        </div>
                    </div>
                </CoveredPanel>
            </template>
            <template v-else>
                <!-- Display in non-edit view -->
                <div class="level-item is-justify-content-flex-start">
                    <span class="title is-3" data-cy="compilation-title">
                        <!-- Use a placeholder to still use the height when not actual title is displayed -->
                        <template v-if="compilation.Title">
                            {{ compilation.Title }}
                        </template>
                        <template v-else>&nbsp;</template>
                    </span>
                </div>
                <div class="level-item">
                    <p class="is-size-7">
                        <ArtistDisplay
                            class="has-cropped-text"
                            :album="compilation.Album"
                            :artist="compilation.Artist"
                        />
                    </p>
                </div>
            </template>
        </div>
        <!-- Context menu on the right side -->
        <div class="level-right">
            <div class="level-item is-narrow">
                <span class="is-pulled-right ml-3">
                    <CompilationContextMenu :compilation="compilation" />
                </span>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import ArtistDisplay from '@/components/displays/ArtistDisplay.vue';
import LabeledInput from '@/components/editor/LabeledInput.vue';
import CoveredPanel from '@/components/CoveredPanel.vue';
import StyledInput from '@/components/StyledInput.vue';
import CompilationContextMenu from '@/components/context-menu/CompilationContextMenu.vue';
import { useAppStore } from '@/store/app';
import type { ICompilation } from '@/store/ICompilation';

const app = useAppStore();

/**
 * A nav bar as header with a menu for a compilation
 */
const props = defineProps({
    compilation: {
        type: Object as PropType<ICompilation>,
        required: true,
    },
    /** Whether this component show editable inputs for the contained data
     * @devdoc Allows to reuse this component for more than one view mode.
     */
    isEditable: {
        type: Boolean,
        default: false,
    },
});

/** Updates the compilation title */
function updateTitle(title: string) {
    const artist = props.compilation.Artist;
    const album = props.compilation.Album;
    app.updateCompilationData(title, artist, album);
}

/** Updates the track artist */
function updateArtist(artist: string) {
    const title = props.compilation.Title;
    const album = props.compilation.Album;
    app.updateCompilationData(title, artist, album);
}
/** Updates the track album */
function updateAlbum(album: string) {
    const title = props.compilation.Title;
    const artist = props.compilation.Artist;
    app.updateCompilationData(title, artist, album);
}
</script>
<style lang="scss" scoped>
.is-fullwidth {
    width: 100%;
}
/** Custom modification for the level in the context of a compilation.
* @remarks Allow the title text (on the left) to break between words, 
* and keep the context items (on the right) as close as reasonably possible */
.level {
    .level-left {
        word-break: break-word;
        flex-basis: calc(100%);

        /* These items should grow, and shrink */
        .level-item {
            flex-shrink: 1;
            flex-grow: 1;
            text-align: left;
            /* Title, always justify left */
            justify-content: left;
        }
    }

    .level-right {
        min-width: 0;

        /* Keep the right hand items (menu) as small as possible */
        flex-basis: 0;

        /* These items should keep their size */
        .level-item {
            flex-shrink: 0;
            flex-grow: 0;
            text-align: right;
        }
    }
}
</style>
