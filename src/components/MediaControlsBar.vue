<template>
    <div class="media-controls-bar" data-cy="media-controls-bar">
        <slot name="start"></slot>

        <button
            v-if="hasSecondTrack && !hideTrackNavigation"
            class="button"
            :disabled="!hasPreviousTrack || disabled"
            title="skip to previous track"
            data-cy="previous-track"
            @click="toPreviousTrack()"
        >
            <BaseIcon v-once :path="mdiSkipPrevious" />
        </button>
        <button
            v-if="!hideCueNavigation"
            class="button"
            :disabled="!hasPreviousCue || disabled"
            title="skip to previous cue"
            data-cy="previous-cue"
            @click="toPreviousCue()"
        >
            <BaseIcon v-once :path="mdiSkipPreviousOutline" />
        </button>

        <!-- Stop (do not show on small devices, user still can use play/pause) -->
        <button
            v-if="!hideStopButton"
            class="button is-hidden-mobile"
            :disabled="disabled"
            title="Stop"
            data-cy="stop"
            @click="stop()"
        >
            <BaseIcon v-once :path="mdiStop" />
        </button>

        <PlayPauseButton
            v-if="!hidePlayPauseButton"
            class="is-success"
            :disabled="disabled"
            :is-loading="isFading"
            title="Play from current position"
            data-cy="toggle-playback"
            @click="togglePlayback()"
        />
        <slot name="after-play"></slot>

        <button
            v-if="!hideCueNavigation"
            class="button"
            :disabled="!hasNextCue || disabled"
            title="skip to next cue"
            data-cy="next-cue"
            @click="toNextCue()"
        >
            <BaseIcon v-once :path="mdiSkipNextOutline" />
        </button>

        <button
            v-if="hasSecondTrack && !hideTrackNavigation"
            class="button"
            :disabled="!hasNextTrack || disabled"
            title="skip to next track"
            data-cy="next-track"
            @click="toNextTrack()"
        >
            <BaseIcon v-once :path="mdiSkipNext" />
        </button>

        <PlaybackModeMenu
            :model-value="playbackMode"
            :has-second-track="hasSecondTrack"
            data-cy="select-playback-mode"
            @update:model-value="updatePlaybackMode"
        />

        <PreRollToggler
            v-if="!hidePreRollToggler"
            :model-value="isPreRollEnabled"
            data-cy="toggle-preroll-mode"
            @update:model-value="updatedIsPreRollEnabled"
        />

        <FadingToggler
            v-if="!hideFadingToggler"
            :model-value="isFadingEnabled"
            data-cy="toggle-fading-mode"
            @update:model-value="updatedIsFadingEnabled"
        />

        <VolumeKnob
            v-if="!hideVolumeButton"
            :disabled="disabled"
            :volume="volume"
            @update:volume="updateVolume"
        />
        <slot></slot>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import PlayPauseButton from '@/components/buttons/PlayPauseButton.vue';
import PlaybackModeMenu from '@/components/context-menu/PlaybackModeMenu.vue';
import FadingToggler from '@/components/buttons/FadingToggler.vue';
import PreRollToggler from '@/components/buttons/PreRollToggler.vue';
import VolumeKnob from '@/components/controls/VolumeKnob.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import {
    mdiSkipPrevious,
    mdiSkipPreviousOutline,
    mdiStop,
    mdiSkipNextOutline,
    mdiSkipNext,
} from '@mdi/js';
import { DefaultTrackVolume } from '@/store/Track';
import type { PlaybackMode } from '@/store/PlaybackMode';

/** A set of media controls, intended for use at the track level. Contains Buttons like previous/next track and cue, playback mode and a volume knob, arranged in a bar-like layout.
 */
export default defineComponent({
    name: 'MediaControlsBar',
    components: {
        PlayPauseButton,
        PlaybackModeMenu,
        FadingToggler,
        PreRollToggler,
        BaseIcon,
        VolumeKnob,
    },
    props: {
        /** Whether the media is currently fading
         * @remarks Controls the display of the player, to hint the fading action
         */
        isFading: {
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

        /** Whether fading is currently enabled
         * @remarks Implements a two-way binding
         */
        isFadingEnabled: {
            type: Boolean,
            required: true,
        },

        /** Whether pre-roll is currently enabled
         * @remarks Implements a two-way binding
         */
        isPreRollEnabled: {
            type: Boolean,
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

        /** Whether to hide the fading toggler button
         */
        hideFadingToggler: {
            type: Boolean,
            default: false,
        },

        /** Whether to hide the pre-roll toggler button
         */
        hidePreRollToggler: {
            type: Boolean,
            default: false,
        },

        /** Whether the playing cue has a next cue
         */
        hasNextCue: {
            type: Boolean,
            default: false,
        },

        /** Whether this track has a previous track to skip to
         */
        hasPreviousTrack: {
            type: Boolean,
            default: false,
        },
        /** Whether the playing track has a next track to skip to
         */
        hasNextTrack: {
            type: Boolean,
            default: false,
        },
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
        'update:isFadingEnabled',
        'update:isPreRollEnabled',
        'update:volume',
        /** Emitted at a seek button click, with the amount of seconds as argument (can also be negative)
         */
        'seek',
    ],
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
    computed: {
        /** Whether the compilation has a second track at all
         * @remarks If there is just one track, next and previous track buttons can be omitted
         */
        hasSecondTrack(): boolean {
            return this.hasPreviousTrack || this.hasNextTrack;
        },
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

        /** Handling the enabled state of the fading */
        updatedIsFadingEnabled(isFadingEnabled: boolean): void {
            this.$emit('update:isFadingEnabled', isFadingEnabled);
        },

        /** Handling the enabled state of the pre-roll */
        updatedIsPreRollEnabled(isPreRollEnabled: boolean): void {
            this.$emit('update:isPreRollEnabled', isPreRollEnabled);
        },

        /** Handle a volume update
         */
        updateVolume(volume: number): void {
            this.$emit('update:volume', volume);
        },
    },
});
</script>
