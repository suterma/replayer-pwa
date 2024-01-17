<template>
    <div
        v-for="[fileName, mediaUrl] in mediaUrls"
        :key="fileName"
        class="field has-addons is-justify-content-center"
    >
        <p class="control">
            <button
                class="button"
                :title="'Add track for ' + mediaUrl.url"
                @click="addTrack(mediaUrl)"
            >
                <!-- <BaseIcon v-once :path="mdiMusicNotePlus" /> -->
                <span>Use</span>
                <MediaSourceIndicator
                    :media-url="mediaUrl"
                    :source="fileName"
                    show-size
                    show-type
                >
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
import { MediaUrl } from '@/store/types';
import MediaSourceIndicator from '@/components/MediaSourceIndicator.vue';
import { mdiMusicNotePlus, mdiTrashCanOutline } from '@mdi/js';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mapActions } from 'pinia';
import { useAppStore } from '@/store/app';
import { mapState } from 'pinia';

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
    computed: {
        ...mapState(useAppStore, ['mediaUrls']),
    },
    methods: {
        ...mapActions(useAppStore, ['addDefaultTrack', 'discardMediaUrl']),

        addTrack(mediaUrl: MediaUrl): void {
            console.debug('MediaList::addTrack:source', mediaUrl);
            const source = mediaUrl.resourceName;
            this.addDefaultTrack(source);
        },
        discard(mediaUrl: MediaUrl): void {
            console.debug('MediaList::discard:source', mediaUrl);
            this.discardMediaUrl(mediaUrl);
        },
    },
});
</script>
