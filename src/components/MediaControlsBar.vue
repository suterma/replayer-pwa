<template>
    <button
        v-if="hasSecondTrack"
        class="button"
        :disabled="!hasPreviousTrack"
        @click="toPreviousTrack()"
        title="skip to previous track"
    >
        <BaseIcon v-once name="skip-previous" />
    </button>
    <button
        class="button"
        :disabled="!hasPreviousCue"
        @click="toPreviousCue()"
        title="skip to previous cue"
    >
        <BaseIcon v-once name="skip-previous-outline" />
    </button>

    <!-- Stop (do not show on small devices, user still can use play/pause) -->
    <button class="button is-hidden-mobile" @click="stop()" title="Stop">
        <BaseIcon v-once name="stop" />
    </button>

    <PlayPauseButton
        class="is-success"
        :isPlaying="isPlaying"
        :isLoading="isFading"
        @click="togglePlayback()"
        title="Play from current position"
    />

    <PlaybackModeButton
        :modelValue="playbackMode"
        @update:modelValue="updatePlaybackMode"
    />

    <button
        class="button"
        :disabled="!hasNextCue"
        @click="toNextCue()"
        title="skip to next cue"
    >
        <BaseIcon v-once name="skip-next-outline" />
    </button>

    <button
        v-if="hasSecondTrack"
        class="button"
        :disabled="!hasNextTrack"
        @click="toNextTrack()"
        title="skip to next track"
    >
        <BaseIcon v-once name="skip-next" />
    </button>

    <Knob
        title="Drag, scroll or use the arrow keys to change volume"
        class="button"
        :modelValue="volume"
        @update:modelValue="updateVolume"
        :minValue="0"
        :maxValue="1"
        valueClass="has-text-light"
        rimClass="has-text-grey-light"
    />
    <slot></slot>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { PlaybackMode, DefaultTrackVolume } from '@/store/compilation-types';

import PlayPauseButton from '@/components/buttons/PlayPauseButton.vue';
import PlaybackModeButton from '@/components/buttons/PlaybackModeButton.vue';
import Knob from '@/components/buttons/Knob.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';

/** A set of media controls, intended for use at the track level. Contains Buttons like previous/next track and cue, playback mode and a volume knob, arranged in a bar-like layout.
 */
export default defineComponent({
    name: 'MediaControlsBar',
    components: {
        PlayPauseButton,
        PlaybackModeButton,
        BaseIcon,
        Knob,
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
        return {};
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
