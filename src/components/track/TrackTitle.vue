<template>
    <div>
        <!-- The title is the only header element that should shrink (break on words) if necessary -->
        <TrackTitleName
            class="title is-4"
            :class="{
                'has-text-success': isActiveTrack,
                'is-5': small,
            }"
            :name="name"
        ></TrackTitleName>
        <ArtistDisplay class="ml-2 is-size-7" :artist="artist" :album="album" />
        <MeterDisplay class="ml-2 is-size-7" :meter="meter"></MeterDisplay>

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
import { onUnmounted } from 'vue';
import TrackTitleName from '@/components/track/TrackTitleName.vue';
import MeterDisplay from '@/components/displays/MeterDisplay.vue';
import ArtistDisplay from '@/components/displays/ArtistDisplay.vue';
import TagsDisplay from '@/components/displays/TagsDisplay.vue';
import { createTrackStore } from '@/store/track/index';

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

/** The dynamic track store for this component.
 * @remarks Code inside the setup script runs once per component instance,
 * thus the track store must be destroyed after component unload.
 */
const trackStore = createTrackStore(props.trackId);
const {
    isActiveTrack,
    meter,
    hasTags,
    name,
    tags: trackTags,
    artist,
    album,
} = storeToRefs(trackStore);

onUnmounted(() => {
    trackStore.$dispose();
});
</script>
