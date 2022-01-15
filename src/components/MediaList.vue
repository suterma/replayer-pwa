<template>
    <p class="title is-3">Loaded media files/URLs</p>
    <div class="tags">
        <span
            class="tag is-info is-large"
            v-for="[fileName, mediaUrl] in mediaUrls"
            :key="fileName"
        >
            <span :title="mediaUrl.objectUrl">{{ fileName }}</span>
            <button class="delete"></button>
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MediaUrl } from '@/store/state-types';

/** Shows the available media URLs as a tag list
 * @remarks Also allows removal of the media URLs
 */
export default defineComponent({
    name: 'MediaList',
    components: {},
    props: {},
    methods: {},
    computed: {
        /** A dictionary of media URLs, representing playable media files
         * @remarks the media file path is used as key, preventing duplicate files for the same content.
         */
        mediaUrls(): Map<string, MediaUrl> {
            return this.$store.getters.mediaUrls as Map<string, MediaUrl>;
        },
    },
});
</script>
