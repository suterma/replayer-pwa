<template>
    <label
        v-tooltip="indication"
        ref="indicator"
        :class="{
            'has-text-warning has-tooltip-warning': isUnavailable,
            'has-text-dark': isUnloaded,
            'has-text-success has-tooltip-success': isPlaying && !isUnavailable,
            'has-text-grey-dark': isReady && isUnavailable,
            'has-text-grey': isReady && !isUnavailable,
        }"
        class="button is-indicator is-nav"
    >
        <!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC -->
        <i class="icon mdi"
            ><svg viewBox="0 0 24 24">
                <path
                    fill="currentColor"
                    :d="isUnavailable ? mdiAlert : mdiCircle"
                /></svg></i
    ></label>
</template>

<script setup lang="ts">
/** An indicator for the playback state of a track
 */
import { mdiAlert, mdiCircle } from '@mdi/js';
import { computed, inject } from 'vue';
import { isPlayingInjectionKey } from '../track/TrackInjectionKeys';

const props = defineProps({
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
});

const indication = computed(() => {
    if (props.isUnavailable) {
        return 'Track media is unavailable. Please reload or replace it in the editor.';
    } else if (isPlaying?.value) {
        return 'Track is playing';
    } else if (props.isReady) {
        return 'Track is loaded and ready to play';
    } else if (props.isUnloaded) {
        return 'Track not loaded';
    }

    return 'Track is in an unknown state';
});

/** Flag to indicate whether this track is currently playing
 */
const isPlaying = inject(isPlayingInjectionKey);
</script>
<style scoped>
.is-indicator {
    /** Playback Indicators do not interact, however, for the title tooltip, pointer-events none is not usable */
    pointer-events: auto !important;
    cursor: default;
}
</style>
