<template>
    <!-- Placeholder for an unloaded track -->
    <div v-if="!loaded" class="field player-panel is-fullwidth">
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
    <!-- Playback control when the track is loaded -->
    <div v-else class="field has-addons player-panel">
        <!-- Create Cue -->
        <p class="control">
            <Hotkey :keys="['insert']" v-slot="{ clickRef }">
                <button
                    :class="{
                        button: true,
                        'is-warning': true,
                    }"
                    @click.prevent="$emit('newCueTriggered')"
                    :ref="clickRef"
                    title="Create a cue now (at the current playback time)!"
                >
                    <BaseIcon name="plus" />
                    <span class="is-hidden-mobile">Create Cue!</span>
                </button>
            </Hotkey>
        </p>
        <!-- Play/Pause (Only available when the track is loaded, and no playback request is outstanding) -->
        <p class="control">
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
                    :isFading="isFading"
                    :isPlaying="playing"
                    :sourceDescription="sourceDescription"
                    :duration="durationSeconds"
                    :position="currentSeconds"
                />
            </div>
        </div>
        <!-- Play mode -->
        <p class="control">
            <PlaybackModeButton
                :modelValue="playbackMode"
                @update:modelValue="updatePlaybackMode"
            />
        </p>
    </div>
</template>

<script lang="ts">
import CompilationHandler from '@/store/compilation-handler';
import { defineComponent, PropType } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import PlayerTime from '@/components/PlayerTime.vue';
import LongLine from '@/components/LongLine.vue';
import AudioUtil from '@/code/audio/AudioUtil';
import { Hotkey } from '@simolation/vue-hotkey';
import PlaybackModeButton from '@/components/PlaybackModeButton.vue';
import { PlaybackMode } from '@/store/compilation-types';

/** A UI representation for a media player
 * @remarks Handles and emits various states and event for playback control.
 */
export default defineComponent({
    name: 'CueTrigger',
    components: {
        BaseIcon,
        PlayerTime,
        LongLine,
        Hotkey,
        PlaybackModeButton,
    },
    emits: [
        'update:playing',
        'update:currentSeconds',
        'seek',
        /** Emitted, when the represents the playing state
         * @remarks This is emitted in conjunction with the 'update:playing' event
         */
        'play',
        /** Emitted, when the represents the paused state
         * @remarks This is emitted in conjunction with the 'update:playing' event
         */
        'pause',
        'newCueTriggered',
        'update:playbackMode',
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
    data: () => ({}),

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
    },
    methods: {
        /** Updates the playback mode to a new value */
        updatePlaybackMode(playbackMode: PlaybackMode) {
            this.$emit('update:playbackMode', playbackMode);
        },

        seekByClick(e: MouseEvent) {
            console.debug(`CueTrigger(${this.title})::seekByClick`, e);
            if (!this.loaded) return;

            const bounds = (e.target as HTMLDivElement).getBoundingClientRect();
            const seekPos = (e.clientX - bounds.left) / bounds.width;

            const seekTime = this.durationSeconds * seekPos;
            this.$emit('update:currentSeconds', seekTime);
            this.$emit('seek', seekTime);
        },

        togglePlayback() {
            const playback = !this.playing;
            console.debug(
                `CueTrigger(${this.title})::togglePlayback:playback:${playback}`,
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
/** The disabled button without special background */
.button[disabled] {
    background-color: #3a3f44;
}
</style>
