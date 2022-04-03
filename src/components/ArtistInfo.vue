<template>
    <span v-if="track.Artist" class="is-single-line">
        <span class="has-opacity-half">by&nbsp;</span>
        <span class="is-italic">{{ track.Artist }}&nbsp;</span>
    </span>
    <span v-if="track.Album" class="is-single-line">
        <span class="has-opacity-half">on&nbsp;</span>
        <span class="is-italic">{{ track.Album }}</span>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track } from '@/store/compilation-types';

/** Displays a track's artist info, namely the artist's name and the album the track appears on.
 */
export default defineComponent({
    name: 'ArtistInfo',

    props: {
        track: {
            type: Track,
            required: true,
        },
    },
});
</script>
