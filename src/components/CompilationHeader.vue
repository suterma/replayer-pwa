<template>
    <!-- Level, also on mobile -->
    <nav class="level is-mobile">
        <div class="level-left">
            <!-- Title and artist info is only used when set or in compilations with more than one track -->
            <!-- On small devices, only title is used -->
            <template
                v-if="isEditable && (title || compilation.Tracks.length > 1)"
            >
                <div
                    class="level-item is-narrow is-flex-shrink-2 is-justify-content-flex-start"
                >
                    <div class="field is-fullwidth">
                        <p class="control is-expanded">
                            <StyledInput
                                v-if="
                                    isEditable &&
                                    (title || compilation.Tracks.length > 1)
                                "
                                class="input title is-3"
                                v-model="title"
                                @change="updateTitle($event.target.value)"
                                placeholder="Compilation title"
                                title="Compilation title"
                            />
                        </p>
                    </div>
                </div>
                <!-- Artist Info (completely hidden on mobile, thus not editable there. 
                NOTE: It's also not shown in the play view on mobile anyways) -->
                <!-- Artist -->
                <div class="level-item is-flex-shrink-1 is-hidden-mobile">
                    <div class="field">
                        <p class="control">
                            <StyledInput
                                class="input is-italic"
                                v-model="artist"
                                @change="updateArtist($event.target.value)"
                                type="text"
                                placeholder="Artist"
                                title="Artist"
                                data-cy="compilation-artist"
                            >
                                <span
                                    class="has-opacity-half mr-2 is-single-line"
                                    >by</span
                                ></StyledInput
                            >
                        </p>
                    </div>
                </div>

                <!-- Album -->
                <div class="level-item is-flex-shrink-1 is-hidden-mobile">
                    <div class="field">
                        <p class="control">
                            <StyledInput
                                class="input is-italic"
                                v-model="album"
                                @change="updateAlbum($event.target.value)"
                                type="text"
                                placeholder="Album"
                                title="Album"
                                data-cy="compilation-album"
                            >
                                <span
                                    class="has-opacity-half mr-2 is-single-line"
                                    >on</span
                                ></StyledInput
                            >
                        </p>
                    </div>
                </div>
            </template>
            <template
                v-else-if="
                    !isEditable && (title || compilation.Tracks.length > 1)
                "
            >
                <div class="level-item is-justify-content-flex-start">
                    <span class="title is-3" data-cy="compilation-title">
                        {{ title }}
                    </span>
                </div>
                <div class="level-item is-hidden-mobile">
                    <p class="is-size-7">
                        <ArtistInfo :album="album" :artist="artist" />
                    </p>
                </div>
            </template>
            <template v-else>
                <div
                    class="level-item is-hidden-mobile is-justify-content-flex-start"
                >
                    <span class="title is-3">
                        <!-- placeholder -->&nbsp; PLACEHOLDER</span
                    >
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
import { defineComponent } from 'vue';
import { ActionTypes } from '@/store/action-types';
import { Compilation, ICompilation } from '@/store/compilation-types';
import ArtistInfo from '@/components/ArtistInfo.vue';
import StyledInput from '@/components/StyledInput.vue';
import CompilationContextMenu from '@/components/context-menu/CompilationContextMenu.vue';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationHeader',
    components: { StyledInput, CompilationContextMenu, ArtistInfo },
    props: {
        compilation: {
            type: Compilation,
            required: true,
        },
        /** Whether this component show editable inputs for the contained data
         * @devdoc Allows to reuse this component for more than one DisplayMode.
         */
        isEditable: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            /** The compilation title */
            title: this.compilation.Title,
            artist: this.compilation.Artist,
            album: this.compilation.Album,
        };
    },
    methods: {
        /** Updates the compilation title */
        updateTitle(title: string) {
            const artist = this.artist;
            const album = this.album;
            this.$store.dispatch(ActionTypes.UPDATE_COMPILATION_DATA, {
                title,
                artist,
                album,
            });
        },

        /** Updates the track artist */
        updateArtist(artist: string) {
            const title = this.title;
            const album = this.album;
            this.$store.dispatch(ActionTypes.UPDATE_COMPILATION_DATA, {
                title,
                artist,
                album,
            });
        },
        /** Updates the track album */
        updateAlbum(album: string) {
            const title = this.title;
            const artist = this.artist;
            this.$store.dispatch(ActionTypes.UPDATE_COMPILATION_DATA, {
                title,
                artist,
                album,
            });
        },
    },

    watch: {
        compilation(compilation: ICompilation) {
            this.title = compilation.Title;
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
