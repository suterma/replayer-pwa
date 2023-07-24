<template>
    <!-- Have some more margin to keep the editing track separate from the other, listed tracks -->
    <div
        class="track is-together-print"
        :class="{
            'mb-5': isEditable && isExpanded,
            'is-active-track': isActiveTrack,
            'is-editable': isEditable,
        }"
        data-cy="track"
    >
        <!-- Handle all track-relevant events here
        Note: A check for the active track is done in the handler methods. 
        A v-if here would work, but would register the events not in a useful order. -->
        <ReplayerEventHandler
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
        <!-- Track header for editing, including artist info, expansion-toggler and adaptive spacing -->
        <!-- NOTE: The @click handler on the header component only handles clicks on otherwise non-interactive elements -->
        <TrackHeader
            :displayMode="viewMode"
            :isExpanded="isExpanded"
            @update:isExpanded="updateIsExpanded"
            :canCollapse="!isOnlyAudioTrack"
            :trackId="track.Id"
            :trackName="track.Name"
            :trackUrl="track.Url"
            :trackArtist="track.Artist"
            :trackAlbum="track.Album"
            :trackPreRoll="track.PreRoll"
            :isTrackLoaded="isTrackLoaded"
            :isTrackMediaAvailable="isMediaAvailable"
            :isActive="isActiveTrack"
            :isFirst="isFirst"
            :isLast="isLast"
            @click="skipToPlayPause"
        >
            <template v-slot:left-start>
                <div class="level-item is-narrow">
                    <!-- Playback control only when playable -->
                    <PlayPauseButton
                        v-if="isPlayable"
                        :disabled="!canPlay"
                        :class="{
                            'is-success': isActiveTrack,
                            'is-clickable': isTrackLoaded,
                            'has-cursor-not-allowed': !isTrackLoaded,
                        }"
                        :isLoading="isFading"
                        data-cy="toggle-playback"
                        @click="skipToPlayPause"
                    />

                    <!-- Routing controls only when mixable -->
                    <template v-if="isMixable">
                        <SoloButton
                            :disabled="!canPlay"
                            :isSoloed="isSoloed"
                            @click="toggleSolo()"
                            data-cy="solo"
                        />
                        <MuteButton
                            :disabled="!canPlay"
                            :isMuted="isMuted"
                            @click="toggleMute()"
                            data-cy="mute"
                        />
                        <SelectButton
                            :disabled="!canPlay"
                            :isSelected="isActiveTrack"
                            @click="setActiveTrack()"
                            data-cy="select"
                        />
                    </template>
                </div>
                <!-- Placeholder for the audio level meter (used for teleporting from the player component) -->
                <div
                    class="level-item is-narrow"
                    :class="{
                        'is-clickable': isTrackLoaded,
                        'has-cursor-not-allowed': !isTrackLoaded,
                    }"
                    @click="skipToPlayPause"
                >
                    <span
                        :id="`track-${track.Id}-HeaderLevelPlaceholder`"
                    ></span>
                </div>
            </template>

            <template v-slot:left-end>
                <!-- NOTE: As a component update performance optimization, 
                the numeric value is truncated to one decimal digit, as displayed, avoiding
                unnecessary update for actually non-distinctly displayed values. -->
                <TimeDisplay
                    v-experiment="experimentalShowPositionInTrackHeader"
                    class="level-item is-narrow is-size-7"
                    :modelValue="Math.floor(currentPosition * 10) / 10"
                    :subSecondDigits="1"
                ></TimeDisplay>

                <span
                    v-experiment="experimentalUseTempo"
                    class="is-size-7 level-item is-narrow"
                >
                    <span>{{ track.Meter?.BeatsPerMinute }}&nbsp;BPM</span>
                </span>

                <!-- NOTE: In edit mode, the time is displayed as part of the transport area, not in the header -->
                <!-- NOTE: In mix mode, the time display is not needed on individual tracks -->
                <!-- NOTE: In playback mode, the currently remaining time is shown, to indicate any ongoing playback action -->
                <TimeDisplay
                    v-if="isPlayable"
                    class="level-item is-narrow is-hidden-mobile is-size-7"
                    :modelValue="
                        remainingTime
                            ? Math.ceil(remainingTime * 10) / 10
                            : null
                    "
                    :subSecondDigits="1"
                ></TimeDisplay>

                <!-- NOTE: In edit mode, the volume button is displayed as part of the transport area, not in the header -->
                <VolumeKnob
                    v-if="!isEditable"
                    class="level-item is-narrow"
                    :disabled="!isTrackLoaded"
                    :modelValue="track.Volume"
                    @update:modelValue="updateVolume"
                />
            </template>
        </TrackHeader>

        <!-- The buttons field (for a single track in play mode) -->
        <div
            v-if="isPlayable && isOnlyAudioTrack && hasCues"
            class="transition-in-place"
            :key="track.Id"
        >
            <CueButtonsField
                :disabled="!canPlay"
                :playbackMode="playbackMode"
                @click="
                    (cue) => {
                        cueClick(cue);
                    }
                "
                :cues="track.Cues"
            ></CueButtonsField>
        </div>

        <!-- The tempo and cue level editors and playback bar (in edit mode for an expanded track)
         -->
        <Transition name="item-expand">
            <div v-if="isEditable && isExpanded" :key="track.Id">
                <!-- @devdoc: TempoLevelEditor does not use the provide/inject pattern, 
                    although it is used for the track's descendant components otherwise,
                    because I have experienced problems with the reactivity inside TempoLevelEditor.
                    A standard property/event approach is used here instead. -->
                <TempoLevelEditor
                    v-experiment="experimentalUseTempo"
                    :meter="track.Meter"
                    @update:meter="
                        (value: any /*IMeter*/): void => {
                            app.updateMeter(track.Id, value);
                        }
                    "
                    @adjustOriginTime="
                        () => {
                            app.updateTrackOriginTime(
                                track.Id,
                                currentPosition,
                            );
                        }
                    "
                    :useMeasureNumbers="track.UseMeasureNumbers"
                    @update:useMeasureNumbers="
                                (value: boolean | null) => {
                                    app.updateUseMeasureNumbers(
                                        track.Id,
                                        value,
                                    );
                                }
                            "
                    ><template
                        #left-end
                        v-experiment="experimentalUseTempo"
                        v-if="hasMeter && track.UseMeasureNumbers"
                    >
                        <div class="level-item">
                            <div class="field is-horizontal">
                                <div class="field-label is-normal">
                                    <label class="label is-single-line"
                                        >Current measure</label
                                    >
                                </div>
                                <div class="field-body">
                                    <div class="field">
                                        <p class="control">
                                            <button class="button is-indicator">
                                                <MeasureDisplay
                                                    :modelValue="
                                                        currentPosition
                                                    "
                                                ></MeasureDisplay>
                                            </button>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="level-item">
                            <div class="field is-horizontal">
                                <div class="field-label is-normal">
                                    <label class="label is-single-line"
                                        >Skip to measure</label
                                    >
                                </div>
                                <div class="field-body">
                                    <div class="field">
                                        <p class="control">
                                            <MetricalEditor
                                                v-model="currentPosition"
                                                @update:modelValue="
                                                    (position) =>
                                                        seekToSeconds(position)
                                                "
                                            >
                                            </MetricalEditor>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </template>
                </TempoLevelEditor>

                <!-- Main container -->
                <div class="levels" data-cy="cue-editors">
                    <CueLevelEditors
                        :cues="cues"
                        :disabled="!canPlay"
                        :playbackMode="playbackMode"
                        @click="cueClick"
                        @play="cuePlay"
                    >
                    </CueLevelEditors>
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
                                    v-focus
                                    :disabled="!canPlay"
                                    class="is-success mb-0"
                                    :isLoading="isFading"
                                    @click="skipToPlayPause()"
                                    title="Play from current position"
                                    data-cy="toggle-playback"
                                />
                                <CreateCueButton
                                    :disabled="!canPlay"
                                    class="mb-0"
                                    :isActiveTrack="isActiveTrack"
                                    @createNewCue="createNewCue()"
                                    data-cy="insert-cue"
                                ></CreateCueButton>
                            </div>
                        </div>
                    </div>
                    <!-- A central level item. Margins are set to provide nice-looking spacing at all widths -->
                    <div class="level-item mt-4-mobile">
                        <PlayheadSlider
                            :disabled="!canPlay"
                            class="is-fullwidth ml-4-tablet mr-4-tablet"
                            v-model.number="currentPosition"
                            @update:modelValue="
                                (position) => seekToSeconds(position)
                            "
                            @seek="(seconds) => seek(seconds)"
                            :trackDuration="track.Duration"
                        >
                            <!-- On mobile, the text is cropped at full width minus seek buttons, because of the level's automatic stacking,
                                    on lager viewports the text is cropped to not exceed the dynamic playhead slider -->
                            <p
                                class="is-size-7 has-cropped-text"
                                :class="{
                                    'has-opacity-half': !canPlay,
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
                            <MediaControlsBar
                                :disabled="!canPlay"
                                :hideStopButton="true"
                                :hideTrackNavigation="true"
                                :hideCueNavigation="true"
                                :playbackMode="playbackMode"
                                @update:playbackMode="updatedPlaybackMode"
                                :volume="track.Volume"
                                @update:volume="updateVolume"
                                :hidePlayPauseButton="true"
                            >
                            </MediaControlsBar>
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
                ref="trackPlayerInstance"
                :title="track.Name"
                :mediaUrl="mediaUrl"
                :trackId="track.Id"
                :disabled="!isTrackLoaded"
                :isActiveTrack="isActiveTrack"
                @timeupdate="updateTime"
                @durationChanged="calculateCueDurations"
                v-model:isTrackPlaying="isTrackPlaying"
                @update:isFading="updateFading"
                @update:playbackMode="updatedPlaybackMode"
                :playbackMode="playbackMode"
                :loopStart="selectedCue?.Time"
                :loopEnd="
                    (selectedCue?.Time ?? 0) + (selectedCue?.Duration ?? 0)
                "
                :sourceDescription="track?.Url"
                @update:volume="updateVolume"
                @update:level="updatedLevel"
                :volume="track.Volume"
                :isMuted="isMuted"
                :isSoloed="isSoloed"
                :isAnySoloed="isAnySoloed"
                @ended="$emit('trackEnded')"
                @loopedTo="$emit('trackLoopedTo', $event)"
                :fadeInDuration="fadeInDuration"
                :preRollDuration="preRollDuration"
                :fadeOutDuration="fadeOutDuration"
                :applyFadeInOffset="applyFadeInOffset"
                :showLevelMeter="showLevelMeter"
                :experimentalShowWaveforms="experimentalShowWaveforms"
                :levelMeterSizeIsLarge="levelMeterSizeIsLarge"
            ></TrackAudioApiPlayer>
            <Teleport to="#media-player" :disabled="isEditable">
                <Transition :name="skipTransitionName">
                    <!-- 
                    In the play view, the player widget is only shown for the active track
                    In the edit view, the player widgets are shown for all expanded tracks
                    In the mix view a dedicated mix widget is shown (defined as separate div) -->
                    <div
                        v-if="
                            (isMixable && isActiveTrack) ||
                            (isPlayable && isActiveTrack) ||
                            (isEditable && isExpanded)
                        "
                        :class="{
                            section: isPlayable || isMixable,
                            'has-background-grey-dark': isPlayable || isMixable,
                            'is-fullscreen': isTrackPlayerFullScreen,
                            'has-player-navbar-fixed-top':
                                isTrackPlayerFullScreen,
                            'transition-in-place':
                                isPlayable ||
                                isMixable /* because in playback  or mix view, the players are replaced in place, not expanded */,
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
                            <div v-if="isOnlyAudioTrack" class="level-left">
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
                                                :name="track.Name"
                                            ></TrackTitleName>
                                        </span>
                                        <!-- Artist info-->
                                        <span class="is-size-7"
                                            >&nbsp;
                                            <!--nbsp as placeholder to keep layout when no artist info -->
                                            <ArtistInfo
                                                :artist="track.Artist"
                                                :album="track.Album"
                                            />
                                        </span>
                                    </p>
                                </div>
                            </div>

                            <!-- Right side -->
                            <div class="level-right">
                                <div class="level-item">
                                    <PlayheadSlider
                                        class="is-fullwidth"
                                        v-model.number="currentPosition"
                                        @update:modelValue="
                                            (position) =>
                                                seekToSeconds(position)
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

                                <div
                                    class="level-item is-justify-content-flex-end"
                                >
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
                                        @update:volume="updateVolume"
                                        @seek="(seconds) => seek(seconds)"
                                        :isFading="isFading"
                                        @togglePlaying="skipToPlayPause()"
                                        :hidePlayPauseButton="false"
                                        data-cy="media-controls-bar"
                                    >
                                        <PlaybackIndicator
                                            :isReady="
                                                !isTrackPlaying && isTrackLoaded
                                            "
                                            :isUnloaded="!isTrackLoaded"
                                            :isUnavailable="!isMediaAvailable"
                                            data-cy="playback-indicator"
                                        />
                                    </MediaControlsBar>
                                </div>
                            </div>
                        </nav>

                        <!-- Offer the cue buttons depending on the situation. -->
                        <nav
                            v-if="
                                (!isOnlyAudioTrack &&
                                    !isTrackPlayerFullScreen &&
                                    isPlayable) ||
                                (!isTrackPlayerFullScreen && isMixable)
                            "
                        >
                            <CueButtonsBar
                                :playbackMode="playbackMode"
                                @click="
                                    (cue) => {
                                        cueClick(cue);
                                    }
                                "
                                :cues="track.Cues"
                            ></CueButtonsBar>
                        </nav>
                        <nav v-if="isTrackPlayerFullScreen">
                            <CueButtonsField
                                :playbackMode="playbackMode"
                                @click="
                                    (cue) => {
                                        cueClick(cue);
                                    }
                                "
                                :cues="track.Cues"
                            ></CueButtonsField>
                        </nav>
                    </div>
                </Transition>
            </Teleport>
        </template>
    </div>
