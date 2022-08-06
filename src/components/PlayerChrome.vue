<template>
    <div class="field player-panel is-fullwidth" v-if="!loaded">
        <p class="control">
            <button
                v-if="error"
                class="button is-fullwidth is-danger is-static is-outlined"
            >
                <LongLine
                    :text="`Error ${errorText} occurred when using ${sourceDescription}`"
                    :hasProgress="false"
                />
            </button>
            <button v-else disabled class="button is-fullwidth">
                <LongLine
                    :text="`Loading ${sourceDescription}`"
                    :hasProgress="true"
                    :clipLeft="true"
                />
            </button>
        </p>
    </div>
    <div class="field has-addons player-panel" v-else>
        <!-- Stop (do not show on small devices, user still can use play/pause) -->
        <p class="control is-hidden-mobile">
            <button
                :class="{
                    button: true,
                    'is-loading': !loaded,
                }"
                @click.prevent="stop"
                title="Stop"
            >
                <BaseIcon name="stop" />
            </button>
        </p>
        <!-- Play/Pause, when STOP is shown (Only available when the track is loaded, and no playback request is outstanding) -->
        <p class="control is-hidden-mobile">
            <button
                :class="{
                    button: true,
                    disabled: isPlayingRequestOutstanding || !loaded,
                    'is-loading':
                        isPlayingRequestOutstanding || !loaded || isFading,
                }"
                @click.prevent="togglePlayback"
                :title="playing ? 'Pause' : 'Play'"
            >
                <BaseIcon v-if="playing" name="pause" />
                <BaseIcon v-else name="play" />
            </button>
        </p>
        <!-- Play/Pause, as the outermost element, when STOP is hidden (Only available when the track is loaded, and no playback request is outstanding) -->
        <p class="control is-hidden-tablet">
            <button
                :class="{
                    button: true,
                    disabled: isPlayingRequestOutstanding || !loaded,
                    'is-loading': isPlayingRequestOutstanding || !loaded,
                    'has-left-radius': true,
                }"
                @click.prevent="togglePlayback"
                :title="playing ? 'Pause' : 'Play'"
            >
                <BaseIcon v-if="playing" name="pause" />
                <BaseIcon v-else name="play" />
            </button>
        </p>
        <!-- Play mode -->
        <p class="control">
            <PlaybackModeButton
                :modelValue="playbackMode"
                @update:modelValue="updatePlaybackMode"
            />
        </p>
        <!-- The seek bar -->
        <div class="player-seekbar">
            <div class="player-timeline">
                <div :style="progressStyle" class="player-progress"></div>
                <div
                    @click="seekByClick"
                    class="player-seeker"
                    title="Seek"
                ></div>
                <PlayerTime
                    :isFading="isFading"
                    :isPlaying="playing"
                    :duration="durationSeconds"
                    :position="currentSeconds"
                    :sourceDescription="sourceDescription"
                />
            </div>
        </div>
        <p
            class="control"
            title="Drag, scroll or use the arrow keys to change volume"
        >
            <Knob
                class="button"
                :modelValue="volume"
                @update:modelValue="updateVolume"
                :minValue="0"
                :maxValue="1"
                valueClass="has-text-light"
                rimClass="has-text-grey-light"
            />
        </p>
    </div>
</template>

<script lang="ts">
import CompilationHandler from '@/store/compilation-handler';
import { defineComponent, PropType } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import Knob from '@/components/Knob.vue';
import PlayerTime from '@/components/PlayerTime.vue';
import PlaybackModeButton from '@/components/PlaybackModeButton.vue';
import LongLine from '@/components/LongLine.vue';
import { DefaultTrackVolume, PlaybackMode } from '@/store/compilation-types';
import AudioUtil from '@/code/audio/AudioUtil';

/** A UI representation for a media player
 * @remarks Handles and emits various states and event for playback control.
 */
