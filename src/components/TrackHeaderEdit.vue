<template>
    <div v-bind:id="'track-' + track.Id">
        <!-- Level, also on mobile 
     @remarks The id is used to scroll to this item when it's becoming the active track-->
        <div class="level">
            <!-- Left side -->
            <div class="level-left">
                <!-- Title -->
                <div
                    class="level-item fill-available is-flex-grow-5 is-flex-shrink-1"
                >
                    <div class="field fill-available">
                        <p class="control">
                            <input
                                class="input"
                                v-model="trackData.Name"
                                @change="updateName($event.target.value)"
                                type="text"
                                placeholder="Track name"
                            />
                        </p>
                    </div>
                </div>
                <!-- by (keep as small as possible)-->
                <div
                    class="level-item is-flex-shrink-1 is-flex-grow-0 is-hidden-mobile"
                >
                    <p class="has-text-nowrap">
                        <span class="has-opacity-half">by</span>
                    </p>
                </div>
                <!-- Artist -->
                <div class="level-item is-flex-shrink-1">
                    <div class="field">
                        <p class="control">
                            <input
                                class="input is-italic"
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
                <div class="level-item">
                    <div class="field">
                        <p class="control">
                            <input
                                class="input is-italic"
                                v-model="trackData.Album"
                                @change="updateAlbum($event.target.value)"
                                type="text"
                                placeholder="Album"
                            />
                        </p>
                    </div>
                </div>
                <!-- URL -->
                <div class="level-item" :title="'URL: ' + trackData.Url">
                    <p class="control">
                        <span class="button is-indicator">
                            <span class="icon has-opacity-half">
                                <i class="mdi mdi-24px">
                                    <!-- World icon -->
                                    <svg
                                        style="width: 24px; height: 24px"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            d="M16.36,14C16.44,13.34 16.5,12.68 16.5,12C16.5,11.32 16.44,10.66 16.36,10H19.74C19.9,10.64 20,11.31 20,12C20,12.69 19.9,13.36 19.74,14M14.59,19.56C15.19,18.45 15.65,17.25 15.97,16H18.92C17.96,17.65 16.43,18.93 14.59,19.56M14.34,14H9.66C9.56,13.34 9.5,12.68 9.5,12C9.5,11.32 9.56,10.65 9.66,10H14.34C14.43,10.65 14.5,11.32 14.5,12C14.5,12.68 14.43,13.34 14.34,14M12,19.96C11.17,18.76 10.5,17.43 10.09,16H13.91C13.5,17.43 12.83,18.76 12,19.96M8,8H5.08C6.03,6.34 7.57,5.06 9.4,4.44C8.8,5.55 8.35,6.75 8,8M5.08,16H8C8.35,17.25 8.8,18.45 9.4,19.56C7.57,18.93 6.03,17.65 5.08,16M4.26,14C4.1,13.36 4,12.69 4,12C4,11.31 4.1,10.64 4.26,10H7.64C7.56,10.66 7.5,11.32 7.5,12C7.5,12.68 7.56,13.34 7.64,14M12,4.03C12.83,5.23 13.5,6.57 13.91,8H10.09C10.5,6.57 11.17,5.23 12,4.03M18.92,8H15.97C15.65,6.75 15.19,5.55 14.59,4.44C16.43,5.07 17.96,6.34 18.92,8M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z"
                                        />
                                    </svg>
                                </i>
                            </span>
                        </span>
                    </p>
                </div>
            </div>
            <!-- Right side -->
            <div class="level-right">
                <!-- Playback indicator -->
                <nav class="level-item">
                    <PlaybackIndicator
                        :is-ready="!this.isPlaying && this.isTrackLoaded"
                        :is-playing="this.isPlaying"
                        :is-unloaded="!this.isTrackLoaded"
                    />
                </nav>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track } from '@/store/compilation-types';
import PlaybackIndicator from '@/components/PlaybackIndicator.vue';
import { ActionTypes } from '@/store/action-types';

/** A header for editing track metadata
 */
//TODO later remove the editable parts from TrackHeader, once the TrackHeaderEdit is accepted as the edit control
export default defineComponent({
    name: 'TrackHeaderEdit',
    components: { PlaybackIndicator },
    props: {
        track: {
            type: Track,
            required: true,
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
        /* This basis is set empirically to fit for two elements on the right */
        flex-basis: calc(100% - 80px);

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
