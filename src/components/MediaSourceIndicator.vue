<template>
    <p class="control" :title="this.indication">
        <span class="button is-indicator">
            <Icon :name="this.iconName" />
        </span>
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
                return 'world';
            }

            return 'file';
        },
        isUrl() {
            return FileHandler.isValidHttpUrl(this.source);
        },
    },
});
</script>