export default defineComponent({
    name: 'PlayerChrome',
    components: { BaseIcon, PlayerTime, PlaybackModeButton, LongLine, Knob },
    emits: [
        'stop',
        /** Flags, whether the UI represents the playing (true) or the paused (false) state
         */
        'update:playing',
        'update:playbackMode',
        'update:currentSeconds',
        'update:volume',
        'seek',
        /** Emitted, when this represents the playing state
         * @remarks This is emitted in conjunction with the 'update:playing' event
         */
        'play',
        /** Emitted, when this represents the paused state
         * @remarks This is emitted in conjunction with the 'update:playing' event
         */
        'pause',
    ],
    props: {
        title: String,
        /** Whether the media file is loaded
         * @remarks Controls the display of the player, to hint the track availability
         */
        loaded: {
            type: Boolean,
            default: false,
        },
        /** Whether the sound is currently fading
         * @remarks Controls the display of the player, to hint the fading action
         */
        isFading: {
            type: Boolean,
            default: false,
        },
        /** The playback progress in the current track, in [seconds]
         * @remarks Implements a two-way binding. Alternatively you can use the seek event
         * to handle a seek */
        currentSeconds: {
            type: Number,
            default: null,
        },
        /** The duration of the current track, in [seconds]
         * @remarks This is only available after successful load of the media file
         */
        durationSeconds: {
            type: Number,
            default: null,
        },
        /** The volume in the range [0..1]
         * @remarks Implements a two-way binding */
        volume: {
            type: Number,
            default: DefaultTrackVolume,
        },
        /** Whether the player is currently playing
         * @remarks Implements a two-way binding */
        playing: {
            type: Boolean,
            default: false,
        },
        /** Flags, whether a playing request is currently outstanding. This is true after a play request was received, for as long
         * as playback has not yet started.
         * @devdoc See https://developers.google.com/web/updates/2017/06/play-request-was-interrupted for more information
         */
        isPlayingRequestOutstanding: {
            type: Boolean,
            default: false,
        },
        /** The track source description
         * @remarks This is a textual indication of the track media source. It's displayed as part of the timing display
         */
        sourceDescription: {
            type: String,
            default: '',
        },

        /** The media error, if any
         * @remarks This is used to display an error for the last action on the player instance.
         */
        error: {
            type: null as unknown as PropType<MediaError | null>,
            default: null,
        },
        /** The playback mode
         * @remarks Implements a two-way binding
         * @devdoc casting the type for TypeScript, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        playbackMode: {
            type: String as () => PlaybackMode,
            required: true,
        },
    },
    data() {
        return {};
    },
    computed: {
        /** Returns a displayable text for the provided error */
        errorText(): string {
            return AudioUtil.getDisplayText(this.error);
        },
        /** The playback progress in the current track, in [percent] */
        percentComplete(): number {
            return (this.currentSeconds / this.durationSeconds) * 100;
        },

        /** Returns the progress style, dynamically depending on the actual progress in the track
         * @remarks Calculates the width with respect to the progress bar width from the player styles (which is a border)
         * max-width makes sure, the progress bar never overflows the given space.
         */
        // eslint-disable-next-line
        progressStyle(): any {
            return {
                width: `calc(${this.percentComplete}% + 0.4em)`,
                'max-width': '100%',
            };
        },

        /** Converts the current time into a conveniently displayable hh:mm:ss.s format.
         * @remarks Omits the hour part, if not applicable
         */
        currentDisplayTime(): string {
            return CompilationHandler.convertToDisplayTime(this.currentSeconds);
        },
        /** Converts the track duration into a conveniently displayable hh:mm:ss.s format.
         * @remarks Omits the hour part, if not applicable
         */
        durationDisplayTime(): string {
            return CompilationHandler.convertToDisplayTime(
                this.durationSeconds,
            );
        },
        volumeTitle(): string {
            return `Volume (${this.volume * 100}%)`;
        },

        isPlaybackTrack(): boolean {
            return this.playbackMode === PlaybackMode.PlayTrack;
        },
        isPlaybackLoopTrack(): boolean {
            return this.playbackMode === PlaybackMode.LoopTrack;
        },
        isPlaybackCue(): boolean {
            return this.playbackMode === PlaybackMode.PlayCue;
        },
        isPlaybackLoopCue(): boolean {
            return this.playbackMode === PlaybackMode.LoopCue;
        },
    },
    methods: {
        /** Updates the playback mode to a new value */
        updatePlaybackMode(playbackMode: PlaybackMode) {
            this.$emit('update:playbackMode', playbackMode);
        },
        /** Updates the track volume to a new value */
        updateVolume(volume: number) {
            this.$emit('update:volume', volume);
        },
        seekByClick(e: MouseEvent) {
            console.debug(`PlayerChrome(${this.title})::seekByClick`, e);
            if (!this.loaded) return;

            const bounds = (e.target as HTMLDivElement).getBoundingClientRect();
            const seekPos = (e.clientX - bounds.left) / bounds.width;

            const seekTime = this.durationSeconds * seekPos;
            this.$emit('update:currentSeconds', seekTime);
            this.$emit('seek', seekTime);
        },
        stop() {
            console.debug(`PlayerChrome(${this.title})::stop`);
            this.$emit('stop');
        },
        togglePlayback() {
            const playback = !this.playing;
            console.debug(
                `PlayerChrome(${this.title})::togglePlayback:playback:${playback}`,
            );
            this.$emit('update:playing', playback);
            if (playback) {
                this.$emit('play');
            } else {
                this.$emit('pause');
            }
        },
    },
});
</script>
<style scoped>
/** Shows the button expanded over 4 slots */
.volume-button-expanded {
    width: 158px;
}

/** The disabled button without special background */
.button[disabled] {
    background-color: #3a3f44;
}
</style>
