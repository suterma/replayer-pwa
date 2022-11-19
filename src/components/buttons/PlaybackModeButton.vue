<template>
    <button
        :class="{
            button: true,
        }"
        @click="togglePlaybackMode()"
        :title="modeTitle"
    >
        <BaseIcon v-if="isPlaybackTrack" name="track-play" />
        <BaseIcon v-if="isPlaybackLoopTrack" name="track-repeat" />
        <BaseIcon v-if="isPlaybackCue" name="track-play-once" />
        <BaseIcon v-if="isPlaybackLoopCue" name="track-repeat-once" />
        <BaseIcon v-if="isPlaybackLoopCompilation" name="repeat-variant" />
        <BaseIcon v-if="isPlaybackShuffleCompilation" name="shuffle-variant" />
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { PlaybackMode } from '@/store/compilation-types';

/** A toggle switch for the playback mode
 * @remarks Handles and emits various states and event for playback control.
 */
export default defineComponent({
    name: 'PlaybackModeButton',
    components: { BaseIcon },
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
        isPlaybackLoopCompilation(): boolean {
            return this.modelValue === PlaybackMode.LoopCompilation;
        },
        isPlaybackShuffleCompilation(): boolean {
            return this.modelValue === PlaybackMode.ShuffleCompilation;
        },
        modeTitle(): string {
            const playbackMode = this.modelValue;
            let title = 'Current mode: ';
            switch (playbackMode) {
                case PlaybackMode.PlayTrack:
                    title += 'Play track';
                    break;
                case PlaybackMode.LoopTrack:
                    title += 'Loop track';
                    break;
                case PlaybackMode.PlayCue:
                    title += 'Play cue';
                    break;
                case PlaybackMode.LoopCue:
                    title += 'Loop cue';
                    break;
                case PlaybackMode.LoopCompilation:
                    title += 'Loop compilation';
                    break;
                case PlaybackMode.ShuffleCompilation:
                    title += 'Shuffle compilation';
                    break;
                default:
                    break;
            }
            return (title += ' (click to toggle)');
        },
    },
    methods: {
        togglePlaybackMode() {
            const playbackMode = this.modelValue;
            console.debug(
                `PlaybackModeButton::togglePlaybackMode:playbackMode:${playbackMode}`,
            );
            //Turn the mode ratchet one step
            let nextPlaybackMode;
            switch (playbackMode) {
                case PlaybackMode.PlayTrack:
                    nextPlaybackMode = PlaybackMode.LoopTrack;
                    break;
                case PlaybackMode.LoopTrack:
                    nextPlaybackMode = PlaybackMode.PlayCue;
                    break;
                case PlaybackMode.PlayCue:
                    nextPlaybackMode = PlaybackMode.LoopCue;
                    break;
                case PlaybackMode.LoopCue:
                    nextPlaybackMode = PlaybackMode.LoopCompilation;
                    break;
                case PlaybackMode.LoopCompilation:
                    nextPlaybackMode = PlaybackMode.ShuffleCompilation;
                    break;
                case PlaybackMode.ShuffleCompilation:
                    nextPlaybackMode = PlaybackMode.PlayTrack;
                    break;
                default:
                    nextPlaybackMode = PlaybackMode.PlayTrack;
                    break;
            }

            console.debug(
                `PlaybackModeButton::togglePlaybackMode:nextPlaybackMode:${nextPlaybackMode}`,
            );
            this.$emit('update:modelValue', nextPlaybackMode);
        },
    },
});
</script>
