<template>
    <span v-if="track.Name" class="has-text-weight-light is-single-line">
        <LinkableText :text="track.Name"></LinkableText>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track } from '@/store/compilation-types';
import LinkableText from './LinkableText.vue';

/** Displays a track's name as a title.
 * @remarks This component makes some layout decisions, but intentionally no size or color decisions.
 */
export default defineComponent({
    name: 'TrackTitleName',
    components: {
        LinkableText,
    },
    props: {
        track: {
            type: Track,
            required: true,
        },
    },
});
</script>
