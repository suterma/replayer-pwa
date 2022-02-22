<template>
    <p class="control">
        <span class="button is-indicator">
            <PlaybackIndicatorIcon
                :class="{
                    'has-text-success': this.isPlaying,
                    'has-text-grey-dark': this.isReady,
                    'is-invisible': this.isUnloaded,
                }"
            >
            </PlaybackIndicatorIcon>
        </span>
    </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PlaybackIndicatorIcon from '@/components/icons/PlaybackIndicatorIcon.vue';

/** An indicator for the track playback state
 */
export default defineComponent({
    name: 'PlaybackIndicator',
    components: { PlaybackIndicatorIcon },
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
});
</script>
