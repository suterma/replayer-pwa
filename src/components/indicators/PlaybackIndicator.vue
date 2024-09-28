<template>
    <label
        v-if="state === PlaybackState.Unavailable"
        v-tooltip="
            'Track media is unavailable. Please reload or replace it in the editor.'
        "
        class="button is-indicator is-nav has-text-warning has-tooltip-warning"
    >
        <i class="icon mdi"
            ><svg viewBox="0 0 24 24">
                <path fill="currentColor" :d="mdiAlert" />
            </svg>
        </i>
    </label>
    <template v-else>
        <label
            v-if="state === PlaybackState.Unloaded"
            v-tooltip="'Track not loaded.'"
            class="button is-indicator is-nav has-text-dark"
        >
            <i class="icon mdi"
                ><svg viewBox="0 0 24 24">
                    <path fill="currentColor" :d="mdiCircle" />
                </svg>
            </i>
        </label>
        <template v-else>
            <span class="is-relative">
                <label
                    v-tooltip="'Track is loaded and ready to play.'"
                    class="button is-indicator is-nav has-text-grey"
                >
                    <i class="icon mdi"
                        ><svg viewBox="0 0 24 24">
                            <path fill="currentColor" :d="mdiCircle" />
                        </svg>
                    </i>
                </label>
                <label
                    style="position: absolute; left: 0"
                    v-tooltip="'Track is playing.'"
                    class="button is-indicator is-nav has-text-success has-tooltip-success"
                    :class="{
                        'is-transparent': state !== PlaybackState.Playing,
                    }"
                >
                    <i class="icon mdi"
                        ><svg viewBox="0 0 24 24">
                            <path fill="currentColor" :d="mdiCircle" />
                        </svg>
                    </i>
                </label>
            </span>
        </template>
    </template>
</template>
<script setup lang="ts">
/** An indicator for the playback state of a track
 * @devdoc For rendering optimization for the two most switched states,
 * ready and playing, the transition is updating only opacity, when
 * switching between these two states. Other states are implemented separately
 * and are not optimized.
 * NOTE: For performance reasons, the icon is implemented inline, not using the BaseIcon SFC -->
 */
import { mdiAlert, mdiCircle } from '@mdi/js';
import { type PropType } from 'vue';
import { PlaybackState } from '@/code/media/PlaybackState';

const props = defineProps({
    /** The state the indicator should convey */
    state: {
        type: null as unknown as PropType<PlaybackState>,
        default: PlaybackState.Unavailable,
        required: false,
    },
});
</script>
<style scoped>
.is-indicator {
    /** Playback Indicators do not interact, however, for the title tooltip, pointer-events none is not usable */
    pointer-events: auto !important;
    cursor: default;
}

.button.is-indicator.is-nav.has-text-success {
    position: absolute !important;
}

.button.is-indicator.is-nav.is-transparent {
    opacity: 0;
    pointer-events: none !important;
}
</style>
