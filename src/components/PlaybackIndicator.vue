<template>
    <NavButton
        class="is-indicator"
        :class="{
            'has-text-warning': isUnavailable,
            'has-text-dark': isUnloaded,
            'has-text-success': isPlaying && !isUnavailable,
            'has-text-grey-dark': isReady && isUnavailable,
            'has-text-grey': isReady && !isUnavailable,
        }"
        :title="indication"
        :iconPath="isUnavailable ? mdiAlert : mdiCircle"
    >
    </NavButton>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavButton from '@/components/buttons/NavButton.vue';
import { mdiAlert, mdiCircle } from '@mdi/js';

/** An indicator for the track playback state
 */
export default defineComponent({
    name: 'PlaybackIndicator',
    components: { NavButton },
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
    },
});
</script>
<style scoped>
.is-indicator {
    /** Playback Indicators do not interact, however, for the title tooltip, pointer-events none is not usable */
    pointer-events: auto !important;
    cursor: default;

}
</style>
