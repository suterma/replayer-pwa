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

<script setup lang="ts">
/** Shows the available media URLs as a tag list
 * @remarks Also allows removal of the media URLs
 */
import { MediaUrl } from '@/store/types';
import MediaSourceIndicator from '@/components/indicators/MediaSourceIndicator.vue';
import { mdiTrashCanOutline } from '@mdi/js';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { useAppStore } from '@/store/app';
import { storeToRefs } from 'pinia';

const app = useAppStore();

const { mediaUrls } = storeToRefs(app);

function addTrack(mediaUrl: MediaUrl): void {
    console.debug('MediaList::addTrack:source', mediaUrl);
    const source = mediaUrl.resourceName;
    app.addDefaultTrack(source);
}

function discard(mediaUrl: MediaUrl): void {
    console.debug('MediaList::discard:source', mediaUrl);
    app.discardMediaUrl(mediaUrl);
}
</script>
