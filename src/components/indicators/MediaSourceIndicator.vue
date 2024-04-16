<template>
    <!-- align like a bulma level, vertically centered -->
    <p
        class="control is-flex is-align-items-center"
        :title="
            unavailable
                ? `Track media '${mediaSource}' is unavailable. Please reload or replace it in the editor.`
                : mediaSource
        "
    >
        <label
            class="button is-indicator"
            :class="{ 'has-text-warning': unavailable }"
        >
            <BaseIcon :path="typeIconPath" />
            <BaseIcon :path="sourceIconPath" />
        </label>
        <span
            class="has-cropped-text is-indicator"
            :class="{ 'has-text-warning': unavailable }"
            data-cy="media-source"
            ><span>{{ mediaSource }}</span>

            <template
                v-if="
                    (showSize && mediaUrlSizeInMegaByte) ||
                    (showType && mediaUrl?.mediaType)
                "
            >
                <span class="has-opacity-half is-size-7 is-hidden-mobile">
                    <span class="is-family-monospace">
                        <span>(</span>
                        <span v-if="mediaUrlSizeInMegaByte"
                            >{{ mediaUrlSizeInMegaByte }}
                        </span>
                        <span>&nbsp;MB</span>
                        <span
                            v-if="mediaUrlSizeInMegaByte && mediaUrl?.mediaType"
                            >,&nbsp;</span
                        >
                        <span v-if="mediaUrl?.mediaType"
                            >{{ mediaUrl?.mediaType }}
                        </span>
                        <span>)</span>
                    </span>
                </span>
            </template>
        </span>
        <span
            class="has-text-break-word is-indicator"
            :class="{ 'has-text-warning': unavailable }"
        >
            <!-- A slot for an adornment -->
            <slot></slot>
        </span>
    </p>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import FileHandler from '@/store/filehandler';
import {
    mdiFilePdfBox,
    mdiVideoBox,
    mdiYoutube,
    mdiMusicBox,
    mdiHelpBox,
    mdiWeb,
    mdiFolderFileOutline,
    mdiFileOutline,
} from '@mdi/js';
import { MediaUrl } from '@/store/types';

/** A display for the media source of a track
 * @remarks Includes a slot at the end of the indicative text, for an adornment icon
 * of size 40px
 */
const props = defineProps({
    /** The source of the media. A path to a file or an URL
     * @remarks Alternatively, the mediaUrl property may be used
     */
    source: {
        type: String,
        default: '',
        required: false,
    },

    /** The media URL
     * @remarks Alternatively, the source property may be used
     */
    mediaUrl: {
        type: MediaUrl,
        default: null,
        required: false,
    },
    showSize: {
        type: Boolean,
        required: false,
        default: false,
    },
    showType: {
        type: Boolean,
        required: false,
        default: false,
    },
    /** Whether the media is unavailable */
    unavailable: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const isUrl = computed(() => {
    return FileHandler.isValidHttpUrl(mediaSource.value);
});

const typeIconPath = computed(() => {
    if (FileHandler.isAudioFileName(props.source)) {
        return mdiMusicBox;
    } else if (FileHandler.isVideoFileName(props.source)) {
        return mdiVideoBox;
    } else if (FileHandler.isYouTubeUrl(props.source)) {
        return mdiYoutube;
    } else if (FileHandler.isPdfFileName(props.source)) {
        return mdiFilePdfBox;
    }

    return mdiHelpBox;
});

const sourceIconPath = computed(() => {
    if (isUrl.value) {
        return mdiWeb;
    } else {
        return mdiFileOutline;
    }
});

/** Arbitration of the source provided */
const mediaSource = computed(() => {
    if (props.source) {
        return props.source;
    } else {
        return props.mediaUrl?.source;
    }
});

/** Get the content size in MB, rounded to one decimal place */
const mediaUrlSizeInMegaByte = computed(() => {
    return FileHandler.AsMegabytes(props.mediaUrl?.size);
});
</script>
