<template>
    <button v-tooltip="modeTitle" class="button" @click="togglePlaybackMode()">
        <BaseIcon v-if="isPlaybackTrack" :path="rTrackPlay" />
        <BaseIcon v-if="isPlaybackLoopTrack" :path="rTrackRepeat" />
        <BaseIcon v-if="isPlaybackCue" :path="rTrackPlayOnce" />
        <BaseIcon v-if="isPlaybackLoopCue" :path="rTrackRepeatOnce" />
        <BaseIcon
            v-if="isPlaybackQueueCue"
            :path="mdiPlaylistPlay"
            class="is-experimental"
        />
        <BaseIcon v-if="isPlaybackLoopCompilation" :path="rRepeatVariant" />
        <BaseIcon v-if="isPlaybackShuffleCompilation" :path="rShuffleVariant" />
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import {
    rTrackPlay,
    rTrackRepeat,
    rRepeatVariant,
    rShuffleVariant,
    rTrackPlayOnce,
    rTrackRepeatOnce,
} from '@/components/icons/ReplayerIcon';
import { mdiPlaylistPlay } from '@mdi/js';
import { mapState } from 'pinia';
import { useSettingsStore } from '@/store/settings';
import { PlaybackMode } from '@/store/PlaybackMode';

/** A toggle switch for the playback mode
 * @remarks Handles and emits various states and event for playback control.
 */
export default defineComponent({
    name: 'PlaybackModeButton',
    components: { BaseIcon },
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
    emits: ['update:modelValue'],
    data() {
        return {
            /** Icons from BaseIcon.vue */
            rTrackPlay: rTrackPlay,
            rTrackRepeat: rTrackRepeat,
            rRepeatVariant: rRepeatVariant,
            rShuffleVariant: rShuffleVariant,
            rTrackPlayOnce: rTrackPlayOnce,
            rTrackRepeatOnce: rTrackRepeatOnce,
            mdiPlaylistPlay: mdiPlaylistPlay,
        };
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
        isPlaybackQueueCue(): boolean {
            return this.modelValue === PlaybackMode.QueueCue;
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
                case PlaybackMode.QueueCue:
                    title += 'Queue cue (EXPERIMENTAL)';
                    break;
                case PlaybackMode.LoopCompilation:
                    title += 'Loop all';
                    break;
                case PlaybackMode.ShuffleCompilation:
                    title += 'Shuffle all';
                    break;
                default:
                    break;
            }
            return (title += '\r\n(click to toggle)');
        },
        ...mapState(useSettingsStore, ['experimentalUseQueueCueMode']),
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
                    if (this.experimentalUseQueueCueMode) {
                        nextPlaybackMode = PlaybackMode.QueueCue;
                    } else {
                        //omit the experiment
                        nextPlaybackMode = PlaybackMode.LoopCompilation;
                    }
                    break;
                case PlaybackMode.QueueCue:
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
            this.$emit('update:modelValue', nextPlaybackMode);
        },
    },
});
</script>
