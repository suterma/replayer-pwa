<template>
    <div
        class="field has-addons is-justify-content-center"
        v-for="[fileName, mediaUrl] in mediaUrls"
        :key="fileName"
    >
        <p class="control">
            <button
                class="button"
                :title="'Add track for ' + mediaUrl.url"
                @click="addTrack(mediaUrl)"
            >
                <!-- <BaseIcon v-once :path="mdiMusicNotePlus" /> -->
                <span>Use</span>
                <MediaSourceIndicator :mediaUrl="mediaUrl">
                </MediaSourceIndicator>
            </button>
        </p>
        <p class="control">
            <button
                class="button"
                title="Discard this media source"
                @click="discard(mediaUrl)"
            >
                <BaseIcon v-once :path="mdiTrashCanOutline" />
            </button>
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { MediaUrl } from '@/store/state-types';
import MediaSourceIndicator from '@/components/MediaSourceIndicator.vue';
import { mdiMusicNotePlus, mdiTrashCanOutline } from '@mdi/js';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { MutationTypes } from '@/store/mutation-types';

/** Shows the available media URLs as a tag list
 * @remarks Also allows removal of the media URLs
 */
export default defineComponent({
    name: 'MediaList',
    components: { MediaSourceIndicator, BaseIcon },
    data() {
        return {
            /** Icons from @mdi/js */

            mdiMusicNotePlus: mdiMusicNotePlus,
            mdiTrashCanOutline: mdiTrashCanOutline,
        };
    },
    methods: {
        addTrack(mediaUrl: MediaUrl): void {
            const source = mediaUrl.source;
            this.$store.commit(MutationTypes.ADD_DEFAULT_TRACK, source);
        },
        discard(mediaUrl: MediaUrl): void {
            console.debug('MediaList::discard:source', mediaUrl);
            this.$store.commit(MutationTypes.DISCARD_MEDIA_URL, mediaUrl);
        },
    },
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
<style lang="scss">
/** For this list, make the media source indicator shrink with an ellipsis, from the left */
.media-source.is-indicator {
    max-width: calc(100vw - 192px);
    overflow: hidden;
    display: inline-block;
    text-overflow: ellipsis;
    direction: rtl;
}

/** from $tablet */
@media screen and (min-width: 769px) {
    .media-source.is-indicator {
        max-width: calc(100vw - 260px);
    }
}

/** from $desktop */
@media screen and (min-width: 1024px) {
    .media-source.is-indicator {
        max-width: calc(100vw - 310px);
    }
}
</style>
