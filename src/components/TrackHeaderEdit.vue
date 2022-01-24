<template>
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
        </div>
        <!-- Right side -->
        <div class="level-right">
            <!-- Playback indicator (using a small ghost button aligns the icon properly)-->
            <nav class="level-item">
                <button class="button is-small is-ghost ml-3 is-unselectable">
                    <span
                        :class="{
                            icon: true,
                            'has-text-success': this.isPlaying,
                            'has-text-grey-dark':
                                !this.isPlaying && this.isTrackLoaded,
                            'is-invisible': !this.isTrackLoaded,
                        }"
                    >
                        <i class="mdi mdi-24px">
                            <svg
                                style="width: 24px; height: 24px"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    fill="currentColor"
                                    d="M19,12C19,15.86 15.86,19 12,19C8.14,19 5,15.86 5,12C5,8.14 8.14,5 12,5C15.86,5 19,8.14 19,12Z"
                                />
                            </svg>
                        </i>
                    </span>
                </button>
            </nav>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track } from '@/store/compilation-types';
import { ActionTypes } from '@/store/action-types';

/** A header for editing track metadata
 */
//TODO later remove the editable parts from TrackHeader, once the TrackHeaderEdit is accepted as the edit control
export default defineComponent({
    name: 'TrackHeaderEdit',
    components: {},
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
