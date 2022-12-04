<template>
    <!-- @remarks The id is used to scroll to this item when it's becoming the active track -->
    <div v-bind:id="'track-' + track.Id">
        <!-- Level, also on mobile -->
        <div class="level">
            <!-- Left side -->
            <div class="level-left">
                <!-- Expander with title -->
                <!-- This should shrink (break on words) if necessary (is-narrow is-flex-shrink-1) -->
                <div
                    class="level-item is-narrow is-flex-shrink-2 is-justify-content-flex-start"
                >
                    <CollapsibleButton
                        :class="{
                            'is-nav': true,
                        }"
                        :modelValue="isExpanded"
                        @update:modelValue="toggleExpanded"
                        title="Track"
                        collapsedText="Expand to edit"
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
                <!-- by (keep as small as possible)-->
                <div
                    class="level-item is-flex-shrink-1 is-flex-grow-0 is-hidden-mobile"
                >
                    <p class="is-single-line">
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
                    <p class="is-single-line">
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
                <div class="level-item is-justify-content-flex-end">
                    <PlaybackIndicator
                        :is-ready="!isPlaying && isTrackLoaded"
                        :is-playing="isPlaying"
                        :is-unloaded="!isTrackLoaded"
                    />

                    <DropdownMenu title="Track context menu">
                        <DropdownMenuButton
                            :disabled="isFirstTrack"
                            title="Move up"
                            subTitle="(to an earlier position)"
                            @click="moveUp()"
                            iconName="transfer-up"
                        />
                        <DropdownMenuButton
                            :disabled="isLastTrack"
                            title="Move down"
                            subTitle="(to a later position)"
                            @click="moveDown()"
                            iconName="transfer-down"
                        />
                        <Experimental v-once>
                            <DropdownMenuButton
                                title="Share..."
                                subTitle="(allows to share a track)"
                                @click="share()"
                            />
                        </Experimental>

                        <DropdownMenuButton
                            v-once
                            title="Clone"
                            subTitle="(with cues and media)"
                            @click="cloneTrack()"
                            iconName="content-duplicate"
                        />
                        <DropdownMenuButton
                            v-once
                            title="Reassign cue shortcuts"
                            subTitle="(first as seed, then incrementing)"
                            @click="reassignCueShortcuts()"
                            iconName="order-numeric-ascending"
                        />
                        <hr class="dropdown-divider" />
                        <DropdownMenuButton
                            v-once
                            title="Remove"
                            subTitle="(remove
                            the track from the compilation)"
                            @click="removeTrack()"
                            iconName="trash"
                        />
                    </DropdownMenu>
                </div>
            </div>
        </div>
        <!-- Extra level for the media edit, except on very large screens -->
        <div class="level is-hidden-fullhd">
            <div class="level-left">
                <div class="level-item is-justify-content-flex-start">
                    <div class="field">
                        <p class="control">
                            <MediaEdit :track="track" />
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- <TrackSharingDialog v-if="this.isSharing"></TrackSharingDialog> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ITrack, Track } from '@/store/compilation-types';
import PlaybackIndicator from '@/components/PlaybackIndicator.vue';
// import MediaSourceIndicator from '@/components/MediaSourceIndicator.vue';
import MediaEdit from '@/components/MediaEdit.vue';
import EditableInput from '@/components/EditableInput.vue';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import { ActionTypes } from '@/store/action-types';
import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import DropdownMenuButton from '@/components/dropdown-menu/DropdownMenuButton.vue';
// import TrackSharingDialog from '@/components/TrackSharingDialog.vue';
import { confirm } from '@/code/ui/dialogs';
import { shareTrack } from '@/code/ui/dialogs';
import { MutationTypes } from '@/store/mutation-types';

/** A header for editing track metadata
 */
export default defineComponent({
    name: 'TrackHeaderEdit',
    components: {
        // MediaSourceIndicator,
        MediaEdit,
        PlaybackIndicator,
        EditableInput,
        CollapsibleButton,
        DropdownMenu,
        DropdownMenuButton,
        // TrackSharingDialog,
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
    methods: {
        share() {
            shareTrack(this.track).then((ok) => {
                if (ok) {
                    console.debug(`TrackHeader::sharing done`);
                }
            });
        },
        /** Toggles the expansion state
         */
        toggleExpanded() {
            const expanded = !this.isExpanded;
            console.debug(`TrackHeader::toggleExpanded:expanded:${expanded}`);
            this.$emit('update:isExpanded', expanded);
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

        /** Reassign shortcut
         * @remarks Uses the first shortcut mnemonic as seed, then incrementing the number
         */
        reassignCueShortcuts() {
            console.debug(
                `TrackHeader::reassignCueShortcuts:trackId:${this.track.Id}`,
            );

            this.$store.commit(
                MutationTypes.REASSIGN_CUE_SHORTCUTS,
                this.track.Id,
            );
        },
        /** Clones the track by creating a deep copy
         */
        cloneTrack() {
            this.$store.dispatch(ActionTypes.CLONE_TRACK, this.track.Id);
        },
        moveUp() {
            this.$store.commit(MutationTypes.MOVE_TRACK_UP, this.track.Id);
        },
        moveDown() {
            this.$store.commit(MutationTypes.MOVE_TRACK_DOWN, this.track.Id);
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
