<template>
    <!-- align like a bulma level, vertically centered -->
    <p class="control is-flex is-align-items-center" :title="indication">
        <span class="button is-indicator">
            <Icon :name="iconName" />
        </span>
        <span>{{ indication }}</span>
    </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/components/icons/Icon.vue';
import FileHandler from '@/store/filehandler';

/** An indicator for the track playback state
 */
export default defineComponent({
    name: 'MediaSourceIndicator',
    components: { Icon },
    props: {
        /** The source of the media. A file or an URL */
        source: {
            type: String,
            default: '',
            required: false,
        },
    },
    computed: {
        indication(): string {
            if (this.isUrl) {
                return 'URL: ' + this.source;
            }

            return 'File: ' + this.source;
        },
        iconName(): string {
            if (this.isUrl) {
                return 'music-circle-outline';
            }

            return 'music-note';
        },
        isUrl() {
            return FileHandler.isValidHttpUrl(this.source);
        },
    },
});
</script>
