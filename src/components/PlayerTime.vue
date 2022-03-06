<template>
    <div class="player-time is-unselectable foreground">
        <div
            :class="{
                'player-time-current': true,
                'player-playing-indication': this.isPlaying,
            }"
        >
            <span v-if="this.isMobile">{{ currentDisplayTimeShort }}</span>
            <span v-else>{{ currentDisplayTime }}</span>
            <span class="is-hidden-mobile" v-if="this.isFading">
                (fading...)
            </span>
        </div>
        <div class="has-opacity-half player-source-indication is-hidden-mobile">
            {{ source }}
        </div>
        <div class="player-time-total">
            <span v-if="this.isMobile">{{ durationDisplayTimeShort }}</span>
            <span v-else>{{ durationDisplayTime }}</span>
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
        /** The track source description
         * @remarks This is a textual indication of the track media source. It's displayed as part of the timing display
         */
        source: {
            type: String,
            default: '',
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
        isMobile() {
            if (document.body.clientWidth <= 768 /* isMobile by Bulma */) {
                return true;
            } else {
                return false;
            }
        },
    },
    methods: {},
});
</script>
<style scoped>
/** Show the full,source only when the place is wide enough, otherwise shrink from the left side. */
.player-source-indication {
    white-space: nowrap;
    overflow: hidden;
    /* "overflow" value must be different from "visible" */
    text-overflow: ellipsis;
    direction: rtl;
    max-width: 50%;
}
</style>