</template>

<script setup lang="ts">
/** Displays a track div with a title, and a panel with a dedicated media player and the cue buttons for it.
 * @displayName Track
 * @remarks The panel is initially collapsed and no media is loaded into the player, as a performance optimization.
 * Details:
 * - The collapsed panel is not removed from the DOM because of issues with the ref handling in conjunction with v-if
 * - However, the player's src property is only set when actually used to keep the memory footprint low.
 * @remarks Also handles the common replayer events for tracks
 */
import { PropType, Ref, computed, provide, readonly, ref, watch } from 'vue';
import {
    ICue,
    TrackViewMode,
    PlaybackMode,
    Track,
} from '@/store/compilation-types';
import CueLevelEditors from '@/components/CueLevelEditors.vue';
import TempoLevelEditor from '@/components/editor/TempoLevelEditor.vue';
import TrackAudioApiPlayer from '@/components/track/TrackAudioApiPlayer.vue';
import ReplayerEventHandler from '@/components/ReplayerEventHandler.vue';
import TrackHeader from '@/components/track/TrackHeader.vue';
import CueButtonsBar from '@/components/CueButtonsBar.vue';
import CueButtonsField from '@/components/CueButtonsField.vue';
import MediaControlsBar from '@/components/MediaControlsBar.vue';
import PlayPauseButton from '@/components/buttons/PlayPauseButton.vue';
import CreateCueButton from '@/components/buttons/CreateCueButton.vue';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import MuteButton from '@/components/buttons/MuteButton.vue';
import SoloButton from '@/components/buttons/SoloButton.vue';
import SelectButton from '@/components/buttons/SelectButton.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import MeasureDisplay from '@/components/MeasureDisplay.vue';
import MetricalEditor from '@/components/editor/MetricalEditor.vue';
import CompilationHandler from '@/store/compilation-handler';
import PlayheadSlider from '@/components/PlayheadSlider.vue';
import VolumeKnob from '@/components/VolumeKnob.vue';
import PlaybackIndicator from '@/components/PlaybackIndicator.vue';
import TrackTitleName from '@/components/track/TrackTitleName.vue';
import ArtistInfo from '@/components/ArtistInfo.vue';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/store/app';
import FileHandler from '@/store/filehandler';
import { Meter } from '@/code/music/Meter';
import {
    currentPositionDisplayInjectionKey,
    currentPositionInjectionKey,
    meterInjectionKey,
    useMeasureNumbersInjectionKey,
} from './TrackInjectionKeys';
import { isPlayingInjectionKey } from './TrackInjectionKeys';
import { Replayer } from '../CompilationKeyboardHandler.vue';

