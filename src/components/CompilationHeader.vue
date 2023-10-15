<template>
    <!-- Level, also on mobile -->
    <nav class="level is-mobile">
        <div class="level-left">
            <!-- Title and artist info is only used when set or in compilations with more than one track -->
            <!-- On small devices, only title is used -->
            <template
                v-if="
                    isEditable &&
                    (compilation.hasLabels || compilation.Tracks.length > 1)
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
                                :modelValue="compilation.Title"
                                @change="updateTitle($event.target.value)"
                                placeholder="Compilation title"
                                title="Compilation title"
                            />
                        </p>
                    </div>
                </div>
                <CloakedPanel
                    :revealFor="[compilation.Artist, compilation.Album]"
                    title="Artist and Album for this compilation"
                >
                    <template #caption
                        ><span class="has-opacity-half"
                            >Artist / Album</span
                        ></template
                    >
                    <ArtistLevelEditor
                        :artist="compilation.Artist"
                        @update:artist="
                            (value) => {
                                updateArtist(value);
                            }
                        "
                        :album="compilation.Album"
                        @update:album="
                            (value) => {
                                updateAlbum(value);
                            }
                        "
                    ></ArtistLevelEditor>
                </CloakedPanel>
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
                        <ArtistInfo
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

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { Compilation } from '@/store/compilation-types';
import ArtistInfo from '@/components/ArtistInfo.vue';
import CloakedPanel from '@/components/CloakedPanel.vue';
import ArtistLevelEditor from '@/components/editor/ArtistLevelEditor.vue';
import StyledInput from '@/components/StyledInput.vue';
import CompilationContextMenu from '@/components/context-menu/CompilationContextMenu.vue';
import { mapActions } from 'pinia';
import { useAppStore } from '@/store/app';
import { mdiPlus } from '@mdi/js';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationHeader',
    components: {
        StyledInput,
        CompilationContextMenu,
        ArtistInfo,
        CloakedPanel,
        ArtistLevelEditor,
    },
    props: {
        compilation: {
            type: Object as PropType<Compilation>,
            required: true,
        },
        /** Whether this component show editable inputs for the contained data
         * @devdoc Allows to reuse this component for more than one view mode.
         */
        isEditable: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            mdiPlus: mdiPlus,
        };
    },
    methods: {
        ...mapActions(useAppStore, ['updateCompilationData']),

        /** Updates the compilation title */
        updateTitle(title: string) {
            const artist = this.compilation.Artist;
            const album = this.compilation.Album;
            this.updateCompilationData(title, artist, album);
        },

        /** Updates the track artist */
        updateArtist(artist: string) {
            const title = this.compilation.Title;
            const album = this.compilation.Album;
            this.updateCompilationData(title, artist, album);
        },
        /** Updates the track album */
        updateAlbum(album: string) {
            const title = this.compilation.Title;
            const artist = this.compilation.Artist;
            this.updateCompilationData(title, artist, album);
        },
    },
});
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
