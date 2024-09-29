<template>
    <div>
        <!-- The title is the only header element that should shrink (break on words) if necessary -->
        <TrackTitleName
            class="title is-4"
            :class="{
                'has-text-success': isActive,
                'is-5': small,
            }"
            :name="track.Name"
        ></TrackTitleName>
        <ArtistDisplay
            class="ml-2 is-size-7"
            :artist="track.Artist"
            :album="track.Album"
        />
        <MeterDisplay
            class="ml-2 is-size-7"
            :meter="track.Meter"
        ></MeterDisplay>

        <TagsDisplay
            class="ml-0 is-size-7"
            v-if="trackHasTags"
            :tags="props.track.Tags"
            small
            readonly
        ></TagsDisplay>
    </div>
</template>

<script setup lang="ts">
import { computed, type PropType } from 'vue';
import type { ITrack } from '@/store/ITrack';
import TrackTitleName from '@/components/track/TrackTitleName.vue';
import MeterDisplay from '@/components/displays/MeterDisplay.vue';
import ArtistDisplay from '@/components/displays/ArtistDisplay.vue';
import TagsDisplay from '@/components/displays/TagsDisplay.vue';

/** Displays a track's title, including name, meter, BPM and tags.
 * @remarks This component makes some layout decisions, but intentionally color decisions.
 */
const props = defineProps({
    track: {
        type: Object as PropType<ITrack>,
        required: true,
    },

    /** Whether this track is to be shown as the active track */
    isActive: {
        type: Boolean,
        required: false,
        default: false,
    },

    /** Whether to use a smaller font */
    small: {
        type: Boolean,
        required: false,
        default: false,
    },
});

// --- Tag handling ---

const trackHasTags = computed(() => {
    return props.track.Tags.size > 0;
});
</script>
