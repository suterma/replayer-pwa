<template>
    <!-- Level, also on mobile -->
    <div class="level is-mobile">
        <!-- Left side -->
        <div class="level-left">
            <!-- Expander with title -->
            <!-- This should shrink (break on words) if necessary (is-narrow is-flex-shrink-1) -->
            <div
                class="level-item is-narrow is-flex-shrink-2 is-justify-content-flex-start"
            >
                <CollapsibleButton
                    v-if="canCollapse"
                    :class="{
                        'is-nav': true,
                    }"
                    :modelValue="isExpanded"
                    @update:modelValue="toggleExpanded"
                    title="Track"
                    collapsedText="Click to expand / edit cues"
                    expandedText="Click to collapse"
                />

                <div class="field">
                    <p class="control">
                        <EditableInput
                            class="title has-text-weight-light is-4"
                            :class="{ 'has-text-success': isActive }"
                            v-model="trackData.Name"
                            @change="updateName($event.target.value)"
                            type="text"
                            placeholder="Track name"
                        />
                    </p>
                </div>
            </div>
            <!-- Only for wide screens, edit the media edit in the level -->
            <div
                class="level-item is-narrow is-flex-shrink-2 is-hidden-widescreen-only is-hidden-desktop-only is-hidden-touch is-justify-content-flex-start"
            >
                <div class="field">
                    <p class="control">
                        <MediaEdit :track="track" />
                    </p>
                </div>
            </div>
            <!-- Artist Info (completely hidden on mobile, thus not editable there. 
                NOTE: It's also not shown in the play view on mobile anyways) -->
            <!-- Artist -->
            <div class="level-item is-flex-shrink-1 is-hidden-mobile">
                <div class="field">
                    <p class="control">
                        <EditableInput
                            class="is-italic"
                            v-model="trackData.Artist"
                            @change="updateArtist($event.target.value)"
                            type="text"
                            placeholder="Artist"
                        >
                            <span class="has-opacity-half mr-2 is-single-line"
                                >by</span
                            ></EditableInput
                        >
                    </p>
                </div>
            </div>

            <!-- Album -->
            <div class="level-item is-flex-shrink-1 is-hidden-mobile">
                <div class="field">
                    <p class="control">
                        <EditableInput
                            class="is-italic"
                            v-model="trackData.Album"
                            @change="updateAlbum($event.target.value)"
                            type="text"
                            placeholder="Album"
                        >
                            <span class="has-opacity-half mr-2 is-single-line"
                                >on</span
                            ></EditableInput
                        >
                    </p>
                </div>
            </div>
        </div>

        <!-- Right side -->
        <div class="level-right">
            <div class="level-item is-justify-content-flex-end">
                <PlaybackIndicator
                    :is-ready="!isPlaying && isTrackLoaded"
                    :is-playing="isPlaying"
                    :is-unloaded="!isTrackLoaded"
                />

                <TrackContextMenu
                    :isFirstTrack="isFirstTrack"
                    :isLastTrack="isLastTrack"
                    :track="track"
                ></TrackContextMenu>
            </div>
        </div>
    </div>
    <!-- Extra level for the media edit, except on very large screens -->
    <div class="is-hidden-fullhd">
        <MediaEdit :track="track" />
    </div>
    <!-- <TrackSharingDialog v-if="this.isSharing"></TrackSharingDialog> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ITrack, Track } from '@/store/compilation-types';
import PlaybackIndicator from '@/components/PlaybackIndicator.vue';
import MediaEdit from '@/components/MediaEdit.vue';
import EditableInput from '@/components/EditableInput.vue';
import TrackContextMenu from '@/components/context-menu/TrackContextMenu.vue';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import { ActionTypes } from '@/store/action-types';

/** A header for editing track metadata
 */
export default defineComponent({
    name: 'TrackHeaderEdit',
    components: {
        MediaEdit,
        PlaybackIndicator,
        EditableInput,
        CollapsibleButton,
        TrackContextMenu,
    },
    emits: ['update:isExpanded'],
    props: {
        track: {
            type: Track,
            required: true,
        },
        /** Whether this track is to be considered as the active track */
        isActive: {
            type: Boolean,
            required: false,
            default: false,
        },
        /** Whether this track is expanded */
        isExpanded: {
            type: Boolean,
            default: false,
        },

        /** Whether this track can collapse
         * @remarks If set to false, this prevents collapsing
         * and also hides the collapsing toggler completely
         * This is useful for single-track compilations where
         * collapsing is not useful
         */
        canCollapse: {
            type: Boolean,
            default: true,
        },

        /** Flag to indicate whether the player is currently playing
         */
        isPlaying: {
            type: Boolean,
            default: false,
        },

        /** Flag to indicate whether the player has it's track loaded.
         */
        isTrackLoaded: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            trackData: { ...this.track }, // clone the object
            /** Flag to indicate whether the track is currently shared via the dialog.
             */
            isSharing: false,
        };
    },
    /** Make sure for non-collapsible headers, they are reported initially as expanded once   */
    beforeMount() {
        if (!this.canCollapse) {
            this.$emit('update:isExpanded', true);
        }
    },
    methods: {
        /** Toggles the expansion state
         */
        toggleExpanded() {
            if (this.canCollapse) {
                const expanded = !this.isExpanded;
                console.debug(
                    `TrackHeader::toggleExpanded:expanded:${expanded}`,
                );
                this.$emit('update:isExpanded', expanded);
            }
        },

        /** Updates the track name */
        updateName(name: string) {
            const trackId = this.track.Id;
            const artist = this.trackData.Artist;
            const album = this.trackData.Album;
            this.$store.dispatch(ActionTypes.UPDATE_TRACK_DATA, {
                trackId,
                name,
                artist,
                album,
            });
        },
        /** Updates the track artist */
        updateArtist(artist: string) {
            const trackId = this.track.Id;
            const name = this.trackData.Name;
            const album = this.trackData.Album;
            this.$store.dispatch(ActionTypes.UPDATE_TRACK_DATA, {
                trackId,
                name,
                artist,
                album,
            });
        },
        /** Updates the track album */
        updateAlbum(album: string) {
            const trackId = this.track.Id;
            const name = this.trackData.Name;
            const artist = this.trackData.Artist;
            this.$store.dispatch(ActionTypes.UPDATE_TRACK_DATA, {
                trackId,
                name,
                artist,
                album,
            });
        },
    },
    watch: {
        /** Updates the expanded state according to the active state. */
        isActive: {
            handler(isActive: boolean) {
                if (isActive) this.$emit('update:isExpanded', isActive);
            },
            immediate: true,
        },
    },
    computed: {
        isFirstTrack(): boolean {
            return this.tracks[0]?.Id === this.track.Id;
        },
        isLastTrack(): boolean {
            return this.tracks[this.tracks.length - 1]?.Id === this.track.Id;
        },
        tracks(): ITrack[] {
            return this.$store.getters.compilation.Tracks as ITrack[];
        },
    },
});
</script>
<style lang="scss" scoped>
/* Use smaller margins within a track, to keep the UI condensed */
.level {
    /** similar margin to player with respect to cue buttons */
    margin-bottom: 12px;

    margin-top: 12px;
}

/** Custom modification for the level in the context of a track.
* @remarks Allow the title text (on the left) to break between words, 
* and keep the context items (on the right) as close as reasonably possible */
.level {
    .level-left {
        word-break: break-word;
        /* This basis is set empirically to fit for the elements on the right */
        flex-basis: calc(100% - 80px);
    }

    .level-right {
        min-width: 0;

        /* Keep the right hand items (play indicator, expander) as small as possible */
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
