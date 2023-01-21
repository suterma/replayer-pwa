<template>
    <!-- Have some more margin to keep the editing track separate from the other, listed tracks -->
    <div
        class="track is-together-print"
        :class="{
            'mb-5': isEditable && isExpanded,
            'is-active-track': isActiveTrack,
            'is-editable': isEditable,
        }"
    >
        <!-- Handle all relevant events here
    Note: A check for the active track is done in the handler methods. 
    A v-if here would work, but would register the events not in a useful order. -->
        <ReplayerEventHandler
            v-if="isActiveTrack"
            @backtocue="goToSelectedCue"
            @tonextcue="goToSelectedCue"
            @topreviouscue="goToSelectedCue"
            @tomnemoniccue="goToSelectedCue"
            @toggleplayback="togglePlayback"
            @rewind="rewind"
            @forward="forward"
            @volumedown="volumeDown"
            @volumeup="volumeUp"
        />

        <!-- Each track is an item in a list and contains all the cues -->
        <!-- Track header, including artist info, expansion-toggler and adaptive spacing -->
        <TrackHeaderEdit
            v-if="isEditable"
            :isExpanded="isExpanded"
            @update:isExpanded="updateIsExpanded"
            :canCollapse="!isOnlyTrack"
            :trackId="track.Id"
            :trackName="track.Name"
            :trackUrl="track.Url"
            :trackArtist="track.Artist"
            :trackAlbum="track.Album"
            :isPlaying="isPlaying"
            :isTrackLoaded="isTrackLoaded"
            :isTrackMediaAvailable="isMediaAvailable"
            :isActive="isActiveTrack"
            :isFirst="isFirst"
            :isLast="isLast"
        />
        <TrackHeader
            v-else
            :track="track"
            :isPlaying="isPlaying"
            :isTrackLoaded="isTrackLoaded"
            :isTrackMediaAvailable="isMediaAvailable"
            :isActive="isActiveTrack"
            :class="{
                'is-clickable': isTrackLoaded,
                'has-cursor-not-allowed': !isTrackLoaded,
            }"
            @click="skipToPlayPause"
        >
            <template v-slot:left-start>
                <div class="level-item is-narrow">
                    <!-- NOTE: Click handling is already handled at the outer TrackHeader component, thus no (additional)
                    click handler is defined for this button -->
                    <PlayPauseButton
                        :disabled="!isTrackLoaded"
                        :class="{ 'is-success': isActiveTrack }"
                        :isPlaying="isPlaying"
                        :isLoading="isFading"
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

        <!-- The buttons field (for a single track in play mode) -->
        <div
            v-if="isPlayable && isOnlyTrack && hasCues"
            class="transition-in-place"
            :key="track.Id"
        >
            <CueButtonsField
                :currentSeconds="currentSeconds"
                :isTrackPlaying="isPlaying"
                :playbackMode="playbackMode"
                @click="
                    (cue) => {
                        cueClick(cue);
                    }
                "
                :track="track"
            ></CueButtonsField>
        </div>

        <!-- The level editors and playback bar (in edit mode for an expanded track) -->
        <Transition name="item-expand">
            <div v-if="isEditable && isExpanded" :key="track.Id">
                <div class="levels transition-in-place">
                    <TransitionGroup name="list">
                        <div v-for="cue in cues" :key="cue.Id">
                            <CueLevelEditor
                                :disabled="!mediaUrl || !isTrackLoaded"
                                :cue="cue"
                                :isTrackPlaying="isPlaying"
                                :playbackMode="playbackMode"
                                :currentSeconds="currentSeconds"
                                @click="cueClick(cue)"
                                @play="cuePlay(cue)"
                            />
                        </div>
                    </TransitionGroup>
                </div>
                <!-- 
                Track playback bar (In edit mode, this contains:
                - the play/pause-add-cue button combo
                - a wide slider
                - a very limited set of transport controls (no skip buttons)
                    -->
                <nav class="level is-editable is-unselectable">
                    <!-- Left side -->
                    <div class="level-left">
                        <div class="level-item is-justify-content-flex-start">
                            <div class="buttons has-addons mb-0">
                                <PlayPauseButton
                                    class="is-success mb-0"
                                    :isPlaying="isPlaying"
                                    :isLoading="isFading"
                                    @click="skipToPlayPause()"
                                    title="Play from current position"
                                />
                                <CreateCueButton
                                    class="mb-0"
                                    :isActiveTrack="isActiveTrack"
                                    :currentSeconds="currentSeconds"
                                    @createNewCue="createNewCue()"
                                ></CreateCueButton>
                            </div>
                        </div>
                    </div>
                    <!-- A central level item. Margins are set to provide nice-looking spacing at all widths -->
                    <div class="level-item mt-4-mobile">
                        <PlayheadSlider
                            class="is-fullwidth ml-4-tablet mr-4-tablet"
                            v-model.number="currentSeconds"
                            @update:modelValue="
                                (position) =>
                                    trackPlayerInstance?.seekTo(position)
                            "
                            @seek="(seconds) => seek(seconds)"
                            :trackDuration="track.Duration"
                        >
                            <!-- On mobile, the text is cropped at full width minus seek buttons, because of the level's automatic stacking,
                                    on lager viewports the text is cropped to not exceed the dynamic playhead slider -->
                            <p
                                class="is-size-7 has-cropped-text"
                                :class="{
                                    'has-text-success': playingCueIsSelected,
                                    'has-text-warning': !playingCueIsSelected,
                                }"
                            >
                                <span>
                                    {{ playingCueDescription }}
                                    &nbsp;
                                </span>
                            </p>
                        </PlayheadSlider>
                    </div>
                    <div class="level-right">
                        <div class="level-item is-justify-content-flex-end">
                            <div class="is-grouped">
                                <MediaControlsBar
                                    :hideStopButton="true"
                                    :hideTrackNavigation="true"
                                    :hideCueNavigation="true"
                                    :playbackMode="playbackMode"
                                    @update:playbackMode="updatedPlaybackMode"
                                    :volume="track.Volume"
                                    @update:volume="updatedVolume"
                                    :hidePlayPauseButton="true"
                                >
                                </MediaControlsBar>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
        </Transition>

        <!-- The audio player widget (with controls) but only once the source is available from the store
            Note: The mediaUrl property (the actual src attribute in the underlying media
            element) is also depending 
            on the track state as a performance optimizations
            -->
        <template v-if="mediaUrl">
            <!-- //TODO currently the mediaUrl is not using the optimized
                variant, because otherwise the track is not correctly loaded
                after it has become the active track ( gets
                play-request-was-interrupted) -->
            <!-- 
                NOTE: The audio player is not removed via v-if
                when this track is not the active track, to keep the reference alive. 
                Also, fade-out would otherwise be interrupted. -->
            <TrackAudioApiPlayer
                ref="playerReference"
                :title="track?.Name"
                :mediaUrl="mediaUrl"
                @timeupdate="updateTime"
                @durationChanged="calculateCueDurations"
                v-model:isPlaying="isPlaying"
                @update:isFading="updateFading"
                @update:playbackMode="updatedPlaybackMode"
                :playbackMode="playbackMode"
                :loopStart="selectedCue?.Time"
                :loopEnd="selectedCue?.Time + selectedCue?.Duration"
                :sourceDescription="track?.Url"
                @update:volume="updatedVolume"
                :volume="track.Volume"
                @ended="$emit('trackEnded')"
            ></TrackAudioApiPlayer>
            <Teleport to="#media-player" :disabled="isEditable">
                <!-- 
                    In the play view, the player widget is only shown for the active track
                    In the edit view, the player widgets are shown for all expanded tracks -->
                <div
                    v-if="
                        (isPlayable && isActiveTrack) ||
                        (isEditable && isExpanded)
                    "
                    :class="{
                        section: isPlayable,
                        'has-background-grey-dark': isPlayable,
                        'is-fullscreen': isTrackPlayerFullScreen,
                        'has-player-navbar-fixed-top': isTrackPlayerFullScreen,
                        'transition-in-place':
                            isPlayable /* because in playback view, the players are replaced in place, not expanded */,
                    }"
                    :key="track.Id"
                >
                    <!-- 
                        Track playback bar (In play mode, this contains:
                        - a slot for the expander icon (if not the only track)
                        - The title (with artist info)
                        - the play/pause button
                        - a smaller slider
                        - a standard set of transport controls, including cue and track skipping
                         -->
                    <!-- 
                        In full screen, this level is at the top, and not visually separated from the cues -->
                    <nav
                        v-if="isPlayable"
                        class="level"
                        :class="{
                            'section navbar is-fixed-top has-background-grey-dark is-shadowless is-borderless':
                                isTrackPlayerFullScreen,
                        }"
                    >
                        <!-- Left side (with expander, title and artist of the currently playing track; not shown for a single track) -->
                        <div v-if="isOnlyTrack" class="level-left">
                            <!-- empty placeholder -->
                        </div>
                        <div v-else class="level-left">
                            <!-- Title and Artist of the currently playing track-->
                            <div
                                class="level-item is-justify-content-left has-cropped-text"
                            >
                                <!-- Offer the full screen, but not for a single track  -->
                                <CollapsibleButton
                                    :modelValue="isTrackPlayerFullScreen"
                                    @click="toggleTrackPlayerFullScreen()"
                                    title="toggle full-screen mode"
                                    collapsedChevronDirection="up"
                                ></CollapsibleButton>

                                <div class="is-fullwidth">
                                    <p
                                        @click="toggleTrackPlayerFullScreen()"
                                        title="toggle full-screen mode"
                                    >
                                        <!-- Use smaller title in collapsed state, use regular size (4) when full screen -->
                                        <span
                                            :class="{
                                                'has-text-success':
                                                    isActiveTrack,
                                                'is-size-4':
                                                    isTrackPlayerFullScreen,
                                                'is-size-5':
                                                    !isTrackPlayerFullScreen,
                                            }"
                                        >
                                            <TrackTitleName
                                                :track="track"
                                            ></TrackTitleName>
                                        </span>
                                        <!-- Artist info (don't show on small devices)-->
                                        <span class="is-size-7 is-hidden-mobile"
                                            >&nbsp;
                                            <!--nbsp as placeholder to keep layout when no artist info -->
                                            <ArtistInfo :track="track" />
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <!-- Right side -->
                        <div class="level-right">
                            <div class="level-item">
                                <PlayheadSlider
                                    class="is-fullwidth"
                                    v-model.number="currentSeconds"
                                    @update:modelValue="
                                        (position) =>
                                            trackPlayerInstance?.seekTo(
                                                position,
                                            )
                                    "
                                    @seek="(seconds) => seek(seconds)"
                                    :trackDuration="track.Duration"
                                >
                                    <!-- On mobile, the text is cropped at full width minus seek buttons, because of the level's automatic stacking,
                                    on lager viewports the text is strictly cropped to 129px -->
                                    <p
                                        class="is-size-7 has-cropped-text"
                                        :class="{
                                            'has-text-success':
                                                playingCueIsSelected,
                                            'has-text-warning':
                                                !playingCueIsSelected,
                                        }"
                                    >
                                        <span>
                                            {{ playingCueDescription }}
                                            &nbsp;
                                        </span>
                                    </p>
                                </PlayheadSlider>
                            </div>

                            <div class="level-item is-justify-content-flex-end">
                                <div class="is-grouped">
                                    <MediaControlsBar
                                        :hideStopButton="true"
                                        @stop="stop()"
                                        :hideTrackNavigation="false"
                                        :hasPreviousTrack="hasPreviousTrack"
                                        @previousTrack="$emit('previousTrack')"
                                        :hasPreviousCue="hasPreviousCue"
                                        @previousCue="toPreviousCue()"
                                        :hasNextCue="hasNextCue"
                                        @nextCue="toNextCue()"
                                        :hasNextTrack="hasNextTrack"
                                        @nextTrack="$emit('nextTrack')"
                                        :playbackMode="playbackMode"
                                        @update:playbackMode="
                                            updatedPlaybackMode
                                        "
                                        :volume="track.Volume"
                                        @update:volume="updatedVolume"
                                        @seek="(seconds) => seek(seconds)"
                                        :isPlaying="isPlaying"
                                        :isFading="isFading"
                                        @togglePlaying="skipToPlayPause()"
                                        :hidePlayPauseButton="false"
                                    >
                                    </MediaControlsBar>
                                </div>
                            </div>
                        </div>
                    </nav>

                    <!-- When playing back, on the player widget, offer the cue buttons depending on the situation.
                         -->
                    <!-- For performance and layout reasons, only render this when used, on desktop and larger screens -->
                    <IfMedia query="(min-width: 1024px)" v-if="!isOnlyTrack">
                        <nav>
                            <CueButtonsBar
                                v-if="!isTrackPlayerFullScreen && isPlayable"
                                :currentSeconds="currentSeconds"
                                :isTrackPlaying="isPlaying"
                                :playbackMode="playbackMode"
                                @click="
                                    (cue) => {
                                        cueClick(cue);
                                    }
                                "
                                :track="track"
                            ></CueButtonsBar>
                        </nav>
                    </IfMedia>
                    <nav v-if="isTrackPlayerFullScreen">
                        <CueButtonsField
                            :currentSeconds="currentSeconds"
                            :isTrackPlaying="isPlaying"
                            :playbackMode="playbackMode"
                            @click="
                                (cue) => {
                                    cueClick(cue);
                                }
                            "
                            :track="track"
                        ></CueButtonsField>
                    </nav>
                </div>
            </Teleport>
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
import CueLevelEditor from '@/components/CueLevelEditor.vue';
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
import CreateCueButton from '@/components/buttons/CreateCueButton.vue';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import CompilationHandler from '@/store/compilation-handler';
import { settingsMixin } from '@/mixins/settingsMixin';
import NoSleep from 'nosleep.js';
import { ActionTypes } from '@/store/action-types';
import PlayheadSlider from '@/components/PlayheadSlider.vue';
import TrackTitleName from './TrackTitleName.vue';
import ArtistInfo from './ArtistInfo.vue';
import IfMedia from '@/components/IfMedia.vue';
import { mdiChevronDown, mdiChevronUp } from '@mdi/js';
import { Replayer } from './CompilationKeyboardHandler.vue';

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
        CueLevelEditor,
        TrackAudioApiPlayer,
        ReplayerEventHandler,
        TrackHeader,
        TrackHeaderEdit,
        PlayPauseButton,
        TimeDisplay,
        CreateCueButton,
        CollapsibleButton,
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

        /** Occurs, when the user toggles the playback mode */
        'update:playbackMode',
        /** Occurs, when the end of the track has been reached and playback has ended.
         * @remarks This is not triggered when the track or one of it's cue is looping.
         * @remarks Allows to select the next track in "play all" and "shuffle" mode.
         */
        'trackEnded',
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
         * @remarks Skipping can also just loop
         */
        hasPreviousTrack: {
            type: Boolean,
            default: false,
        },
        /** Whether this track has a next track to skip to
         * @remarks Skipping can also just loop
         */
        hasNextTrack: {
            type: Boolean,
            default: false,
        },

        /** Whether this is the only track in the compilation
         * @remarks Is used to visually omit some unnecessary items for a compilation with just a single track
         */
        isOnlyTrack: {
            type: Boolean,
            default: false,
        },
        /** Whether this track is the first track in the set of tracks */
        isFirst: {
            type: Boolean,
            required: true,
        },
        /** Whether this track is the last track in the set of tracks */
        isLast: {
            type: Boolean,
            required: true,
        },

        /** The display mode of this track.
         * @devdoc Allows to reuse this component for more than one DisplayMode.
         * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        displayMode: {
            type: String as () => TrackDisplayMode,
            default: TrackDisplayMode.Play,
        },
        /** Whether to show the track player widget in full screen mode */
        isTrackPlayerFullScreen: {
            type: Boolean,
            default: false,
        },
        /** The playback mode */
        playbackMode: {
            type: String as () => PlaybackMode,
            required: true,
            default: PlaybackMode.PlayTrack,
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

            /** Whether the cues are currently expanded for editing */
            isExpanded: false,

            /** Icons from @mdi/js */
            mdiChevronUp: mdiChevronUp,
            mdiChevronDown: mdiChevronDown,
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
        toPreviousCue() {
            document.dispatchEvent(new Event(Replayer.TO_PREV_CUE));
        },
        toNextCue() {
            document.dispatchEvent(new Event(Replayer.TO_NEXT_CUE));
        },
        /** Skips to this track (if loaded)
         * @remarks If the track is not loaded, does nothing.
         * If the track is not yet the active track, tries to activate the track (which will autoplay).
         * If it's the active track, just toggles play/pause
         * @devdoc Conditional event registration inside the template did not work.
         */
        skipToPlayPause(): void {
            if (this.isTrackLoaded) {
                if (!this.isActiveTrack) {
                    this.trackPlay();
                } else {
                    this.togglePlayback();
                }
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
        rewind() {
            if (this.isActiveTrack) {
                this.seek(-5);
            }
        },
        forward() {
            if (this.isActiveTrack) {
                this.seek(+5);
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
         */
        updatedPlaybackMode(playbackMode: PlaybackMode): void {
            this.$emit('update:playbackMode', playbackMode);
        },
        /** Handle isExpended update
         */
        updateIsExpanded(isExpanded: boolean): void {
            this.isExpanded = isExpanded;
            console.debug(
                `Track(${this.track.Name})::updateIsExpanded:${isExpanded}`,
            );
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
            if (cue.Time != null && Number.isFinite(cue.Time)) {
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
         * @devdoc Click invocations by the ENTER key are explicitly not handled here. These should not get handled by the keyboard shortcut engine.
         */
        cuePlay(cue: ICue) {
            console.debug(`Track(${this.track.Name})::cuePlay:cue:`, cue);
            if (cue.Time != null && Number.isFinite(cue.Time)) {
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
        /** Handles the play event of a button, by immediately restarting playback at the beginning of the track (instead of toggling)
         * @devdoc Click invocations by the ENTER key are explicitly not handled here. These should not get handled by the keyboard shortcut engine.
         */
        trackPlay() {
            console.debug(`Track(${this.track.Name})::trackPlay`);

            //Update the track cue to this track
            this.$store.commit(
                MutationTypes.UPDATE_SELECTED_TRACK_ID,
                this.track.Id,
            );

            //Set the position to the beginning and handle playback
            if (this.trackPlayerInstance?.playing === true) {
                this.trackPlayerInstance?.seekTo(0); //keep playing
            } else {
                this.trackPlayerInstance?.playFrom(0);
            }
            this.activateWakeLock();
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
        /** Handles changes of the full screen state
         * @devdoc This hides the scroll bars in the (full screen div's) underlying content
         */
        isTrackPlayerFullScreen(isFullScreen: boolean): void {
            console.debug(
                `Track(${this.track.Name})::isTrackPlayerFullScreen:isFullScreen:`,
                isFullScreen,
            );
            document.documentElement.style.overflowY = isFullScreen
                ? 'clip'
                : 'auto';
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

        /** Whether the currently playing cue is the selected cue
         */
        playingCueIsSelected(): boolean {
            const playingCueId = this.playingCue?.Id;

            if (
                playingCueId != undefined &&
                this.selectedCue?.Id === playingCueId
            ) {
                return true;
            }
            return false;
        },

        /** Whether the playing cue has a previous cue
         */
        hasPreviousCue(): boolean {
            return (
                this.selectedCue &&
                this.allActiveTrackCueIds[0] !== this.selectedCue?.Id
            );
        },
        /** Whether the playing cue has a next cue
         */
        hasNextCue(): boolean {
            return (
                this.selectedCue &&
                this.allActiveTrackCueIds.slice(-1)[0] !== this.selectedCue?.Id
            );
        },

        allActiveTrackCueIds(): string[] {
            return this.cues?.map((cue) => cue.Id) ?? [];
        },

        /** Whether this track has any cue at all */
        hasCues(): boolean {
            return (
                this.cues !== undefined &&
                this.cues.length !== undefined &&
                this.cues.length > 0
            );
        },
        /** Gets the currently playing cue, regardless whether it is selected, if available
         */
        playingCue(): ICue | null {
            return (
                this.track.Cues.filter(
                    (cue) =>
                        cue.Time !== null &&
                        Number.isFinite(cue.Time) &&
                        cue.Duration !== null &&
                        Number.isFinite(cue.Duration) &&
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

        /** Whether the playback media is available
         * @devdoc This is only working for local file paths, not for online URL's, because these are directly fetched from the media element.
         */
        isMediaAvailable(): boolean {
            if (this.mediaUrl) {
                return true;
            }
            return false;
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
        /** Determines whether this is the active track */
        isActiveTrack(): boolean {
            const activeTrackId = this.$store.getters.activeTrack?.Id as string;
            return this.track.Id === activeTrackId;
        },
    },
});
</script>
<style lang="scss" scoped>
/* transitions for a single item */
.item-expand-enter-active,
.item-expand-leave-active {
    transition: all 0.3s ease;
}

.item-expand-enter-from,
.item-expand-leave-to {
    opacity: 0;
    transform-origin: top;
    transform: scaleY(0) translateY(-50%);
}

/* transitions for a list of items */
.list-move, /* apply transition to moving elements */
.list-enter-active,
.list-leave-active {
    transition: all 0.3s ease;
}
.list-enter-from {
    opacity: 0;
    transform: translateX(-32px);
}
.list-leave-to {
    opacity: 0;
    transform: translateX(32px);
}

// Track item styles

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

// Define an overall width allocation for fixed right-hand side of the playback control level items
.level {
    .level-left {
        flex-basis: calc(100% - 560px);
        .level-item {
            flex-shrink: 1;
        }
    }
    .level-right {
        flex-basis: 560px;
        .level-item {
            flex-shrink: 1;
        }
    }
}
// Note: The used width is smaller in edit mode, since there are less buttons on the right side (no track skip, no play/pause)
.level.is-editable {
    .level-left {
        flex-basis: auto;
    }
    .level-right {
        flex-basis: auto;
    }
}

/** A div that occupies full screen */
.is-fullscreen {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    overflow: auto;
}

.is-fullwidth {
    width: 100%;
}

/** 
* Specific width for track sliders depending on breakpoints
* @remarks This allows the use of cropped text for the 
* cue description with dynamic width */
@media screen and (max-width: 768px) {
    /** in Play mode */
    .playhead-slider .has-cropped-text {
        max-width: calc(100vw - 150px);
    }

    .is-editable .playhead-slider .has-cropped-text {
        max-width: calc(100vw - 150px);
    }
}

@media screen and (min-width: 769px) {
    /** in Play mode */
    .playhead-slider .has-cropped-text {
        max-width: 129px;
    }
    .is-editable .playhead-slider .has-cropped-text {
        max-width: calc(100vw - 640px);
    }
}
</style>
