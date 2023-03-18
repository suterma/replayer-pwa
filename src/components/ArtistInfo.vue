<template>
    <span class="is-single-line">
        <template v-if="artist">
            <span class="has-opacity-half">by&nbsp;</span>
            <span class="is-italic">
                <LinkableText :text="artist"></LinkableText>
                &nbsp;</span
            >
        </template>
        <template v-if="album">
            <span class="has-opacity-half">on&nbsp;</span>
            <span class="is-italic">
                <LinkableText :text="album"></LinkableText>
            </span>
        </template>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LinkableText from './LinkableText.vue';

/** Displays a track's artist info, namely the artist's name and the album the track appears on.
 * @remarks This component makes some layout decisions, but intentionally no size or color decisions.
 */
export default defineComponent({
    name: 'ArtistInfo',
    components: {
        LinkableText,
    },
    props: {
        artist: {
            type: String,
            required: true,
        },
        album: {
            type: String,
            required: true,
        },
    },
});
</script>
