<template>
    <div class="player-time is-unselectable foreground">
        <div
            :class="{
                'player-time-current': true,
                'player-playing-indication': this.isPlaying,
            }"
        >
            <span class="is-hidden-mobile">{{ currentDisplayTime }}</span>
            <span class="is-hidden-tablet">{{ currentDisplayTimeShort }}</span>
            <span class="is-hidden-mobile" v-if="this.isFading">
                (fading...)
            </span>
        </div>
        <div class="player-time-total">
            <span class="is-hidden-mobile">{{ durationDisplayTime }}</span>
            <span class="is-hidden-tablet">{{ durationDisplayTimeShort }}</span>
        </div>
    </div>
</template>

<script lang="ts">
import CompilationHandler from '@/store/compilation-handler';
import { defineComponent } from 'vue';

/** A UI for playback time and duration
 */
export default defineComponent({
    name: 'PlayerTime',
    components: {},

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
    },
    data: () => ({}),

    computed: {
        /** Converts the current time into a conveniently displayable format.
         * @remarks Omits the hour part, if not appliccable
         */
        currentDisplayTime(): string {
            return CompilationHandler.convertToDisplayTime(this.position);
        },
        /** Converts the track duration into a conveniently displayable format.
         * @remarks Omits the hour part, if not appliccable
         */
        durationDisplayTime(): string {
            return CompilationHandler.convertToDisplayTime(this.duration);
        },
        /** Converts the current time into a conveniently displayable format.
         * @remarks Omits the hour part, if not appliccable
         */
        currentDisplayTimeShort(): string {
            return CompilationHandler.convertToDisplayTime(this.position, 1);
        },
        /** Converts the track duration into a conveniently displayable format.
         * @remarks Omits the hour part, if not appliccable
         */
        durationDisplayTimeShort(): string {
            return CompilationHandler.convertToDisplayTime(this.duration, 1);
        },
    },
    methods: {},
});
</script>
