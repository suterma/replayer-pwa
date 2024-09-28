<template>
    <label
        v-tooltip="indication"
        ref="indicator"
        :class="{
            'has-text-warning has-tooltip-warning':
                state === PlaybackState.Unavailable,
            'has-text-dark': state === PlaybackState.Unloaded,
            'has-text-success has-tooltip-success':
                state === PlaybackState.Playing,
            'has-text-grey-dark': state === PlaybackState.Unavailable,
            'has-text-grey': state === PlaybackState.Ready,
        }"
        class="button is-indicator is-nav"
    >
        <!-- NOTE: For performance reasons, this icon is implemented inline, not using the BaseIcon SFC -->
        <i class="icon mdi"
            ><svg viewBox="0 0 24 24">
                <path fill="currentColor" :d="path" />
            </svg>
        </i>
    </label>
</template>
<script setup lang="ts">
/** An indicator for the playback state of a track
 */
import { mdiAlert, mdiCircle } from '@mdi/js';
import { computed, type PropType } from 'vue';
import { PlaybackState } from '@/code/media/PlaybackState';

const props = defineProps({
    /** The state the indicator should convey */
    state: {
        type: null as unknown as PropType<PlaybackState>,
        default: PlaybackState.Unavailable,
        required: false,
    },
});

const indication = computed(() => {
    switch (props.state) {
        case PlaybackState.Unavailable:
            return 'Track media is unavailable. Please reload or replace it in the editor.';
        case PlaybackState.Unloaded:
            return 'Track not loaded.';
        case PlaybackState.Ready:
            return 'Track is loaded and ready to play.';
        case PlaybackState.Playing:
            return 'Track is playing.';
    }
});
const path = computed(() => {
    switch (props.state) {
        case PlaybackState.Unavailable:
            return mdiAlert;
    }
    return mdiCircle;
});
</script>
<style scoped>
.is-indicator {
    /** Playback Indicators do not interact, however, for the title tooltip, pointer-events none is not usable */
    pointer-events: auto !important;
    cursor: default;
}
</style>