const emit = defineEmits([
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

    /** Occurs, when this track starts playing.
     */
    'isTrackPlaying',

    /** Occurs on a seek operation
     */
    'seekToSeconds',

    /** Occurs, when the user toggles the playback mode */
    'update:playbackMode',

    /** Occurs, when the end of the track has been reached and playback has ended.
     * @remarks This is not triggered when the track or one of it's cue is looping.
     * @remarks Allows to select the next track in "play all" and "shuffle" mode.
     */
    'trackEnded',

    /** Occurs, when the end of a loop has been reached and playback has looped.
     */
    'trackLoopedTo',
]);

const props = defineProps({
    /** The track to handle
     */
    track: {
        type: Object as PropType<Track>,
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
    isOnlyAudioTrack: {
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

    /** Whether this track is the active track in the set of tracks */
    isActiveTrack: {
        type: Boolean,
        required: true,
    },

    /** Whether any track (including this one) in the compilation is currently soloed.
     * This is required to determine the muting of non-soloed tracks.
     */
    isAnySoloed: {
        type: Boolean,
        required: false,
        default: false,
    },

    /** The display mode of this track.
     * @devdoc Allows to reuse this component for more than one view mode.
     * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
     */
    viewMode: {
        type: String as () => TrackViewMode,
        default: TrackViewMode.Play,
    },

    /** Whether to show the track player widget in full screen mode */
    isTrackPlayerFullScreen: {
        type: Boolean,
        default: false,
    },

    /** The playback mode
     * @remarks Used overall in the compilation, not per track
     */
    playbackMode: {
        type: String as () => PlaybackMode,
        required: true,
        default: PlaybackMode.PlayTrack,
    },
});

/** Whether to use measure numbers for the track's cue position handling
 * @remarks Must only be true, whan a valid meter is also provided
 * @devdoc This value is provided to descendant components using the provide/inject pattern.
 * @devdoc Here, a ComputedRef must be used, not a ref, because the ref of the dereferenced meter
 * would not be reactive.
 */
const useMeasureNumbers = computed(
    () => props.track.UseMeasureNumbers === true,
);
provide(useMeasureNumbersInjectionKey, readonly(useMeasureNumbers));

/** The track's meter
 * @devdoc This value is provided to descendant components using the provide/inject pattern.
 * @devdoc Here, a ComputedRef must be used, not a ref, because the ref of the dereferenced meter
 * would not be reactive.
 */
const meter = computed(() => props.track.Meter);
provide(meterInjectionKey, readonly(meter));

/** The playback progress in the current track, in [seconds]
 * @remarks This is used for cue event handling within the set of cues, like creating a new cue at the current position
 */
const currentPosition = ref(0);
provide(currentPositionInjectionKey, readonly(currentPosition));

/** The playback progress in the current track, as a readonly, formatted, displayable text
 * @remarks This is used for track progress display within the set of cues
 */
const currentPositionDisplay = computed(() =>
    CompilationHandler.convertToDisplayTime(currentPosition.value),
);
provide(currentPositionDisplayInjectionKey, readonly(currentPositionDisplay));

/** Flag to indicate whether the player has it's track loaded.
 * @remarks This is used to toggle playback button states
 */
const isTrackLoaded = ref(false);

/** Gets the duration of the current track, in [seconds]
 * @remarks This is only available after successful load of the track (i.e. it's media metadata).
 * Could be NaN or infinity, depending on the source
 */
const trackDuration: Ref<number | null> = ref(null);

/** Flag to indicate whether this track's player is currently playing
 */
const isTrackPlaying = ref(false);
provide(isPlayingInjectionKey, readonly(isTrackPlaying));

/** Flag to indicate whether the audio is currently muted
 */
const isMuted = ref(false);

/** Flag to indicate whether the track's audio is currently playing solo
 */
const isSoloed = ref(false);

/** Readonly flag to indicate whether the player is currently fading */
const isFading = ref(false);

/** The current audio level */
const level = ref(-96);

/** Whether the cues are currently expanded for editing */
const isExpanded = ref(false);

/** The visual transition to use for skipping track */
const skipTransitionName = ref('slide-left');

const settings = useSettingsStore();
const {
    levelMeterSizeIsLarge,
    fadeInDuration,
    fadeOutDuration,
    applyFadeInOffset,
    defaultPreRollDuration,
    showLevelMeter,
    experimentalShowPositionInTrackHeader,
    experimentalShowWaveforms,
    experimentalUseTempo,
} = storeToRefs(settings);

const app = useAppStore();

const {
    selectedCueId,
    compilation,
    /**
     * @remarks A selected cue's data is used for looping on a cue's boundaries
     */
    selectedCue,
    mediaUrls,
    activeTrackId,
} = storeToRefs(app);

function toggleTrackPlayerFullScreen(): void {
    emit('update:isTrackPlayerFullScreen', !props.isTrackPlayerFullScreen);
}

/** Stops playback and removes any selected cue
 * @remarks Does not assert whether this is the active track.
 */
function stop(): void {
    trackPlayerInstance.value?.stop();
    app.updateSelectedCueId(CompilationHandler.EmptyId);
}

function toPreviousCue() {
    document.dispatchEvent(new Event(Replayer.TO_PREV_CUE));
}

function toNextCue() {
    document.dispatchEvent(new Event(Replayer.TO_NEXT_CUE));
}

/** Skips to this track (if loaded)
 * @remarks If the track is not loaded, does nothing.
 * If the track is not yet the active track, tries to activate the track (which will autoplay).
 * If it's the active track, just toggles play/pause
 * @devdoc Conditional event registration inside the template did not work.
 */
function skipToPlayPause(): void {
    if (isTrackLoaded.value) {
        if (!props.isActiveTrack) {
            trackPlay();
        } else {
            togglePlayback();
        }
    }
}

/** Activates to this track (if loaded)
 * @remarks If the track is not loaded, does nothing.
 * If the track is not yet the active track, tries to activate the track (which will autoplay).
 * If it's the active track, does nothing
 */
function setActiveTrack(): void {
    if (isTrackLoaded.value) {
        if (!props.isActiveTrack) {
            app.updateSelectedTrackId(props.track.Id);
        }
    }
}

/** Toggles the muted state of this track
 * @remarks If the track is not loaded, does nothing.
 * @param mute - If null or not given, toggles the muted state. When given, sets to the specified state.
 */
function toggleMute(mute: boolean | null = null): void {
    if (isTrackLoaded.value) {
        if (mute === null) {
            isMuted.value = !isMuted.value;
        } else {
            isMuted.value = mute;
        }
    }
}

/** Toggles the solo state of this track
 * @remarks If the track is not loaded, does nothing.
 * @param solo - If null or not given, toggles the soloed state. When given, sets to the specified state.
 * @param isAnySoloed - Provides, whether any track in the compilation is currently soloed. This is required to determine the muting of non-soloed tracks.
 */
function toggleSolo(solo: boolean | null = null): void {
    if (isTrackLoaded.value) {
        if (solo === null) {
            isSoloed.value = !isSoloed.value;
        } else {
            isSoloed.value = solo;
        }
    }
}

/** Starts playback from the given temporal position
 * @remarks This first seeks to the position, then starts playing
 */
function playFrom(position: number) {
    trackPlayerInstance.value?.playFrom(position);
}

/** Pauses playback at the current position, with fading if configured.
 * @remarks Does not assert whether this is the active track.
 */
function pause() {
    trackPlayerInstance.value?.pause();
}

function togglePlayback() {
    //console.debug(`Track(${this.track.Name})::togglePlayback`);
    if (props.isActiveTrack) {
        trackPlayerInstance.value?.togglePlayback();
    }
}

/** Rewinds 5 seconds, if this is the active track */
function rewind() {
    if (props.isActiveTrack) {
        seek(-5);
    }
}

/** Forwards 5 seconds, if this is the active track */
function forward() {
    if (props.isActiveTrack) {
        seek(+5);
    }
}

/** Pauses playback (with a subsequent seek operation) */
function pauseAndSeekTo(seconds: number): void {
    trackPlayerInstance.value?.pauseAndSeekTo(seconds);
}

/** Seeks forward or backward, for the given amount of seconds */
function seek(seconds: number): void {
    seekToSeconds(currentPosition.value + seconds);
}

/** Seeks to the position, in [seconds], with emitting an event */
function seekToSeconds(seconds: number): void {
    trackPlayerInstance.value?.seekToSeconds(seconds);
    emit('seekToSeconds', seconds);
}

/** Handles the volume up command if this is the active track */
function volumeDown() {
    if (props.isActiveTrack) {
        trackPlayerInstance.value?.volumeDown();
    }
}

/** Handles the volume down command if this is the active track */
function volumeUp() {
    if (props.isActiveTrack) {
        trackPlayerInstance.value?.volumeUp();
    }
}

/** Updates the volume of this track, regardless of whether it is the active track */
function updateVolume(volume: number) {
    app.updateTrackVolume(props.track.Id, volume);
}

/** Pauses playback and seeks to the currently selected cue's position, but only
 * if this track is the active track (i.e. the selected cue is within this track)
 */
function goToSelectedCue() {
    /*Check for the active track here (again), because otherwise some event handling
            sequences might cause actions on non-active tracks too.*/
    if (props.isActiveTrack) {
        console.debug('Track::goToSelectedCue of selected track');

        if (selectedCue.value) {
            const cueTime = selectedCue.value.Time;

            //Control playback according to the play state, using a single operation.
            //This supports a possible fade operation.
            //For the cue time, handle all non-null values (Zero is valid)
            if (isTrackPlaying.value) {
                if (cueTime != null) {
                    pauseAndSeekTo(cueTime);
                } else {
                    pause();
                }
            } else {
                if (cueTime != null) {
                    seekToSeconds(cueTime);
                }
            }
        }
    }
}

/** Handle playback mode updates
 */
function updatedPlaybackMode(playbackMode: PlaybackMode): void {
    emit('update:playbackMode', playbackMode);
}

/** Handle isExpanded update
 */
function updateIsExpanded(expanded: boolean): void {
    isExpanded.value = expanded;
    console.debug(
        `Track(${props.track.Name})::updateIsExpanded:${isExpanded.value}`,
    );
}

/** Handle track audio level updates
 * @param {number} level - The current audio level
 * @devdoc Handled here as part of the track because the level is shown as part of the track
 */
function updatedLevel(updatedLevel: number): void {
    console.debug(`Track(${props.track.Name})::updatedLevel:${level.value}`);
    level.value = updatedLevel;
}

/** Handles the click of a cue button, by seeking to it and, optionally, toggling playback
 * @param cue The cue to handle
 * @param togglePlayback Whether to toggle playback. Optional, defaults to true
 * @devdoc Click invocations by the ENTER key are explicitly not handled here. These should not get handled by the keyboard shortcut engine.
 */
function cueClick(cue: ICue, togglePlayback = true) {
    console.debug(`Track(${props.track.Name})::cueClick:cue:`, cue);
    if (cue.Time != null && Number.isFinite(cue.Time)) {
        if (cue.Id) {
            //Update the selected cue to this cue
            app.updateSelectedCueId(cue.Id);
        }

        //Set the position to this cue and handle playback
        console.debug(
            `Track(${props.track.Name})::cueClick:isTrackPlaying:`,
            isTrackPlaying.value,
        );
        if (togglePlayback) {
            if (isTrackPlaying.value) {
                pauseAndSeekTo(cue.Time);
            } else {
                playFrom(cue.Time);
            }
        } else {
            seekToSeconds(cue.Time);
        }
    }
}

/** Handles the play event of a cue button, by immediately restarting playback at the cue (instead of toggling)
 * @devdoc Click invocations by the ENTER key are explicitly not handled here. These should not get handled by the keyboard shortcut engine.
 */
function cuePlay(cue: ICue) {
    console.debug(`Track(${props.track.Name})::cuePlay:cue:`, cue);
    if (cue.Time != null && Number.isFinite(cue.Time)) {
        app.updateSelectedCueId(cue.Id);

        //Set the position to this cue and handle playback
        if (isTrackPlaying.value) {
            seekToSeconds(cue.Time); //keep playing
        } else {
            playFrom(cue.Time);
        }
    }
}

/** Handles the play event of a button, by immediately restarting playback at the beginning of the track (instead of toggling)
 * @devdoc Click invocations by the ENTER key are explicitly not handled here. These should not get handled by the keyboard shortcut engine.
 */
function trackPlay() {
    console.debug(`Track(${props.track.Name})::trackPlay`);

    app.updateSelectedTrackId(props.track.Id);

    //Set the position to the beginning and handle playback
    if (isTrackPlaying.value) {
        seekToSeconds(0); //keep playing
    } else {
        playFrom(0);
    }
}

/** Handles the request for a new cue by creating one for the current time
 */
function createNewCue(): void {
    app.addCueAtTime(props.track.Id, currentPosition.value);
}

/** Updates the current seconds property with the temporal position of the track audio player
 * @remarks This is used to control the cue display for this track's cues
 */
function updateTime(currentTime: number) {
    currentPosition.value = currentTime;
}

function updateFading(fading: boolean) {
    isFading.value = fading;
}

/** Updates the track duration and calculates the cue durations */
function calculateCueDurations(trackDurationSeconds: number) {
    isTrackLoaded.value = true;
    trackDuration.value = trackDurationSeconds;
    app.updateDurations(props.track.Id, trackDurationSeconds);
}

defineExpose({
    /** For skipping from the compilation level, to a given track, the skipToPlayPause needs to be accessible from outside */
    skipToPlayPause,
});

/** Handles changes in whether this is the active track.
         * @remarks When this ceases to be the active track, pause playback.
           This avoids having multiple tracks playing at the same time.
         */
watch(
    () => props.isActiveTrack,
    (isActive, wasActive) => {
        console.debug(
            `Track(${props.track.Name})::isActiveTrack:val:`,
            isActive,
        );

        // Pause this track, when it's no more active track
        if (wasActive === true && isActive === false) {
            pause();
        }
    },
);

/** Handles active track id changes.
 * @remarks Used to determine the requested player widget transition.
 */

watch(activeTrackId, (activeTrackId, previousTrackId) => {
    console.debug(
        `Track(${props.track.Name})::activeTrack:activeTrackId:`,
        activeTrackId,
        'prev:',
        previousTrackId,
    );

    if (activeTrackId != null && previousTrackId != null) {
        const indexOfActive = CompilationHandler.getIndexOfTrackById(
            //TODO check: why is not the tracks computed prop used? or a tracks prop for the store? maybe because of the possible shuffling?
            compilation.value.Tracks,
            activeTrackId,
        );

        const indexOfPrevious = CompilationHandler.getIndexOfTrackById(
            compilation.value.Tracks,
            previousTrackId,
        );

        if (indexOfActive == indexOfPrevious + 1) {
            // exactly next
            skipTransitionName.value = 'slide-left';
        } else if (indexOfActive == indexOfPrevious - 1) {
            // exactly previous
            skipTransitionName.value = 'slide-right';
        } else if (indexOfActive > indexOfPrevious) {
            // later than next
            skipTransitionName.value = 'slide-fade-left';
        } else if (indexOfActive < indexOfPrevious) {
            // earlier than previous
            skipTransitionName.value = 'slide-fade-right';
        }
    }
});

/** Handles changes in whether this track is playing.
 * @remarks This activates the wake lock, when playing starts.
 */
watch(isTrackPlaying, () => {
    console.debug(
        `Track(${props.track.Name})::isTrackPlaying:`,
        isTrackPlaying,
    );
    emit('isTrackPlaying', isTrackPlaying);
});

watch(
    () => props.isTrackPlayerFullScreen,
    (isFullScreen) => {
        console.debug(
            `Track(${props.track.Name})::isTrackPlayerFullScreen:isFullScreen:`,
            isFullScreen,
        );
        document.documentElement.style.overflowY = isFullScreen
            ? 'clip'
            : 'auto';
    },
);

/** Whether all required values for the use of the measure number as position are available.
 */
const hasMeter = computed(() => Meter.isValid(props.track.Meter));

const remainingTime = computed(() =>
    CompilationHandler.calculateRemainingTime(
        currentPosition.value,
        trackDuration.value,
    ),
);

/** Calculate the custom pre-roll for this track */
const preRollDuration = computed(() => {
    if (props.track.PreRoll !== null) {
        return props.track.PreRoll;
    }
    return defaultPreRollDuration.value;
});

/** The description of the currently playing cue
 * @remarks The implementation makes sure that at least always an empty string is returned.
 * Combined with an &nbsp;, this avoids layout flicker.
 */
const playingCueDescription = computed(() => {
    const description = playingCue.value?.Description;

    if (description) {
        return description;
    }
    return '';
});

/** Whether the current track can play, i.e. the mediaUrl is set and the track media is loaded */
const canPlay = computed(() => {
    return (mediaUrl.value ?? '').length > 0 && isTrackLoaded.value;
});

/** Whether the currently playing cue is the selected cue
 * @remarks used for the playhead slider visualization
 */
const playingCueIsSelected = computed(() => {
    const playingCueId = playingCue.value?.Id;

    if (playingCueId != undefined && selectedCueId.value === playingCueId) {
        return true;
    }
    return false;
});

/** Whether the playing cue has a previous cue
 */
const hasPreviousCue = computed(() => {
    return selectedCueId !== null && allCueIds.value[0] !== selectedCueId.value;
});

/** Whether the playing cue has a next cue
 */
const hasNextCue = computed(() => {
    return (
        selectedCueId !== null &&
        allCueIds.value.slice(-1)[0] !== selectedCueId.value
    );
});

const allCueIds = computed(() => {
    return cues.value?.map((cue) => cue.Id) ?? [];
});

/** Whether this track has any cue at all */
const hasCues = computed(() => {
    return cues.value.length !== undefined && cues.value.length > 0;
});

/** Gets the currently playing cue, regardless whether it is selected, if available
 */
const playingCue = computed(() => {
    return (
        props.track.Cues.filter(
            (cue) =>
                cue.Time !== null &&
                Number.isFinite(cue.Time) &&
                cue.Duration !== null &&
                Number.isFinite(cue.Duration) &&
                currentPosition.value >= cue.Time &&
                currentPosition.value < cue.Time + (cue.Duration ?? 0),
        )[0] ?? null
    );
});

/** Whether this component is viewed for the "Edit" mode, and thus shows editable inputs for the contained data
 * @devdoc Allows to reuse this component for more than one view mode.
 */
const isEditable = computed(() => {
    return props.viewMode === TrackViewMode.Edit;
});

/** Whether this component is viewed for the "Mix" mode, and thus shows mixing controls
 * @devdoc Allows to reuse this component for more than one view mode.
 */
const isMixable = computed(() => {
    return props.viewMode === TrackViewMode.Mix;
});

/** Whether this component is viewed for the "Play" mode, and thus shows non-collapsible playback buttons
 * @devdoc Allows to reuse this component for more than one view mode.
 */
const isPlayable = computed(() => {
    return props.viewMode === TrackViewMode.Play;
});

/** Gets a reference to the player instance.
 * @devdoc $ref's are non-reactive, see https://v3.vuejs.org/api/special-attributes.html#ref
 * Thus, referencing an instance after it has been removed from the DOM (e.g. by v-if)
 * does not work, even after it's rendered again later.
 */
//const trackPlayerInstance :Ref<<typeof TrackAudioApiPlayer>| null>  = ref(null);
const trackPlayerInstance: Ref<InstanceType<
    typeof TrackAudioApiPlayer
> | null> = ref(null);

/** Whether the playback media is available
 * @devdoc This is only working for local file paths, not for online URL's, because these are directly fetched from the media element.
 */
const isMediaAvailable = computed(() => {
    if (mediaUrl.value) {
        return true;
    }
    return false;
});

/** Gets the media URL, if available
 * @remarks For non-online URL's, a match is sought from previously stored binary blobs
 */
const mediaUrl = computed(() => {
    if (FileHandler.isValidHttpUrl(props.track.Url)) {
        return props.track.Url;
    }
    return trackMediaUrl.value?.url;
});

/** Gets the media URL, if available,
 * and optimized for the active track state
 * @remarks To save memory in the audio elements,
 * an URL is only provided when
 * the player is actually in the currently active track
 * @remarks For non-online URL's, a match is sought from previously stored binary blobs
 */
//  const  optimizedMediaUrl= computed( ()=>{
//     if (props.isActiveTrack) {
//         if (FileHandler.isValidHttpUrl(props.track.Url)) {
//             return props.track.Url;
//         }
//         return trackMediaUrl.value?.url;
//     } else {
//         return undefined;
//     }
// });

/** Returns all cues of this track */
const cues = computed(() => {
    return props.track.Cues;
});

/** Returns the media URL (online URL or playable file content) for a track's file name
 * @remarks if available, the tracks from a compilation package are used, otherwise the
 * files are to be loaded from the file system or from the internet
 */

const trackMediaUrl = computed(() => {
    let mediaUrl = CompilationHandler.getMatchingPackageMediaUrl(
        props.track?.Url,
        mediaUrls.value,
    );
    return mediaUrl;
});
</script>
<style lang="scss" scoped>
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
    the environment */
    margin-top: 12px;

    /** The track's cue levels have also an additional small margin at their end.
    This results in a similar space between levels as use within
    the environment */
    margin-bottom: 12px;
}

// Define an overall width allocation for fixed right-hand side of the playback control level items
.level {
    .level-left {
        flex-basis: calc(100% - 600px);
        .level-item {
            flex-shrink: 1;
        }
    }
    .level-right {
        flex-basis: 600px;
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
<style lang="scss">
/**
* On smaller screens, keep the contained track level meter also small */
@media screen and (max-width: 768px) {
    // Like the button size
    .audio-level-meter {
        max-width: 40px;
    }
}
</style>
