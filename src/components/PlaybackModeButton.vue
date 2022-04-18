<template>
    <button
        :class="{
            button: true,
        }"
        @click="togglePlaybackMode()"
        title="click to toggle"
    >
        <Icon
            v-if="this.isPlaybackTrack"
            name="track-play"
            title="Play track (click to toggle)"
        />
        <Icon
            v-if="this.isPlaybackLoopTrack"
            name="track-repeat"
            title="Loop track (click to toggle)"
        />
        <Icon
            v-if="this.isPlaybackCue"
            name="track-play-once"
            title="Play cue (click to toggle)"
        />
        <Icon
            v-if="this.isPlaybackLoopCue"
            name="track-repeat-once"
            title="Loop cue (click to toggle)"
        />
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Icon from '@/components/icons/Icon.vue';
import { PlaybackMode } from '@/store/compilation-types';

/** A UI representation for a media player
 * @remarks Handles and emits various states and event for playback control.
 */
export default defineComponent({
    name: 'PlaybackModeButton',
    components: { Icon },
    emits: ['update:modelValue'],
    props: {
        /** The playback mode
         * @remarks Implements a two-way binding
         * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        modelValue: {
            type: String as () => PlaybackMode,
            required: true,
        },
    },
    computed: {
        isPlaybackTrack(): boolean {
            return this.modelValue === PlaybackMode.PlayTrack;
        },
        isPlaybackLoopTrack(): boolean {
            return this.modelValue === PlaybackMode.LoopTrack;
        },
        isPlaybackCue(): boolean {
            return this.modelValue === PlaybackMode.PlayCue;
        },
        isPlaybackLoopCue(): boolean {
            return this.modelValue === PlaybackMode.LoopCue;
        },
    },
    methods: {
        togglePlaybackMode() {
            const playbackMode = this.modelValue;
            console.debug(
                `PlaybackModeButton::togglePlaybackMode:playbackMode:${playbackMode}`,
            );
            //Turn the mode ratchet one step
            let nextPlaybackMode = '';
            if (playbackMode == PlaybackMode.PlayTrack) {
                nextPlaybackMode = PlaybackMode.LoopTrack;
            } else if (playbackMode == PlaybackMode.LoopTrack) {
                nextPlaybackMode = PlaybackMode.PlayCue;
            } else if (playbackMode == PlaybackMode.PlayCue) {
                nextPlaybackMode = PlaybackMode.LoopCue;
            } else if (playbackMode == PlaybackMode.LoopCue) {
                nextPlaybackMode = PlaybackMode.PlayTrack;
            }

            console.debug(
                `PlaybackModeButton::togglePlaybackMode:nextPlaybackMode:${nextPlaybackMode}`,
            );
            this.$emit('update:modelValue', nextPlaybackMode);
        },
    },
});
</script>
