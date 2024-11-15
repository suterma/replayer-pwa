<template>
    <span class="notranslate" :class="{ 'mr-3': artist || album }">
        <span v-if="artist" class="is-single-line">
            <span class="has-opacity-half">by&nbsp;</span>
            <span class="is-italic">
                <LinkableText :text="artist"></LinkableText>
                &nbsp;</span
            >
        </span>
        <span v-if="album" class="is-single-line">
            <span class="has-opacity-half">on&nbsp;</span>
            <span class="is-italic">
                <LinkableText :text="album"></LinkableText>
            </span>
        </span>
    </span>
</template>

<script setup lang="ts">
import LinkableText from '@/components/LinkableText.vue';

/** Displays a track's artist info, namely the artist's name and the album the track appears on.
 * @remarks This component makes some layout decisions, but intentionally no size or color decisions.
 * To actually constrain the width, use e.g. "style="max-width: 25vw" on the component.
 * See also https://css-tricks.com/snippets/css/a-guide-to-flexbox/
 */

defineProps({
    /** The artist's name to display */
    artist: {
        type: String,
        required: true,
    },
    /** The album's name to display */
    album: {
        type: String,
        required: true,
    },
});
</script>
