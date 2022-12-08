<template>
    <!-- align like a bulma level, vertically centered -->
    <p class="control is-flex is-align-items-center" :title="indication">
        <span class="button is-indicator">
            <BaseIcon :path="iconPath" />
        </span>
        <span>{{ indication }}</span>
    </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import FileHandler from '@/store/filehandler';
import { mdiMusicCircleOutline, mdiMusicNote } from '@mdi/js';

/** An indicator for the track playback state
 */
export default defineComponent({
    name: 'MediaSourceIndicator',
    components: { BaseIcon },
    props: {
        /** The source of the media. A file or an URL */
        source: {
            type: String,
            default: '',
            required: false,
        },
    },
    data() {
        return {
            /** Icons from @mdi/js */
            mdiMusicCircleOutline: mdiMusicCircleOutline,
            mdiMusicNote: mdiMusicNote,
        };
    },
    computed: {
        indication(): string {
            if (this.isUrl) {
                return 'URL: ' + this.source;
            }

            return 'File: ' + this.source;
        },
        iconPath(): string {
            if (this.isUrl) {
                return mdiMusicCircleOutline;
            }

            return mdiMusicNote;
        },
        isUrl() {
            return FileHandler.isValidHttpUrl(this.source);
        },
    },
});
</script>
