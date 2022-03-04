<template>
    <div v-bind:id="'track-' + track.Id">
        <!-- Level, also on mobile 
     @remarks The id is used to scroll to this item when it's becoming the active track-->
        <div class="level is-mobile">
            <!-- Left side -->
            <div class="level-left">
                <!-- Title -->
                <div class="level-item is-flex-grow-5 is-flex-shrink-1">
                    <div class="field fill-available">
                        <p class="control">
                            <EditableInput
                                v-model="trackData.Name"
                                @change="updateName($event.target.value)"
                                type="text"
                                placeholder="Track name"
                            />
                        </p>
                    </div>
                </div>

                <!-- Artist Info (completely hidden on mobile, thus not editable there. 
                NOTE: It's also not shown in the play view on mobile anyways) -->

                <!-- by (keep as small as possible)-->
                <div
                    class="level-item is-flex-shrink-1 is-flex-grow-0 is-hidden-mobile"
                >
                    <p class="has-text-nowrap">
                        <span class="has-opacity-half">by</span>
                    </p>
                </div>
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
                            />
                        </p>
                    </div>
                </div>
                <!-- on (keep as small as possible)-->
                <div
                    class="level-item is-flex-shrink-1 is-flex-grow-0 is-hidden-mobile"
                >
                    <p class="has-text-nowrap">
                        <span class="has-opacity-half">on</span>
                    </p>
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
                            />
                        </p>
                    </div>
                </div>
            </div>

            <!-- Right side -->
            <div class="level-right">
                <nav class="level-item">
                    <!-- URL -->

                    <p class="control" :title="'URL: ' + trackData.Url">
                        <span class="button is-indicator">
                            <Icon name="world" class="has-opacity-half" />
                        </span>
                    </p>

                    <PlaybackIndicator
                        :is-ready="!this.isPlaying && this.isTrackLoaded"
                        :is-playing="this.isPlaying"
                        :is-unloaded="!this.isTrackLoaded"
                    />
                </nav>
                <div class="level-item">
                    <span class="is-pulled-right">
                        <DropdownMenu title="Track context menu">
                            <DropdownMenuItem
                                title="Remove"
                                subTitle="(remove
                            the track from the compilation)"
                                @click="removeTrack()"
                            />
                        </DropdownMenu>
                    </span>
                </div>
                <!-- Expander -->
                <div class="level-item">
                    <CollapsibleButton
                        :modelValue="this.modelValue"
                        title="Track"
                        collapsedText="Click to edit"
                        @click="toggleExpanded()"
                    />
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track } from '@/store/compilation-types';
import PlaybackIndicator from '@/components/PlaybackIndicator.vue';
import EditableInput from '@/components/EditableInput.vue';
import CollapsibleButton from '@/components/CollapsibleButton.vue';
import { ActionTypes } from '@/store/action-types';
import Icon from '@/components/icons/Icon.vue';
import DropdownMenu from '@/components/DropdownMenu.vue';
import DropdownMenuItem from '@/components/DropdownMenuItem.vue';
import { confirm } from '@/code/ui/dialogs';

/** A header for editing track metadata
 */
//TODO later remove the editable parts from TrackHeader, once the TrackHeaderEdit is accepted as the edit control
export default defineComponent({
    name: 'TrackHeaderEdit',
    components: {
        PlaybackIndicator,
        Icon,
        EditableInput,
        CollapsibleButton,
        DropdownMenu,
        DropdownMenuItem,
    },
    emits: ['update:modelValue'],

    props: {
        track: {
            type: Track,
            required: true,
        },
        /** Whether this track is expanded */
        modelValue: {
            type: Boolean,
            default: false,
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

        /** Flag to indicate whether the current track is the active track
         */
        isActiveTrack: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            currentSeconds: 0,
            trackData: { ...this.track }, // clone the object
        };
    },
    methods: {
        /** Toogles the expansion state
         */
        toggleExpanded() {
            const expanded = !this.modelValue;
            console.debug(`TrackHeader::toggleExpanded:expanded:${expanded}`);
            this.$emit('update:modelValue', expanded);
        },

        /** Removes the track from the compilation
         */
        removeTrack() {
            confirm(
                'Removing track',
                `Do you want to remove track "${this.track.Name}"?`,
            ).then((ok) => {
                if (ok) {
                    this.$store.dispatch(
                        ActionTypes.REMOVE_TRACK,
                        this.track.Id,
                    );
                }
            });
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
    watch: {},
    computed: {},
});
</script>
<style lang="scss" scoped>
/* Use smaller margins within a track, to keep the UI condensed */
.level {
    /** similar margin to player with respect to cue buttons */
    margin-bottom: 12px;

    margin-top: 12px;
}

//TODO fix these modification to better suit the edit layout

/** Custom modification for the level in the context of a track.
* @remarks Allow the title text (on the left) to break between words, 
* and keep the context items (on the right) as close as reasonably possible */
.level {
    .level-left {
        word-break: break-word;
        /* This basis is set empirically to fit for the elements on the right */
        flex-basis: calc(100% - 190px);

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
