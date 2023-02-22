<template>
    <!-- Level, also on mobile 
    NOTE: The 100% width is necessary to keep the level's right items fully a the end of the available space. -->
    <div
        style="width: 100%"
        :class="{
            level: true,
            'is-mobile': true,
        }"
    >
        <!-- Left side -->
        <div class="level-left">
            <!-- Slot for additional level items -->
            <slot name="left-start"></slot>

            <!-- Title -->
            <!-- The title is the only header element that should shrink (break on words) if necessary -->
            <div class="level-item is-narrow is-flex-shrink-1">
                <p class="title is-4" :class="{ 'has-text-success': isActive }">
                    <TrackTitleName :track="track"></TrackTitleName>
                </p>
            </div>

            <!-- Artist info (don't show on small devices, keep at end to keep the appearance calm)-->
            <div class="level-item is-hidden-mobile is-justify-content-end">
                <p class="is-size-7">
                    <ArtistInfo :track="track" />
                </p>
            </div>
            <!-- Slot for additional level items -->
            <slot name="left-end"></slot>
        </div>
        <!-- Right side -->
        <div class="level-right">
            <!-- Playback indicator -->
            <nav class="level-item">
                <PlaybackIndicator
                    :is-ready="!isPlaying && isTrackLoaded"
                    :is-playing="isPlaying"
                    :is-unloaded="!isTrackLoaded"
                    :is-unavailable="!isTrackMediaAvailable"
                    data-cy="playback-indicator"
                />
            </nav>
            <!-- Slot for additional level items -->
            <slot name="right"></slot>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track } from '@/store/compilation-types';
import PlaybackIndicator from '@/components/PlaybackIndicator.vue';
import ArtistInfo from '@/components/ArtistInfo.vue';
import { ActionTypes } from '@/store/action-types';
import TrackTitleName from './TrackTitleName.vue';

/** Displays a track header with a title.
 * @remarks Also handles the common replayer events for tracks
 */
export default defineComponent({
    name: 'TrackHeader',
    components: {
        PlaybackIndicator,
        TrackTitleName,
        ArtistInfo,
    },
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

        /** Whether the media source is available
         * @remarks For a file: whether the resource is in the media store
         * @remarks For an URL: //TODO implement
         */
        isTrackMediaAvailable: {
            type: Boolean,
            default: false,
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

/** Custom modification for the level in the context of a track.
* @remarks Allow the title text (on the left) to break between words. */
.level {
    .level-left {
        word-break: break-word;
        /* This basis is set empirically to fit for one element
        (equalling 40px) on the right */
        flex-basis: calc(100% - 40px);
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
