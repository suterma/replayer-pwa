<template>
    <div
        v-for="[fileName, mediaUrl] in mediaUrls"
        :key="fileName"
        class="block"
        data-cy="track-media-source"
    >
        <div data-v-4ab84a4d="" class="level">
            <div class="level-item">
                <div class="field">
                    <p class="control">
                        <button
                            class="button pl-0"
                            :class="{
                                'has-text-warning': trackUsage(fileName) == 0,
                            }"
                            disabled
                            title="Track usage of this media file"
                        >
                            <MediaSourceIndicator
                                class="is-hidden-mobile"
                                :media-url="mediaUrl"
                                :source="fileName"
                                show-size
                                show-type
                            >
                            </MediaSourceIndicator>
                            <span class="is-hidden-tablet">{{ fileName }}</span>
                            <span>
                                &nbsp; is used in
                                {{ trackUsage(fileName) }} track(s).
                            </span>
                        </button>
                    </p>
                </div>
            </div>
            <div class="level-item is-flex-shrink-1">
                <div class="field has-addons">
                    <p class="control">
                        <button
                            class="button"
                            title="Discard this media source"
                            @click="discard(mediaUrl)"
                        >
                            <BaseIcon v-once :path="mdiTrashCanOutline" />
                        </button>
                    </p>

                    <p class="control">
                        <input
                            :value="fileName"
                            class="input"
                            readonly
                            size="120"
                            data-cy="available-filename"
                        />
                    </p>
                    <div class="control">
                        <button
                            class="button is-primary as-after-addon"
                            data-cy="use-source"
                            :title="'Add track for ' + mediaUrl.url"
                            @click="addTrack(mediaUrl)"
                        >
                            <BaseIcon v-once :path="mdiMusicNotePlus" />
                            <span>Use file</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/** Shows the available media files as a tag list
 * @remarks Also allows removal of the media files
 */
import { MediaUrl } from '@/store/types';
import MediaSourceIndicator from '@/components/indicators/MediaSourceIndicator.vue';
import { mdiTrashCanOutline, mdiMusicNotePlus } from '@mdi/js';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { useAppStore } from '@/store/app';
import { storeToRefs } from 'pinia';
import { confirm } from '@/code/ui/dialogs';

const app = useAppStore();

const { mediaUrls } = storeToRefs(app);

function addTrack(mediaUrl: MediaUrl): void {
    const source = mediaUrl.resourceName;
    app.addDefaultTrack(source);
}

function discard(mediaUrl: MediaUrl): void {
    confirm(
        'Removing media',
        `Do you want to remove media file "${mediaUrl.resourceName}"?`,
    ).then((ok) => {
        if (ok) {
            app.discardMediaUrl(mediaUrl);
        }
    });
}

function trackUsage(fileName: string): number {
    const usingTracks = app.compilation.Tracks.filter((e) => e.Url == fileName);
    return usingTracks.length;
}
</script>
