<template>
    <div class="player-time is-unselectable foreground">
        <div
            :class="{
                'player-time-current': true,
                'player-playing-indication': isPlaying,
            }"
        >
            <TimeDisplay :modelValue="position"></TimeDisplay>

            <BaseIcon v-if="isPlaying && !isFading" name="volume-high" />
            <BaseIcon v-if="isPlaying && isFading" name="volume-medium" />
            <BaseIcon v-if="!isPlaying" name="empty" />
        </div>

        <div
            class="has-opacity-half player-source-indication is-clipped has-left-ellipsis is-single-line is-hidden-touch"
        >
            {{ sourceDescription }}
        </div>
        <div class="player-time-total">
            <TimeDisplay :modelValue="duration"></TimeDisplay>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';

/** A UI for playback time and duration
 */
export default defineComponent({
    name: 'PlayerTime',
    components: { BaseIcon, TimeDisplay },

    props: {
        isFading: {
            type: Boolean,
            default: false,
        },
        /** Whether the player is currently playing */
        isPlaying: {
            type: Boolean,
            default: false,
        },
        /** The playback progress in the current track, in [seconds] */

        position: {
            type: Number,
            default: null,
        },
        /** The duration of the current track, in [seconds]
         * @remarks This is only available after successful load of the media file
         */
        duration: {
            type: Number,
            default: null,
        },
        /** The track source description
         * @remarks This is a textual indication of the track media source. It's displayed as part of the timing display
         */
        sourceDescription: {
            type: String,
            default: '',
        },
    },
});
</script>
<style scoped>
/** Show the full,source only when the place is wide enough, otherwise shrink from the left side. */
.player-source-indication {
    /* Use only part of the available space to allow shrinking of the player to a very small amount */
    max-width: calc(80% - 200px);
}

/** Align icons in the indicator text */
.player-time .icon {
    height: inherit;
    padding-left: 5px;
    padding-right: 5px;
}
</style>
