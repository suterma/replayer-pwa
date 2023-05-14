<template>
    <NavButton
        v-if="closed"
        :title="'Click to open ' + track.Name"
        :iconPath="mdiTextBoxOutline"
        @click="closed = !closed"
    >
    </NavButton>

    <div
        v-else
        class="track is-together-print"
        :class="{}"
        data-cy="notice-track"
    >
        <div class="columns is-multiline">
            <div class="column is-full">
                <div class="notification is-size-7">
                    <CloseButton class="top-right" v-model="closed">
                    </CloseButton>
                    {{ textContent }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
/** A track variant that displays text, fetched from an URL, and offers to close the display */

import { computed, defineProps, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import CloseButton from '@/components/buttons/CloseButton.vue';
import NavButton from '@/components/buttons/NavButton.vue';
import { useAppStore } from '@/store/app';
import CompilationHandler from '@/store/compilation-handler';
import { Track } from '@/store/compilation-types';
import FileHandler from '@/store/filehandler';
import { mdiTextBoxOutline } from '@mdi/js';

const props = defineProps({
    /** The track to display
     * @remarks One of track or trackId is required.
     */
    track: {
        type: Track,
        required: true,
    },
});

const closed = ref(false);
const textContent = ref('');

const app = useAppStore();
const { mediaUrls } = storeToRefs(app);

/** Gets the media URL
 * @remarks For non-online URL's, a match is sought from previously stored binary blobs
 */
const mediaUrl = computed(() => {
    if (FileHandler.isValidHttpUrl(props.track.Url)) {
        return props.track.Url;
    }

    // Get the corresponding object url from the stored blobs
    const url = CompilationHandler.getMatchingPackageMediaUrl(
        props.track?.Url,
        mediaUrls.value,
    )?.url;
    return url;
});

/** Updates the text by fetching the media URL */
function updateText() {
    if (mediaUrl.value) {
        fetch(mediaUrl.value).then((response) => {
            response.text().then((text) => {
                textContent.value = text;
            });
        });
    }
}

watch(
    () => mediaUrl,
    () => {
        updateText();
    },
    { immediate: true, deep: false },
);

/** Watches the stored media URL's to spot a possible match
 * @devdoc This needs to be deep because the relevant URL is one of
 * the map of URL's.
 */
watch(
    () => mediaUrls,
    () => {
        updateText();
    },
    { immediate: true, deep: true },
);
</script>

<style>
.top-right {
    right: 0;
    position: absolute;
    top: 0;
}
</style>
