<template>
    <div class="track is-together-print has-navbar-fixed-bottom">
        <!-- Handle all relevant events here
    Note: A check for the active track is done in the handler methods. 
    A v-if here would work, but would register the events not in a useful order. -->
        <ReplayerEventHandler
            @backtocue="goToSelectedCue"
            @tonextcue="goToSelectedCue"
            @topreviouscue="goToSelectedCue"
            @tomnemoniccue="goToSelectedCue"
            @toggleplayback="togglePlayback"
            @rewind1sec="rewindOneSecond"
            @forward1sec="forwardOneSecond"
            @volumedown="volumeDown"
            @volumeup="volumeUp"
        />

        <!-- Each track is an item in a list and contains all the cues -->
        <!-- Track header, including artist info, expansion-toggler and adaptive spacing -->
        <TrackHeaderEdit
            v-if="isEditable"
            :track="track"
            :isPlaying="isPlaying"
            :isTrackLoaded="isTrackLoaded"
            :isActive="isActiveTrack"
        />
        <!-- <TrackHeader
            v-else
            :track="track"
            :isPlaying="isPlaying"
            :isTrackLoaded="isTrackLoaded"
            :isEditable="isEditable"
            :isActive="isActiveTrack"
        /> -->
        <TrackHeader
            v-else
            :track="track"
            :isCollapsible="false"
            :isPlaying="isPlaying"
            :isTrackLoaded="true"
            :isActive="isActiveTrack"
        >
            <template v-slot:left-start>
                <div class="level-item is-narrow">
                    <PlayPauseButton
                        :isPlaying="isPlaying"
                        :isLoading="isFading"
                        @click="skipToPlayPause()"
                        title="play"
                    />
                </div>
            </template>
            <template v-slot:left-end>
                <TimeDisplay
                    class="level-item is-narrow is-hidden-mobile is-size-7"
                    :modelValue="track?.Duration"
                    :hidePlaceholder="true"
                ></TimeDisplay>
            </template>
        </TrackHeader>

        <!-- The audio player, but only once the source is available from the store
            Note: The mediaUrl property (the actual src attribute in the underlying media
            element) is also depending 
            on the track state as a performance optimizations
            -->
        <template v-if="mediaUrl">
            <Teleport to="#media-player">
                <!-- This player is only hidden via v-show (not removed via v-if) when this track is not the active track, to keep the reference alive -->
                <!-- //TODO currently the mediaUrl is not using the optimized
                variant, because otherwise the track is not correctly loaded
                after it has become the active track ( gets
                play-request-was-interrupted) -->
                <div
                    v-show="isActiveTrack"
                    :class="{
                        section: true,
                        'has-background-grey-dark': true,
                        'is-fullscreen': isTrackPlayerFullScreen,
                    }"
                >
                    <TrackAudioApiPlayer
                        :isEditable="isEditable"
                        ref="playerReference"
                        :title="track?.Name"
                        :mediaUrl="mediaUrl"
                        @timeupdate="updateTime"
                        @durationChanged="calculateCueDurations"
                        v-model:isPlaying="isPlaying"
                        @update:isFading="updateFading"
                        @update:playbackMode="updatedPlaybackMode"
                        :playbackMode="track.PlaybackMode"
                        :loopStart="selectedCue?.Time"
                        :loopEnd="selectedCue?.Time + selectedCue?.Duration"
                        :sourceDescription="track?.Url"
                        @update:volume="updatedVolume"
                        :volume="track.Volume"
                    ></TrackAudioApiPlayer>
                    <!-- Track playback controls -->
                    <nav class="level">
                        <!-- Left side -->
                        <div class="level-left">
                            <!-- Title and Artist of the currently playing track-->
                            <div
                                class="level-item is-justify-content-left has-cropped-text"
                            >
                                <div>
                                    <p
                                        class="is-size-4"
                                        :class="{
                                            'has-text-success': isActiveTrack,
                                        }"
                                    >
                                        <TrackTitleName
                                            :track="track"
                                        ></TrackTitleName>
                                    </p>

                                    <!-- Artist info (don't show on small devices, keep at end to keep the appearance calm)-->
                                    <p class="is-size-7 is-hidden-mobile">
                                        <ArtistInfo :track="track" />&nbsp;
                                        <!--nbsp as placeholder to keep layout when no artist info -->
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Right side -->
                        <div class="level-right">
                            <div
                                class="level-item is-unselectable is-hidden-mobile"
                            >
                                <div>
                                    <p>
                                        <PlayheadSlider
                                            v-model.number="currentSeconds"
                                            @update:modelValue="
                                                (position) =>
                                                    trackPlayerInstance?.seekTo(
                                                        position,
                                                    )
                                            "
                                            :track="track"
                                        ></PlayheadSlider>
                                    </p>
                                    <p
                                        class="is-size-7 has-cropped-text has-text-warning"
                                        style="max-width: 260px"
                                    >
                                        <span>
                                            {{ playingCueDescription }} &nbsp;
                                        </span>
                                    </p>
                                </div>
                            </div>
                            <div class="level-item">
                                <div class="is-grouped">
                                    <MediaControlsBar
                                        @stop="stop()"
                                        :hasPreviousTrack="hasPreviousTrack"
                                        @previousTrack="$emit('previousTrack')"
                                        :hasPreviousCue="hasPreviousCue"
                                        @previousCue="toPreviousCue()"
                                        :hasNextCue="hasNextCue"
                                        @nextCue="toNextCue()"
                                        :hasNextTrack="hasNextTrack"
                                        @nextTrack="$emit('nextTrack')"
                                        :playbackMode="track.PlaybackMode"
                                        @update:playbackMode="
                                            updatedPlaybackMode
                                        "
                                        :volume="track.Volume"
                                        @update:volume="updatedVolume"
                                        @seek="(seconds) => seek(seconds)"
                                        :isPlaying="isPlaying"
                                        :isFading="isFading"
                                        @togglePlaying="skipToPlayPause()"
                                    >
                                        <!-- the zoom (Full-Screen) button -->
                                        <button
                                            v-if="!isTrackPlayerFullScreen"
                                            class="button"
                                            @click="
                                                toggleTrackPlayerFullScreen()
                                            "
                                            title="toggle full-screen mode"
                                        >
                                            <BaseIcon name="fullscreen" />
                                        </button>
                                        <button
                                            v-else
                                            class="button"
                                            @click="
                                                toggleTrackPlayerFullScreen()
                                            "
                                            title="toggle full-screen mode"
                                        >
                                            <BaseIcon name="fullscreen-exit" />
                                        </button>
                                    </MediaControlsBar>
                                </div>
                            </div>
                            <div
                                class="level-item is-unselectable is-hidden-tablet"
                            >
                                <div
                                    style="
                                        flex: 0 0 100%; /* Let it fill the entire space horizontally */
                                    "
                                >
                                    <p
                                        class="is-size-7 has-cropped-text has-text-warning"
                                        style="max-width: 260px"
                                    >
                                        <span>
                                            {{ playingCueDescription }} &nbsp;
                                        </span>
                                    </p>
                                    <p>
                                        <PlayheadSlider
                                            v-model.number="currentSeconds"
                                            @update:modelValue="
                                                (position) =>
                                                    trackPlayerInstance?.seekTo(
                                                        position,
                                                    )
                                            "
                                            :track="track"
                                            :showDuration="false"
                                            :showPosition="false"
                                        ></PlayheadSlider>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </nav>
                    <!-- For performance and layout reasons, only render this when used, on wider screens -->
                    <IfMedia query="(min-width: 1024px)">
                        <nav>
                            <CueButtonsBar
                                v-if="!isTrackPlayerFullScreen"
                                :currentSeconds="currentSeconds"
                                :isTrackPlaying="isPlaying"
                                @click="
                                    (cue) => {
                                        cueClick(cue);
                                    }
                                "
                                :track="track"
                            ></CueButtonsBar>
                        </nav>
                    </IfMedia>
                    <template v-if="isTrackPlayerFullScreen">
                        <nav>
                            <CueButtonsField
                                :currentSeconds="currentSeconds"
                                :isTrackPlaying="isPlaying"
                                @click="
                                    (cue) => {
                                        cueClick(cue);
                                    }
                                "
                                :track="track"
                            ></CueButtonsField>
                        </nav>
                    </template>
                </div>
            </Teleport>
        </template>

        <!-- The cue buttons (in edit mode) -->
        <template v-if="isEditable">
            <!-- Create Cue (With Hotkey for the active track)
                Creating a cue should also work when invoked from inside a 
                textbox, thus explicitly no elements are excluded.
                NOTE: Using the ":enabled" property on Hotkey does not work
                See https://github.com/Simolation/vue-hotkey/issues/2 -->
            <Hotkey
                v-if="isActiveTrack"
                :keys="['insert']"
                :excluded-elements="[]"
                v-slot="{ clickRef }"
            >
                <button
                    :class="{
                        button: true,
                        'is-warning': true,
                    }"
                    @click.prevent="createNewCue()"
                    :ref="clickRef"
                    title="Create a cue now (at the current playback time)!"
                >
                    <BaseIcon name="plus" />
                    <span>Create Cue! [INSERT]</span>
                </button>
            </Hotkey>
            <button
                v-else
                :class="{
                    button: true,
                    'is-warning': true,
                }"
                @click.prevent="createNewCue()"
                title="Create a cue now (at the current playback time)!"
            >
                <BaseIcon name="plus" />
                <span>Create Cue!</span>
            </button>

            <ul class="levels">
                <template v-for="cue in cues" :key="cue.Id">
                    <li>
                        <CueLevel
                            :disabled="!mediaUrl || !isTrackLoaded"
                            :cue="cue"
                            :isTrackPlaying="isPlaying"
                            :currentSeconds="currentSeconds"
                            @click="cueClick(cue)"
                            @play="cuePlay(cue)"
                        />
                    </li>
                </template>
            </ul>
        </template>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    Track,
    ICue,
    TrackDisplayMode,
    PlaybackMode,
} from '@/store/compilation-types';
import CueLevel from '@/components/CueLevel.vue';
import TrackAudioApiPlayer from '@/components/TrackAudioApiPlayer.vue';
import { MediaUrl } from '@/store/state-types';
import { MutationTypes } from '@/store/mutation-types';
import ReplayerEventHandler from '@/components/ReplayerEventHandler.vue';
import TrackHeaderEdit from '@/components/TrackHeaderEdit.vue';
import CueButtonsBar from '@/components/CueButtonsBar.vue';
import CueButtonsField from '@/components/CueButtonsField.vue';
import MediaControlsBar from '@/components/MediaControlsBar.vue';
import TrackHeader from '@/components/TrackHeader.vue';
import PlayPauseButton from '@/components/buttons/PlayPauseButton.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import CompilationHandler from '@/store/compilation-handler';
import { settingsMixin } from '@/mixins/settingsMixin';
import NoSleep from 'nosleep.js';
import { ActionTypes } from '@/store/action-types';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { Hotkey } from '@simolation/vue-hotkey';
import PlayheadSlider from '@/components/PlayheadSlider.vue';
import TrackTitleName from './TrackTitleName.vue';
import ArtistInfo from './ArtistInfo.vue';
import IfMedia from '@/components/IfMedia.vue';

