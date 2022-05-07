<template>
    <!-- Level, also on mobile 
     The id is used to scroll to this item when it's becoming the active track-->
    <nav
        :class="{
            level: true,
            'is-mobile': true,
            'is-clickable': isCollapsible,
        }"
        v-bind:id="'track-' + track.Id"
        @click="
            if (isCollapsible) {
                toggleExpanded();
            }
        "
    >
        <!-- //TODO Consolidate normal and edt controls into one -->
        <!-- Left side -->
        <div class="level-left">
            <!-- Back Link -->
            <div v-if="!isCollapsible && !isLinkOnly" class="level-item">
                <router-link
                    :to="{
                        name: 'List',
                    }"
                    :title="`Back to track track list`"
                >
                    <p class="control">
                        <span class="button is-nav">
                            <Icon name="chevron-left" />
                        </span>
                    </p>
                </router-link>
            </div>
            <!-- Title -->
            <div class="level-item">
                <p class="subtitle is-4">
                    <LinkableText :text="track.Name"></LinkableText>
                </p>
            </div>
            <!-- Artist info (don't show on small devices)-->
            <div class="level-item is-hidden-mobile">
                <p class="is-size-7">
                    <ArtistInfo :track="track" />
                </p>
            </div>
        </div>
        <!-- Right side -->
        <div class="level-right">
            <!-- Playback indicator -->
            <nav class="level-item">
                <PlaybackIndicator
                    :is-ready="!isPlaying && isTrackLoaded"
                    :is-playing="isPlaying"
                    :is-unloaded="!isTrackLoaded"
                />
            </nav>
            <!-- Expander -->
            <div v-if="isCollapsible" class="level-item">
                <CollapsibleButton
                    :modelValue="modelValue"
                    title="Track"
                    collapsedText="Expand to play"
                    class="is-nav"
                />
            </div>
            <!-- Forward navigation -->
            <div v-if="isLinkOnly" class="level-item">
                <router-link
                    :to="{
                        name: 'Track-Player',
                        params: { id: track.Id },
                    }"
                    :title="`Show track '${track.Name}'`"
                >
                    <p class="control">
                        <span class="button is-nav">
                            <Icon name="chevron-right" />
                        </span>
                    </p>
                </router-link>
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track } from '@/store/compilation-types';
import PlaybackIndicator from '@/components/PlaybackIndicator.vue';
import CollapsibleButton from '@/components/CollapsibleButton.vue';
import ArtistInfo from '@/components/ArtistInfo.vue';
import { ActionTypes } from '@/store/action-types';
import Icon from '@/components/icons/Icon.vue';
import LinkableText from './LinkableText.vue';

/** Displays a track header with a title.
 * @remarks Also handles the common replayer events for tracks
 */
//TODO later remove the editable parts, once the TrackHeaderEdit is accepted as the edit control
export default defineComponent({
    name: 'TrackHeader',
    components: {
        CollapsibleButton,
        PlaybackIndicator,
        Icon,
        ArtistInfo,
        LinkableText,
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
        /** Whether this component shows a link to a track detail only, instead of the collapse/expand function.
         * @remarks Using this is mutually exclusive with the collapsible variant.
         * @devdoc Allows to reuse this component for more than one DisplayMode.
         */
        isLinkOnly: {
            type: Boolean,
            default: false,
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
