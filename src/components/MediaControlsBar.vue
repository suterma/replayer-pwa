<template>
    <div data-cy="media-controls-bar">
        <button
            v-if="hasSecondTrack && !hideTrackNavigation"
            class="button"
            :disabled="!hasPreviousTrack || disabled"
            @click="toPreviousTrack()"
            title="skip to previous track"
            data-cy="previous-track"
        >
            <BaseIcon v-once :path="mdiSkipPrevious" />
        </button>
        <button
            v-if="!hideCueNavigation"
            class="button"
            :disabled="!hasPreviousCue || disabled"
            @click="toPreviousCue()"
            title="skip to previous cue"
            data-cy="previous-cue"
        >
            <BaseIcon v-once :path="mdiSkipPreviousOutline" />
        </button>

        <!-- Stop (do not show on small devices, user still can use play/pause) -->
        <button
            v-if="!hideStopButton"
            class="button is-hidden-mobile"
            :disabled="disabled"
            @click="stop()"
            title="Stop"
            data-cy="stop"
        >
            <BaseIcon v-once :path="mdiStop" />
        </button>

        <PlayPauseButton
            v-if="!hidePlayPauseButton"
            class="is-success"
            :disabled="disabled"
            :isPlaying="isPlaying"
            :isLoading="isFading"
            @click="togglePlayback()"
            title="Play from current position"
            data-cy="toggle-playback"
        />
        <slot name="after-play"></slot>

        <button
            v-if="!hideCueNavigation"
            class="button"
            :disabled="!hasNextCue || disabled"
            @click="toNextCue()"
            title="skip to next cue"
            data-cy="next-cue"
        >
            <BaseIcon v-once :path="mdiSkipNextOutline" />
        </button>

        <button
            v-if="hasSecondTrack && !hideTrackNavigation"
            class="button"
            :disabled="!hasNextTrack || disabled"
            @click="toNextTrack()"
            title="skip to next track"
            data-cy="next-track"
        >
            <BaseIcon v-once :path="mdiSkipNext" />
        </button>

        <PlaybackModeButton
            :modelValue="playbackMode"
            @update:modelValue="updatePlaybackMode"
            data-cy="toggle-playback-mode"
        />

        <VolumeKnob
            v-if="!hideVolumeButton"
            :disabled="disabled"
            :modelValue="volume"
            @update:modelValue="updateVolume"
        />
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PlaybackMode, DefaultTrackVolume } from '@/store/compilation-types';

import PlayPauseButton from '@/components/buttons/PlayPauseButton.vue';
import PlaybackModeButton from '@/components/buttons/PlaybackModeButton.vue';
import VolumeKnob from '@/components/VolumeKnob.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import {
    mdiSkipPrevious,
    mdiSkipPreviousOutline,
    mdiStop,
    mdiSkipNextOutline,
    mdiSkipNext,
} from '@mdi/js';

/** A set of media controls, intended for use at the track level. Contains Buttons like previous/next track and cue, playback mode and a volume knob, arranged in a bar-like layout.
 */
export default defineComponent({
    name: 'MediaControlsBar',
    components: {
        PlayPauseButton,
        PlaybackModeButton,
        BaseIcon,
        VolumeKnob,
    },
    emits: [
        /** Emitted, when the stop button is clicked
         */
        'stop',
        'previousCue',
        'previousTrack',
        'nextCue',
        'nextTrack',
        /** Emitted when the user wants to toggle the playing (true) or the paused (false) state
         */
        'togglePlaying',
        'update:playbackMode',
        'update:volume',
        /** Emitted at a seek button click, with the amount of seconds as argument (can also be negative)
         */
        'seek',
    ],
    props: {
        /** Whether the media is currently fading
         * @remarks Controls the display of the player, to hint the fading action
         */
        isFading: {
            type: Boolean,
            default: false,
        },
        /** Whether the media is currently playing
         * @remarks Controls the display of the player, to hint the playing action
         */
        isPlaying: {
            type: Boolean,
            default: false,
        },
        /** The volume in the range [0..1]
         * @remarks Implements a two-way binding */
        volume: {
            type: Number,
            default: DefaultTrackVolume,
        },

        /** Whether to show the component in a disabled state
         * @devdoc This attribute is processed with "fallthrough", to propagate the state to the inner elements.
         */
        disabled: Boolean,

        /** The playback mode
         * @remarks Implements a two-way binding
         * @devdoc casting the type for TypeScript, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        playbackMode: {
            type: String as () => PlaybackMode,
            required: true,
        },

        /** Whether the playing cue has a previous cue
         */
        hasPreviousCue: {
            type: Boolean,
            default: false,
        },

        /** Whether to hide the previous/next track buttons
         */
        hideTrackNavigation: {
            type: Boolean,
            default: false,
        },

        /** Whether to hide the previous/next cue buttons
         */
        hideCueNavigation: {
            type: Boolean,
            default: false,
        },

        /** Whether to hide the play/pause button
         */
        hidePlayPauseButton: {
            type: Boolean,
            default: false,
        },
        /** Whether to hide the stop button
         */
        hideStopButton: {
            type: Boolean,
            default: false,
        },

        /** Whether to hide the volume button
         */
        hideVolumeButton: {
            type: Boolean,
            default: false,
        },

        /** Whether the playing cue has a next cue
         */
        hasNextCue: {
            type: Boolean,
            default: false,
        },

        /** Whether the playing track has a previous track
         */
        hasPreviousTrack: {
            type: Boolean,
            default: false,
        },
        /** Whether the playing track has a next track
         */
        hasNextTrack: {
            type: Boolean,
            default: false,
        },
    },
    data() {
        return {
            /** Icons from @mdi/js */
            mdiSkipPrevious: mdiSkipPrevious,
            mdiSkipPreviousOutline: mdiSkipPreviousOutline,
            mdiStop: mdiStop,
            mdiSkipNextOutline: mdiSkipNextOutline,
            mdiSkipNext: mdiSkipNext,
        };
    },
    methods: {
        stop(): void {
            this.$emit('stop');
        },
        toPreviousCue(): void {
            this.$emit('previousCue');
        },
        toPreviousTrack(): void {
            this.$emit('previousTrack');
        },
        toNextCue(): void {
            this.$emit('nextCue');
        },
        toNextTrack(): void {
            this.$emit('nextTrack');
        },

        togglePlayback() {
            this.$emit('togglePlaying');
        },

        seek(seconds: number): void {
            this.$emit('seek', seconds);
        },

        /** Handle a playback mode update
         */
        updatePlaybackMode(playbackMode: PlaybackMode): void {
            this.$emit('update:playbackMode', playbackMode);
        },

        /** Handle a volume update
         */
        updateVolume(volume: number): void {
            this.$emit('update:volume', volume);
        },
    },

    watch: {},
    computed: {
        /** Whether the compilation has a second track at all
         * @remarks If there is just one track, next and previous track buttons can be omitted
         */
        hasSecondTrack(): boolean {
            return this.hasPreviousTrack || this.hasNextTrack;
        },
    },
});
</script>
