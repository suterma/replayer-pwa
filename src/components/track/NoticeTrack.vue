<template>
    <Transition name="item-expand">
        <div
            v-if="!closed"
            name="item-expand"
            class="track is-together-print"
            data-cy="track-notice"
        >
            <div class="notification is-size-7">
                <span>
                    {{ textContent }}
                </span>
                <CloseButton
                    v-model="closed"
                    class="top-right"
                > </CloseButton>
            </div>
        </div>
    </Transition>
</template>

<script
    setup
    lang="ts"
>
/** A track variant that displays plain text, and offers to close the display */
import { type PropType, onUnmounted, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/store/app';
import CloseButton from '../buttons/CloseButton.vue';
import type { ITrack } from '@/store/ITrack';
import { useTrackStore } from '@/store/track/index';

const props = defineProps({
    /** The track to display
     */
    track: {
        type: Object as PropType<ITrack>,
        required: true,
    },
});

const closed = ref(false);
const textContent = ref('');

const app = useAppStore();
const { mediaUrls } = storeToRefs(app);

// --- tracking the associated ITrack

/** The dynamic track store for this component.
 * @remarks Code inside the setup script runs once per component instance,
 * thus the track store must be destroyed after component unload.
 */
const trackStore = useTrackStore(props.track.Id);
const { mediaUrl } = storeToRefs(trackStore);

onUnmounted(() => {
    trackStore.$dispose();
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
    mediaUrl,
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
    mediaUrls,
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
