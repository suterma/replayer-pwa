<template>
    <span v-if="name" class="has-text-weight-light" data-cy="track-name">
        <slot></slot>
        <LinkableText :text="name"></LinkableText>
    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import LinkableText from '@/components/LinkableText.vue';

/** Displays a track's name as a title.
 * @remarks This component makes some layout decisions, but intentionally no size or color decisions.
 */
export default defineComponent({
    name: 'TrackTitleName',
    components: {
        LinkableText,
    },
    props: {
        name: {
            type: String,
            required: true,
        },
    },
});
</script>
