<template>
    <MediaDropZone />
    <hr />
    <MediaList v-if="hasMedia" />
    <hr />
    <Compilation :compilation="compilation" v-if="hasCompilation" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Compilation from '@/components/Compilation.vue';
import MediaList from '@/components/MediaList.vue';
import MediaDropZone from '@/components/MediaDropZone.vue';
import { ICompilation, ITrack } from '@/store/compilation-types';
import { MediaUrl } from '@/store/state-types';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Edit',
    components: {
        Compilation,
        MediaList,
        MediaDropZone,
    },
    computed: {
        compilation(): ICompilation {
            return this.$store.getters.compilation;
        },

        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },

        tracks(): Array<string> {
            return (this.$store.getters.compilation as ICompilation).Tracks.map(
                function (item: ITrack) {
                    return item.Name;
                },
            );
        },

        /** Indicats whether any media URLs are available
         */
        hasMediaUrls(): boolean {
            return this.mediaUrls.size > 0;
        },

        /** A dictionary of media URLs, representing playable media files
         * @remarks the media file path is used as key, preventing duplicate files for the same content.
         */
        mediaUrls(): Map<string, MediaUrl> {
            return this.$store.getters.mediaUrls as Map<string, MediaUrl>;
        },
    },
});
</script>
