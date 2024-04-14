<template>
    <Transition name="item-expand">
        <div
            v-if="!closed"
            name="item-expand"
            class="track is-pdf is-together-print"
            :class="{
                'is-editable': trackViewMode == TrackViewMode.Edit,
            }"
            data-cy="track-pdf"
        >
            <div class="notification is-size-7">
                <span>
                    {{ track.Url }}
                    <!-- {{ textContent }} -->
                </span>

                <object
                    :data="mediaUrl"
                    type="application/pdf"
                    width="100%"
                    height="33%"
                    max-height="33%"
                ></object>

                <CloseButton v-model="closed" class="top-right"> </CloseButton>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
/** A track variant that displays a PDF document, either as link or as an expandable inline viewer */
import { type PropType, computed, ref, watch, inject } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/store/app';
import CompilationHandler from '@/store/compilation-handler';
import FileHandler from '@/store/filehandler';
import CloseButton from '../buttons/CloseButton.vue';
import type { ITrack } from '@/store/ITrack';
import { trackViewModeInjectionKey } from '@/components/track/TrackInjectionKeys';
import { TrackViewMode } from '@/store/TrackViewMode';

const props = defineProps({
    /** The track to display
     */
    track: {
        type: Object as PropType<ITrack>,
        required: true,
    },
});

const trackViewMode = inject(trackViewModeInjectionKey);

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

.track .notification {
    /** Make single-lined text vertically aligned with the close button,
    similar padding for left, for consistency */
    padding: calc(0.5rem + 2px);
    padding-right: 2.5rem;
    min-height: 40px;
}
</style>
