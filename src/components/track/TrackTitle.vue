<template>
    <!-- Surrounding div to handle some elements together, e.g. in a bulma level -->
    <div>
        <!-- The title is the only header element that should shrink (break on words) if necessary -->
        <TrackTitleName
            class="title is-4 mr-2"
            :class="{
                'has-text-success': isActiveTrack,
                'is-5': small,
            }"
            :name="name"
        >
        </TrackTitleName>

        <!-- <span
            v-if="artist || album || meter"
            class="mr-2"
            v-tooltip.right="tooltipText"
            :title='tooltipText'
        >
            <i class="icon mdi">
                <svg viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        :d="mdiInformation"
                    />
                </svg>
            </i>
        </span> -->

        <span v-if="artist || album || meter" class="is-hidden-mobile">
            <ArtistDisplay
                class="mr-2 is-size-7"
                :artist="artist"
                :album="album"
            />
            <MeterDisplay class="mr-2 is-size-7" :meter="meter"></MeterDisplay>
        </span>

        <TagsDisplay
            v-if="hasTags && props.tags"
            class="ml-0 is-size-7"
            :tags="trackTags"
            small
            readonly
        ></TagsDisplay>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { computed, onUnmounted } from 'vue';
import TrackTitleName from '@/components/track/TrackTitleName.vue';
import MeterDisplay from '@/components/displays/MeterDisplay.vue';
import ArtistDisplay from '@/components/displays/ArtistDisplay.vue';
import TagsDisplay from '@/components/displays/TagsDisplay.vue';
import { useTrackStore } from '@/store/track/index';
import NavButton from '@/components/buttons/NavButton.vue';
import { mdiDotsVertical } from '@mdi/js';

import DropdownMenu from '@/components/dropdown-menu/DropdownMenu.vue';
import MenuItemContent from '@/components/dropdown-menu/MenuItemContent.vue';
import { mdiCog, mdiInformation } from '@mdi/js';
import type { IMediaHandler } from '@/code/media/IMediaHandler';
import { DefaultPitchShift, DefaultPlaybackRate } from '@/store/Track';
import SpeedKnob from '../controls/SpeedKnob.vue';
import DropdownMenuItem from '@/components/dropdown-menu/DropdownMenuItem.vue';
import test from 'node:test';

/** Displays a track's title, including name, meter, BPM and tags.
 * @remarks This component makes some layout decisions, but intentionally color decisions.
 */
const props = defineProps({
    /** The id of the track to handle
     */
    trackId: {
        type: String,
        required: true,
    },
    /** Whether to use a smaller font */
    small: {
        type: Boolean,
        required: false,
        default: false,
    },

    /** Whether to show the tags (if any) */
    tags: {
        type: Boolean,
        required: false,
        default: false,
    },
});

// --- tracking the associated ITrack

/** The dynamic track store for this component. */
const trackStore = useTrackStore(props.trackId);
const {
    isActiveTrack,
    meter,
    hasTags,
    name,
    tags: trackTags,
    artist,
    album,
} = storeToRefs(trackStore);

// const tooltipText = computed(() => {
//     const artistLabel = artist.value ? "by " + artist.value + " " : "";
//     const albumLabel = album.value ? "on " + album.value + " " : "";
//     const bpmLabel = meter.value?.BeatsPerMinute ? "BPM: " + meter.value?.BeatsPerMinute + " " : "";
//     const timeSignatureLabel =
//         (meter.value?.TimeSignature?.Numerator ? "   " + meter.value?.TimeSignature?.Numerator + "/" : "") +
//         (meter.value?.TimeSignature?.Denominator ? meter.value?.TimeSignature?.Denominator + " " : "");
//     return artistLabel + albumLabel + bpmLabel + timeSignatureLabel;
// });
</script>
