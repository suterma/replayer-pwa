<template>
    <p class="control" :title="this.indication">
        <span class="button is-indicator">
            <BaseIcon
                name="indicator"
                :class="{
                    'has-text-success': this.isPlaying,
                    'has-text-grey-dark': this.isReady,
                    'is-invisible': this.isUnloaded,
                }"
            />
        </span>
    </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';

/** An indicator for the track playback state
 */
export default defineComponent({
    name: 'PlaybackIndicator',
    components: { BaseIcon },
    props: {
        /** Whether the indicator should convey the playing state */
        isPlaying: {
            type: Boolean,
            default: false,
            required: false,
        },

        /** Whether the indicator should convey the ready state */
        isReady: {
            type: Boolean,
            default: false,
            required: false,
        },
        /** Whether the indicator should convey the unloaded state */
        isUnloaded: {
            type: Boolean,
            default: true,
            required: false,
        },
    },
    computed: {
        indication(): string {
            if (this.isPlaying) {
                return 'Track is playing';
            }
            if (this.isReady) {
                return 'Track is loaded and ready to play';
            } else return 'Track is not yet loaded';
        },
    },
});
</script>
