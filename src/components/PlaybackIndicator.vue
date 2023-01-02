<template>
    <p class="control" :title="indication">
        <span class="button is-indicator">
            <BaseIcon
                :path="isUnavailable ? mdiAlert : mdiCircle"
                :class="{
                    'has-text-warning': isUnavailable,
                    'has-text-dark': isUnloaded,
                    'has-text-success': isPlaying && !isUnavailable,
                    'has-text-grey-dark': isReady && !isUnavailable,
                }"
            />
        </span>
    </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { mdiAlert, mdiCircle } from '@mdi/js';

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
        /** Whether the indicator should convey the unavailable state */
        isUnavailable: {
            type: Boolean,
            default: false,
            required: false,
        },
    },
    data() {
        return {
            /** Icons from @mdi/js */
            mdiCircle: mdiCircle,
            mdiAlert: mdiAlert,
        };
    },
    computed: {
        indication(): string {
            if (this.isUnavailable) {
                return 'Track media is unavailable';
            } else if (this.isPlaying) {
                return 'Track is playing';
            } else if (this.isReady) {
                return 'Track is loaded and ready to play';
            } else if (this.isUnloaded) {
                return 'Track not loaded';
            }

            return 'Track is in an unknown state';
        },
        // isLoading(): boolean {
        //     return !this.isUnavailable && !this.isPlaying && !this.isReady;
        // },
    },
});
</script>
