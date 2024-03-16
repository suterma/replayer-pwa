<template>
    <NavButton
        class="is-indicator is-nav has-tooltip-left has-tooltip-arrow has-tooltip-multiline has-tooltip-text-centered has-tooltip-fade"
        :class="{
            'has-text-warning has-tooltip-warning': isUnavailable,
            'has-text-dark': isUnloaded,
            'has-text-success has-tooltip-success':
                isTrackPlaying && !isUnavailable,
            'has-text-grey-dark': isReady && isUnavailable,
            'has-text-grey': isReady && !isUnavailable,
            'has-tooltip-active': isActiveTooltip,
            'has-tooltip-inactive': isInactiveTooltip,
        }"
        :data-tooltip="indication"
        :data-cy="indication"
        :icon-path="isUnavailable ? mdiAlert : mdiCircle"
        @click="toggleTooltip()"
    >
    </NavButton>
</template>

<script setup lang="ts">
/** An indicator for the playback state of a track
 */
import NavButton from '@/components/buttons/NavButton.vue';
import { mdiAlert, mdiCircle } from '@mdi/js';
import { computed, inject, ref } from 'vue';
import { isPlayingInjectionKey } from './track/TrackInjectionKeys';

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
    } else if (isTrackPlaying?.value) {
        return 'Track is playing';
    } else if (props.isReady) {
        return 'Track is loaded and ready to play';
    } else if (props.isUnloaded) {
        return 'Track not loaded';
    }

    return 'Track is in an unknown state';
});

const isActiveTooltip = ref(false);
const isInactiveTooltip = ref(false);

function toggleTooltip() {
    isActiveTooltip.value = !isActiveTooltip.value;
    isInactiveTooltip.value = !isInactiveTooltip.value;
    setTimeout(() => {
        isActiveTooltip.value = false;
        isInactiveTooltip.value = false;
    }, 1500);
}

/** Flag to indicate whether this track's player is currently playing
 */
const isTrackPlaying = inject(isPlayingInjectionKey);
</script>
<style scoped>
.is-indicator {
    /** Playback Indicators do not interact, however, for the title tooltip, pointer-events none is not usable */
    pointer-events: auto !important;
    cursor: default;
}
</style>
