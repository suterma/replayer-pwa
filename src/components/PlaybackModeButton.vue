<template>
    <Hotkey :keys="['ctrl', 'r']" v-slot="{ clickRef }">
        <button
            :class="{
                button: true,
            }"
            :ref="clickRef"
            @click="togglePlaybackMode()"
            title="click to toggle"
        >
            <BaseIcon
                v-if="isPlaybackTrack"
                name="track-play"
                title="Play track (click to toggle)"
            />
            <BaseIcon
                v-if="isPlaybackLoopTrack"
                name="track-repeat"
                title="Loop track (click to toggle)"
            />
            <BaseIcon
                v-if="isPlaybackCue"
                name="track-play-once"
                title="Play cue (click to toggle)"
            />
            <BaseIcon
                v-if="isPlaybackLoopCue"
                name="track-repeat-once"
                title="Loop cue (click to toggle)"
            /></button
    ></Hotkey>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { PlaybackMode } from '@/store/compilation-types';
import { Hotkey } from '@simolation/vue-hotkey';

/** A UI representation for a media player
 * @remarks Handles and emits various states and event for playback control.
 */
export default defineComponent({
    name: 'PlaybackModeButton',
    components: { BaseIcon, Hotkey },
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