/** Displays a track tile with a title, and a panel with a dedicated media player and the cue buttons for it.
 * @remarks The panel is initially collapsed and no media is loaded into the player, as a performance optimization.
 * Details:
 * - The collapsed panel is not removed from the DOM because of issues with the $ref handling in conjunction with v-if
 * - However, the player's src property is only set when actually used to keep the memory footprint low.
 * @remarks Also handles the common replayer events for tracks
 */
export default defineComponent({
    name: 'Track',
    components: {
        CueLevel,
        TrackAudioApiPlayer,
        ReplayerEventHandler,
        TrackHeader,
        TrackHeaderEdit,
        PlayPauseButton,
        BaseIcon,
        TimeDisplay,
        Hotkey,
        PlayheadSlider,
        CueButtonsBar,
        CueButtonsField,
        MediaControlsBar,
        TrackTitleName,
        ArtistInfo,
        IfMedia,
    },
    emits: [
        /** Occurs, when the previous track should be set as the active track
         * @remarks allows track navigation from within a track.
         */
        'previousTrack',
        /** Occurs, when the next track should be set as the active track
         * @remarks allows track navigation from within a track.
         */
        'nextTrack',
        /** Occurs, when the next track should be set as the active track
         * @remarks allows track navigation from within a track.
         */
        'update:isTrackPlayerFullScreen',
    ],
    mixins: [settingsMixin],
    props: {
        /** The track to display
         * @remarks One of track or trackId is required.
         */
        track: {
            type: Track,
            required: true,
        },

        /** Whether this track has a previous track
         */
        hasPreviousTrack: {
            type: Boolean,
            default: false,
        },
        /** Whether this track has a next track
         */
        hasNextTrack: {
            type: Boolean,
            default: false,
        },

        /** The display mode of this track.
         * @devdoc Allows to reuse this component for more than one DisplayMode.
         * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        displayMode: {
            type: String as () => TrackDisplayMode,
            default: TrackDisplayMode.Collapsible,
        },
        /** Whether to show the track player widget in full screen mode */
        isTrackPlayerFullScreen: {
            type: Boolean,
            default: false,
        },
    },
    unmounted() {
        this.deactivateWakeLock();
    },
    data() {
        return {
            /** The playback progress in the current track, in [seconds]
             * @remarks This is used for track progress display within the set of cues
             */
            currentSeconds: 0,
            /** Flag to indicate whether the player has it's track loaded.
             * @remarks This is used to toggle playback button states
             */
            isTrackLoaded: false,

            /** Flag to indicate whether the player is currently playing
             */
            isPlaying: false,

            /** The wake lock fill-in that can prevent screen timeout, while a track is in use */
            noSleep: new NoSleep(),
            /** Readonly flag to indicate whether the player is currently fading */
            isFading: false,
        };
    },
    methods: {
        toggleTrackPlayerFullScreen(): void {
            this.$emit(
                'update:isTrackPlayerFullScreen',
                !this.isTrackPlayerFullScreen,
            );
        },
        stop(): void {
            this.trackPlayerInstance.stop();
            this.$store.commit(MutationTypes.UPDATE_SELECTED_CUE_ID, null);
        },
        toPreviousCue(): Promise<void> {
            return new Promise((resolve, reject) => {
                const selectedCueId = this.$store.getters
                    .selectedCueId as string;

                if (selectedCueId) {
                    const indexOfSelected =
                        this.allActiveTrackCueIds.indexOf(selectedCueId);
                    const prevCueId =
                        this.allActiveTrackCueIds[indexOfSelected - 1];
                    const previousCue = this.track.Cues.filter(
                        (cue) => cue.Id === prevCueId,
                    )[0];
                    if (previousCue && previousCue.Time != null) {
                        this.cueClick(previousCue, false);
                        resolve();
                    } else {
                        reject('No previous cue or no cue time available.');
                    }
                }
            });
        },
        toNextCue(): Promise<void> {
            return new Promise((resolve, reject) => {
                const selectedCueId = this.$store.getters
                    .selectedCueId as string;

                if (selectedCueId) {
                    const indexOfSelected =
                        this.allActiveTrackCueIds.indexOf(selectedCueId);
                    const nextCueId =
                        this.allActiveTrackCueIds[indexOfSelected + 1];
                    const nextCue = this.track.Cues.filter(
                        (cue) => cue.Id === nextCueId,
                    )[0];
                    if (nextCue && nextCue.Time != null) {
                        this.cueClick(nextCue, false);
                        resolve();
                    } else {
                        reject('No previous cue or no cue time available.');
                    }
                }
            });
        },
        /** Skips to this track
         * @remarks If the track is not yet active, tries to activate the track (which will autoplay).
         * If it's the active track, just toggles play/pause
         */
        skipToPlayPause(): void {
            if (!this.isActiveTrack) {
                //TODO make this the active track without using a cue (include an active track in the store, without the need of a selected cue)
                const firstCue = this.track.Cues[0];
                if (firstCue) {
                    this.cuePlay(firstCue);
                }
            } else {
                this.trackPlayerInstance.togglePlayback();
            }
        },
        /** Activates the wake lock (if enabled in settings)
         * @devdoc Uses a wake-lock fill in, because this feature is not yet available on all browsers
         */
        activateWakeLock(): void {
            if (this.getSettings.preventScreenTimeout) {
                if (!this.noSleep.isEnabled) {
                    this.noSleep.enable();
                }
            }
        },
        /** Deactivates the wake lock (if enabled in settings)
         * @devdoc Uses a wake-lock fill in, because this feature is not yet available on all browsers
         */
        deactivateWakeLock(): void {
            if (this.getSettings.preventScreenTimeout) {
                if (this.noSleep.isEnabled) {
                    this.noSleep.disable();
                }
            }
        },

        togglePlayback() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance?.togglePlayback();
                this.activateWakeLock();
            }
        },
        rewindOneSecond() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance?.rewindOneSecond();
                this.activateWakeLock();
            }
        },
        forwardOneSecond() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance?.forwardOneSecond();
                this.activateWakeLock();
            }
        },
        seek(seconds: number): void {
            this.trackPlayerInstance.seekToSeconds(
                this.currentSeconds + seconds,
            );
        },
        volumeDown() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance?.volumeDown();
                this.activateWakeLock();
            }
        },
        volumeUp() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance?.volumeUp();
                this.activateWakeLock();
            }
        },
        volume(volume: number) {
            if (this.isActiveTrack) {
                this.trackPlayerInstance?.updateVolume(volume);
                this.activateWakeLock();
            }
        },

        /** Pauses playback and seeks to the currently selected cue's position, but only
         * if this track is the active track (i.e. the selected cue is within this track)
         */
        goToSelectedCue() {
            /*Check for the active track here (again), because otherwise some event handling
            sequences might cause actions on non-active tracks too.*/
            if (this.isActiveTrack) {
                const selectedCueId = this.$store.getters
                    .selectedCueId as string;
                if (selectedCueId) {
                    const cueTime = this.cues?.filter(
                        (c) => c.Id === selectedCueId,
                    )[0]?.Time;

                    //Control playback according to the play state, using a single operation.
                    //This supports a possible fade operation.
                    //For the cue time, handle all non-null values (Zero is valid)
                    if (this.trackPlayerInstance?.playing === true) {
                        if (cueTime != null) {
                            this.trackPlayerInstance?.pauseAndSeekTo(cueTime);
                        } else {
                            this.trackPlayerInstance?.pause();
                        }
                    } else {
                        if (cueTime != null) {
                            this.trackPlayerInstance?.seekTo(cueTime);
                        }
                    }
                    this.activateWakeLock();
                }
            }
        },
        /** Handle playback mode updates
         * @devdoc Handled here as part of the track because the playback mode is
         * essentially a property of the track, not of the player or the player chrome.
         */
        updatedPlaybackMode(playbackMode: PlaybackMode): void {
            console.debug(
                `Track(${this.track.Name})::updatedPlaybackMode:${playbackMode}`,
            );

            const trackId = this.track.Id;
            this.$store.commit(MutationTypes.UPDATE_TRACK_PLAYBACK_MODE, {
                trackId,
                playbackMode,
            });
        },
        /** Handle track volume updates
         * @devdoc Handled here as part of the track because the track volume is
         * essentially a property of the track, not of the player or the player chrome.
         */
        updatedVolume(volume: number): void {
            console.debug(`Track(${this.track.Name})::updatedVolume:${volume}`);

            const trackId = this.track.Id;
            this.$store.commit(MutationTypes.UPDATE_TRACK_VOLUME, {
                trackId,
                volume: volume,
            });
        },

        /** Handles the click of a cue button, by seeking to it and, optionally, toggling playback
         * @param cue The cue to handle
         * @param togglePlayback Whether to toggle playback. Optional, defaults to true
         * @devdoc Click invocations by the ENTER key are explicitly not handeled here. These should not get handeled by the keyboard shortcut engine.
         */
        cueClick(cue: ICue, togglePlayback = true) {
            console.debug(`Track(${this.track.Name})::cueClick:cue:`, cue);
            if (cue.Time != null) {
                //Update the selected cue to this cue
                this.$store.commit(
                    MutationTypes.UPDATE_SELECTED_CUE_ID,
                    cue.Id,
                );

                //Set the position to this cue and handle playback
                const isPlaying = this.trackPlayerInstance?.playing;
                console.debug(
                    `Track(${this.track.Name})::cueClick:isPlaying:`,
                    isPlaying,
                );
                if (togglePlayback) {
                    if (isPlaying === true) {
                        this.trackPlayerInstance?.pauseAndSeekTo(cue.Time);
                    } else {
                        this.trackPlayerInstance?.playFrom(cue.Time);
                    }
                } else {
                    this.trackPlayerInstance?.seekTo(cue.Time);
                }
                this.activateWakeLock();
            }
        },
        /** Handles the play event of a cue button, by immediately restarting playback at the cue (instead of toggling)
         * @devdoc Click invocations by the ENTER key are explicitly not handeled here. These should not get handeled by the keyboard shortcut engine.
         */
        cuePlay(cue: ICue) {
            console.debug(`Track(${this.track.Name})::cueClick:cue:`, cue);
            if (cue.Time != null) {
                //Update the selected cue to this cue
                this.$store.commit(
                    MutationTypes.UPDATE_SELECTED_CUE_ID,
                    cue.Id,
                );

                //Set the position to this cue and handle playback
                if (this.trackPlayerInstance?.playing === true) {
                    this.trackPlayerInstance?.seekTo(cue.Time); //keep playing
                } else {
                    this.trackPlayerInstance?.playFrom(cue.Time);
                }
                this.activateWakeLock();
            }
        },
        /** Handles the request for a new cue by creating one for the current time
         */
        createNewCue(): void {
            const time = this.currentSeconds;
            const trackId = this.track.Id;
            const payload = { trackId, time };
            console.debug(
                `Track(${this.title})::createNewCue:playback:${time}`,
            );
            this.$store.dispatch(ActionTypes.ADD_CUE, payload);
        },

        /** Updates the current seconds property with the temporal position of the track audio player
         * @remarks This is used to control the cue display for this track's cues
         */
        updateTime(currentTime: number) {
            this.currentSeconds = currentTime;
        },

        updateFading(fading: boolean) {
            this.isFading = fading;
        },

        /** Updates the track duration and calculates the cue durations */
        calculateCueDurations(trackDurationSeconds: number) {
            this.isTrackLoaded = true;
            const trackId = this.track.Id;
            this.$store.commit(MutationTypes.UPDATE_DURATIONS, {
                trackId,
                trackDurationSeconds,
            });
        },
    },

    watch: {
        /** Handles changes in whether this is the active track.
         * @remarks When this ceases to be the active track, pause playback.
           This avoids having multiple tracks playing at the same time.
         */
        isActiveTrack(val, oldVal) {
            console.debug(`Track(${this.track.Name})::isActiveTrack:val:`, val);
            //Pause no more active track
            if (oldVal === true && val === false) {
                this.trackPlayerInstance?.pause();
            }

            if (val == false) {
                this.deactivateWakeLock();
            }
            if (val == true) {
                this.activateWakeLock();
            }
        },
        /** Handles changes in whether this track is playing.
         * @remarks This activates the wake lock, when playing starts.
         */
        isPlaying(val) {
            console.debug(`Track(${this.track.Name})::isPlaying:val:`, val);
            if (val) {
                this.activateWakeLock();
            }
        },
    },
    computed: {
        /** The description of the currently playing cue
         * @remarks The implementation makes sure that at least always an empty string is returned.
         * Combined with an &nbsp;, this avoids layout flicker.
         */
        playingCueDescription(): string {
            const description = this.playingCue?.Description;

            if (description) {
                return description;
            }
            return '';
        },

        /** Whether the playing cue has a previous cue
         */
        hasPreviousCue(): boolean {
            return this.allActiveTrackCueIds[0] !== this.selectedCue?.Id;
        },
        /** Whether the playing cue has a next cue
         */
        hasNextCue(): boolean {
            return (
                this.allActiveTrackCueIds.slice(-1)[0] !== this.selectedCue?.Id
            );
        },

        allActiveTrackCueIds(): string[] {
            return this.cues?.map((cue) => cue.Id) ?? [];
        },
        /** Gets the currently playing cue, if available
         */
        playingCue(): ICue | null {
            return (
                this.track.Cues.filter(
                    (cue) =>
                        cue.Time !== null &&
                        this.currentSeconds >= cue.Time &&
                        this.currentSeconds < cue.Time + (cue.Duration ?? 0),
                )[0] ?? null
            );
        },

        /** Whether this component shows editable inputs for the contained data
         * @devdoc Allows to reuse this component for more than one display mode.
         */
        isEditable(): boolean {
            return this.displayMode === TrackDisplayMode.Edit;
        },

        /** Whether this component shows non-collapsible playback buttons
         * @devdoc Allows to reuse this component for more than one display mode.
         */
        isPlayable(): boolean {
            return this.displayMode === TrackDisplayMode.Play;
        },

        /** Gets a reference to the player instance.
         * @devdoc $ref's are non-reactive, see https://v3.vuejs.org/api/special-attributes.html#ref
         * Thus, referencing an instance after it has been removed from the DOM (e.g. by v-if)
         * does not work, even after it's rendered again later.
         */
        trackPlayerInstance(): InstanceType<typeof TrackAudioApiPlayer> {
            return this.$refs.playerReference as InstanceType<
                typeof TrackAudioApiPlayer
            >;
        },

        selectedCue(): ICue {
            return this.$store.getters.selectedCue as ICue;
        },
        /** Gets the media object URL, if available
         */
        mediaUrl(): string | undefined {
            return this.trackMediaUrl?.url;
        },

        /** Gets the media object URL, if available,
         * and optimized for the active track state
         * @remarks To save memory in the audio elements,
         * an URL is only provided when
         * the player is actually in the currently active track
         */
        optimizedMediaUrl(): string | undefined {
            if (this.isActiveTrack) {
                return this.trackMediaUrl?.url;
            } else {
                return undefined;
            }
        },

        cues(): Array<ICue> | undefined {
            return this.track.Cues;
        },

        /** Returns the media URL (playable file content) for a track's file name
         * @remarks if available, the tracks from a compilation package are used, otherwise the
         * files are to be loaded from the file system or from the internet
         */

        trackMediaUrl(): MediaUrl | null {
            const mediaUrls = this.$store.getters.mediaUrls as Map<
                string,
                MediaUrl
            >;
            let mediaUrl = CompilationHandler.getMatchingPackageMediaUrl(
                this.track?.Url,
                mediaUrls,
            );
            return mediaUrl;
        },
        /** Determines whether this is the active track (i.e. the globally selected cue is from this track ) */
        isActiveTrack(): boolean {
            const selectedCueId = this.$store.getters.selectedCueId as string;
            if (!selectedCueId) {
                //if none selected, this track is not active anyway
                return false;
            }

            //Check for matching Ids
            return (
                (this.cues?.filter((c) => c.Id === selectedCueId).length ?? 0) >
                0
            );
        },
    },
});
</script>
<style lang="scss" scoped>
.track .buttons {
    /** The track's cue button have also an additional small margin at their end.
    This results in a similar space between level, player, cue buttons and the
    end of the track */
    margin-bottom: 4px;
}

.track .levels {
    /** The track's cue levels have also an additional small margin at their top.
    This results in a similar space between levels as use within 
    the environment      */
    margin-top: 12px;

    /** The track's cue levels have also an additional small margin at their end.
    This results in a similar space between levels as use within 
    the environment      */
    margin-bottom: 12px;
}

// Define an overall width allocation for the playback control level items
.level {
    .level-left {
        flex-basis: calc(100% - 620px);
        .level-item {
            flex-shrink: 1;
        }
    }
    .level-right {
        flex-basis: 620px;
        .level-item {
            flex-shrink: 0;
        }
    }
}

/** A div that occupies full screen */
.is-fullscreen {
    //width is already set on outer container
    // width: 100vw;
    height: 100vh;
}
</style>
