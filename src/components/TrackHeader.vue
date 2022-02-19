<template>
    <!-- Level, also on mobile 
     The id is used to scroll to this item when it's becoming the active track-->
    <nav
        :class="{
            level: true,
            'is-mobile': true,
            'is-clickable': this.isCollapsible,
        }"
        v-bind:id="'track-' + track.Id"
        @click="
            if (this.isCollapsible) {
                toggleExpanded();
            }
        "
    >
        <!-- Left side -->
        <div class="level-left">
            <!-- Title -->
            <div class="level-item">
                <input
                    v-if="this.isEditable"
                    class="input subtitle is-4"
                    v-model="trackData.Name"
                    @change="updateName($event.target.value)"
                    @click="$event.stopPropagation()"
                    type="text"
                    placeholder="Track name"
                />
                <p v-else class="subtitle is-4">{{ track.Name }}</p>
            </div>
            <!-- Artist info (don't show on small devices)-->
            <div class="level-item is-hidden-mobile">
                <p class="is-size-7">
                    <span
                        v-if="track.Artist || this.isEditable"
                        class="has-text-nowrap"
                    >
                        <span class="has-opacity-half">by&nbsp;</span>
                        <input
                            v-if="this.isEditable"
                            class="input is-italic"
                            v-model="trackData.Artist"
                            @change="updateArtist($event.target.value)"
                            @click="$event.stopPropagation()"
                            type="text"
                            placeholder="Artist"
                        />
                        <span v-else class="is-italic"
                            >{{ track.Artist }}&nbsp;</span
                        >
                    </span>
                    <span
                        v-if="track.Album || this.isEditable"
                        class="has-text-nowrap"
                    >
                        <span class="has-opacity-half">on&nbsp;</span>
                        <input
                            v-if="this.isEditable"
                            class="input is-italic"
                            v-model="trackData.Album"
                            @change="updateAlbum($event.target.value)"
                            @click="$event.stopPropagation()"
                            type="text"
                            placeholder="Album"
                        />
                        <span v-else class="is-italic">{{ track.Album }}</span>
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
            <!-- Expander -->
            <div v-if="this.isCollapsible" class="level-item">
                <CollapsibleButton :modelValue="this.modelValue" />
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track } from '@/store/compilation-types';
import PlaybackIndicator from '@/components/PlaybackIndicator.vue';
import CollapsibleButton from '@/components/CollapsibleButton.vue';
import { ActionTypes } from '@/store/action-types';

/** Displays a track header with a title.
 * @remarks Also handles the common replayer events for tracks
 */
//TODO later remove the editable parts, once the TrackHeaderEdit is accepted as the edit control
export default defineComponent({
    name: 'TrackHeader',
    components: {
        CollapsibleButton,
        PlaybackIndicator,
    },
    props: {
        track: {
            type: Track,
            required: true,
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

        /** Flag to indicate whether the current track is the active track
         */
        isActiveTrack: {
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
        /** Whether this component shows supports expand/collapse (using a button)
         * If set to false, the component is always shown in the expanded state, without the toggling button.
         * @devdoc Allows to reuse this component for more than one display mode.
         */
        isCollapsible: {
            type: Boolean,
            default: true,
            required: false,
        },
    },
    emits: ['update:modelValue'],
    data() {
        return {
            currentSeconds: 0,
            trackData: { ...this.track }, // clone the object
        };
    },
    methods: {
        /** Toogles the expansion state
         * @devdoc To prevent toggling with the input fields, use "$event.stopPropagation()" on the respective input controls
         */
        toggleExpanded() {
            const expanded = !this.modelValue;
            console.debug(`TrackHeader::toggleExpanded:expanded:${expanded}`);
            this.$emit('update:modelValue', expanded);
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
