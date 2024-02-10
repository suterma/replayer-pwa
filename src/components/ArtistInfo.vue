<template>
    <div
        class="is-flex is-flex-direction-row is-flex-wrap-wrap is-justify-content-flex-start is-align-content-center has-cropped-text"
    >
        <span class="is-single-line">
            <template v-if="artist">
                <span class="has-opacity-half">by&nbsp;</span>
                <span class="is-italic">
                    <LinkableText :text="artist"></LinkableText>
                    &nbsp;</span
                >
            </template>
        </span>
        <span class="is-single-line">
            <template v-if="album">
                <span class="has-opacity-half">on&nbsp;</span>
                <span class="is-italic">
                    <LinkableText :text="album"></LinkableText>
                </span>
            </template>
        </span>
    </div>
</template>

<script setup lang="ts">
import LinkableText from './LinkableText.vue';

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
