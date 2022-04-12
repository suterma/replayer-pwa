<template>
    <div class="field player-panel is-fullwidth" v-if="!this.loaded">
        <p class="control">
            <button
                v-if="this.error"
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
                    'is-loading': !this.loaded,
                }"
                @click.prevent="stop"
                title="Stop"
            >
                <Icon name="stop" />
            </button>
        </p>
        <!-- Play/Pause, when STOP is shown (Only available when the track is loaded, and no playback request is outstanding) -->
        <p class="control is-hidden-mobile">
            <button
                :class="{
                    button: true,
                    disabled: this.isPlayingRequestOutstanding || !this.loaded,
                    'is-loading':
                        this.isPlayingRequestOutstanding || !this.loaded,
                }"
                @click.prevent="togglePlayback"
                :title="playing ? 'Pause' : 'Play'"
            >
                <Icon v-if="playing" name="pause" />
                <Icon v-else name="play" />
            </button>
        </p>
        <!-- Play/Pause, as the outermost element, when STOP is hidden (Only available when the track is loaded, and no playback request is outstanding) -->
        <p class="control is-hidden-tablet">
            <button
                :class="{
                    button: true,
                    disabled: this.isPlayingRequestOutstanding || !this.loaded,
                    'is-loading':
                        this.isPlayingRequestOutstanding || !this.loaded,
                    'has-left-radius': true,
                }"
                @click.prevent="togglePlayback"
                :title="playing ? 'Pause' : 'Play'"
            >
                <Icon v-if="playing" name="pause" />
                <Icon v-else name="play" />
            </button>
        </p>
        <!-- The seek bar -->
        <div
            :class="{
                'player-seekbar': true,
            }"
        >
            <div class="player-timeline">
                <div :style="progressStyle" class="player-progress"></div>
                <div
                    @click="seekByClick"
                    class="player-seeker"
                    title="Seek"
                ></div>
                <PlayerTime
                    :isFading="this.isFading"
                    :isPlaying="this.playing"
                    :duration="this.durationSeconds"
                    :position="this.currentSeconds"
                    :sourceDescription="this.sourceDescription"
                />
            </div>
        </div>
        <!-- Download (do not show on small devices) -->
        <p class="control is-hidden-mobile">
            <button
                class="button"
                v-show="!showVolume"
                @click.prevent="download"
                title="Download"
            >
                <Icon name="download" />
            </button>
        </p>
        <!-- Mute (do not show on small devices, user still can use the volume) -->
        <p class="control is-hidden-mobile">
            <button
                :class="{
                    button: true,
                }"
                v-show="!showVolume"
                @click.prevent="toggleMuted"
                title="Mute"
            >
                <Icon v-if="!muted" name="unmuted" />
                <Icon v-else name="muted" />
            </button>
        </p>
        <!-- Volume (do not show on small devices, user still can use the device volume) -->
        <p
            class="control is-hidden-mobile"
            :class="{
                control: true,
                'is-hidden-mobile': true,
                'mr-0': showVolume /* Use no margin right to remove the otherwise used compensation for the rounded corners */,
            }"
        >
            <button
                :class="{
                    button: true,
                    'volume-button-expanded': showVolume,
                    'has-right-radius': showVolume,
                }"
                @click.prevent=""
                @mouseenter="showVolume = true"
                @mouseleave="showVolume = false"
                :title="volumeTitle"
            >
                <Icon name="volume" />
                <input
                    :value="this.volume"
                    v-if="showVolume"
                    class="player-volume"
                    type="range"
                    inputmode="numeric"
                    min="0"
                    max="100"
                    @change="
                        $emit('update:volume', parseInt($event.target.value))
                    "
                />
            </button>
        </p>
        <!-- Play mode -->
        <p class="control">
            <PlaybackModeButton v-model="this.playbackMode" />
        </p>
    </div>
</template>

<script lang="ts">
import CompilationHandler from '@/store/compilation-handler';
import { defineComponent } from 'vue';
import Icon from '@/components/icons/Icon.vue';
import PlayerTime from '@/components/PlayerTime.vue';
import PlaybackModeButton from '@/components/PlaybackModeButton.vue';
import LongLine from '@/components/LongLine.vue';
import { PlaybackMode } from '@/store/compilation-types';
import AudioUtil from '@/code/audio/AudioUtil';

/** A UI representation for a media player
 * @remarks Handles and emits various states and event for playback control.
 */
export default defineComponent({
    name: 'PlayerChrome',
    components: { Icon, PlayerTime, PlaybackModeButton, LongLine },
    emits: [
        'stop',
        /** Flags, whether the UI represents the playing (true) or the paused (false) state
         */
        'update:playing',
        'update:playbackMode',
        'update:currentSeconds',
        'update:volume',
        'update:muted',
        'seek',
        'download',
        'mute',
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
        /** The volume in [percent]
         * @remarks Implements a two-way binding */
        volume: {
            type: Number,
            default: 50,
        },
        /** Whether the player is currently playing
         * @remarks Implements a two-way binding */
        playing: {
            type: Boolean,
            default: false,
        },
        /** Whether the player is currently muted
         * @remarks Implements a two-way binding */
        muted: {
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
            type: MediaError,
            default: null,
        },
    },
    data: () => ({
        showVolume: false,
        playbackMode: PlaybackMode.PlayTrack,
    }),

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
         * @remarks Calculates the witdh with respect to the progress bar width from the player styles (which is a border)
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
         * @remarks Omits the hour part, if not appliccable
         */
        currentDisplayTime(): string {
            return CompilationHandler.convertToDisplayTime(this.currentSeconds);
        },
        /** Converts the track duration into a conveniently displayable hh:mm:ss.s format.
         * @remarks Omits the hour part, if not appliccable
         */
        durationDisplayTime(): string {
            return CompilationHandler.convertToDisplayTime(
                this.durationSeconds,
            );
        },
        volumeTitle(): string {
            return `Volume (${this.volume}%)`;
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
        download() {
            this.$emit('download');
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

        toggleMuted() {
            const muted = !this.muted;
            console.debug(
                `PlayerChrome(${this.title})::toggleMuted:muted:${muted}`,
            );
            this.$emit('update:muted', muted);
            this.$emit('mute', muted);
        },
    },
    watch: {
        playbackMode() {
            console.debug(
                `PlayerChrome(${this.title})::updatePlaybackMode:playbackMode:${this.playbackMode}`,
            );
            this.$emit('update:playbackMode', this.playbackMode);
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
