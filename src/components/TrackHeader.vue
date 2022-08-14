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
        <!-- Left side -->
        <div class="level-left">
            <!-- Slot for additional level items -->
            <slot name="left-start"></slot>
            <!-- Expander -->
            <div v-if="isCollapsible" class="level-item is-narrow">
                <CollapsibleButton
                    :modelValue="modelValue"
                    title="Track"
                    collapsedText="Expand to play"
                    class="is-nav"
                />
            </div>
            <!-- Title -->
            <!-- The title is the only header element that should shrink (break on words) if necessary -->
            <div class="level-item is-narrow is-flex-shrink-1">
                <p class="title has-text-weight-light is-4">
                    <LinkableText :text="track.Name"></LinkableText>
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
                />
            </nav>
            <!-- Slot for additional level items -->

            <slot name="right"></slot>
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
import LinkableText from './LinkableText.vue';

/** Displays a track header with a title.
 * @remarks Also handles the common replayer events for tracks
 */
export default defineComponent({
    name: 'TrackHeader',
    components: {
        CollapsibleButton,
        PlaybackIndicator,
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
        /** Toggles the expansion state
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
