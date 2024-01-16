<template>
    <!-- Have some more margin to keep the editing track separate from the other, listed tracks -->
    <div
        class="track is-together-print"
        :class="{
            'is-active-track': isActiveTrack,
            'is-inactive-track': !isActiveTrack,
            'is-editable': isEditable,
            'is-audio': isAudioTrack,
            'is-video': isVideoTrack,
            'is-youtube-video': isYoutubeVideoTrack,
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
            @cleanup="persistPlayheadPosition"
        />

        <div class="block">
            <!-- Each track is an item in a list and contains all the cues -->
            <!-- Track header for editing, including artist info, expansion-toggler and adaptive spacing -->
            <!-- NOTE: The @click handler on the header component only handles clicks on otherwise non-interactive elements -->
            <TrackHeader
                :display-mode="viewMode"
                :is-expanded="isExpanded"
                :can-collapse="!isOnlyMediaTrack"
                :track="track"
                :is-track-loaded="isTrackLoaded"
                :is-track-media-available="isMediaAvailable"
                :is-active="isActiveTrack"
                :is-first="isFirst"
                :is-last="isLast"
                @update:is-expanded="updateIsExpanded"
            >
                <template
                    v-if="isMixable || isPlayable || isEditable"
                    #left-start
                >
                    <div class="level-item is-narrow">
                        <PlayPauseButton
                            :disabled="!canPlay"
                            :class="{
                                'is-success': isActiveTrack,
                                'is-clickable': isTrackLoaded,
                                'has-cursor-not-allowed': !isTrackLoaded,
                            }"
                            :is-loading="isFading !== FadingMode.None"
                            data-cy="toggle-playback"
                            @click="skipToPlayPause"
                        />

                        <!-- Title input -->
                        <!-- The title is the only header element that should shrink (break on words) if necessary -->
                        <div
                            v-if="!isEditable"
                            class="is-flex-shrink-1 ml-3"
                            :class="{
                                'is-clickable': isTrackLoaded,
                                'has-cursor-not-allowed': !isTrackLoaded,
                            }"
                            @click="setActiveTrack()"
                        >
                            <p
                                class="title is-4"
                                :title="track.Url"
                                :class="{ 'has-text-success': isActiveTrack }"
                            >
                                <TrackTitleName
                                    :name="track.Name"
                                ></TrackTitleName>
                            </p>
                        </div>

                        <!-- Routing controls only when mixable -->
                        <template v-if="isMixable">
                            <SoloButton
                                :disabled="!canPlay"
                                :is-soloed="isSoloed"
                                data-cy="solo"
                                @click="toggleSolo()"
                            />
                            <MuteButton
                                :disabled="!canPlay"
                                :is-muted="isMuted"
                                data-cy="mute"
                                @click="toggleMute()"
                            />
                            <SelectButton
                                :disabled="!canPlay"
                                :is-selected="isActiveTrack"
                                data-cy="select"
                                @click="setActiveTrack()"
                            />
                        </template>
                    </div>
                </template>

                <template #left-additional>
                    <span
                        v-if="isPlayable && track.Meter?.BeatsPerMinute"
                        class="is-size-7 level-item is-hidden-mobile is-narrow has-opacity-half"
                    >
                        <span>{{ track.Meter?.BeatsPerMinute }}&nbsp;BPM</span>
                    </span>
                    <span
                        v-if="isPlayable && track.Meter?.TimeSignature"
                        class="is-size-7 level-item is-hidden-mobile is-narrow has-opacity-half"
                    >
                        <span
                            ><sup>{{
                                track.Meter?.TimeSignature.Numerator
                            }}</sup
                            >/<sub>{{
                                track.Meter?.TimeSignature.Denominator
                            }}</sub></span
                        >
                    </span>
                </template>

                <template #right-start>
                    <!-- NOTE: As a component update performance optimization, 
                the numeric value is truncated to one decimal digit, as displayed, avoiding
                unnecessary update for actually non-distinctly displayed values. -->
                    <TimeDisplay
                        v-if="experimentalShowPositionInTrackHeader"
                        v-experiment="experimentalShowPositionInTrackHeader"
                        class="level-item is-narrow is-size-7"
                        :model-value="Math.floor(currentPosition * 10) / 10"
                        :sub-second-digits="1"
                    ></TimeDisplay>

                    <!-- NOTE: In edit mode, the time is displayed as part of the transport area, not in the header -->
                    <!-- NOTE: In mix mode, the time display is not needed on individual tracks -->
                    <!-- NOTE: In playback mode, the currently remaining time is shown, to indicate any ongoing playback action -->
                    <TimeDisplay
                        v-if="isPlayable"
                        class="level-item is-narrow is-hidden-mobile is-size-7"
                        :model-value="
                            remainingTime
                                ? Math.ceil(remainingTime * 10) / 10
                                : null
                        "
                        :sub-second-digits="1"
                    ></TimeDisplay>

                    <!-- Placeholder for the audio level meter (used for teleporting from the player component) -->
                    <div class="level-item is-narrow mr-0">
                        <div
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
                    </div>
                </template>
                <template #right-action-items>
                    <div class="level-item is-narrow mr-0 is-hidden-mobile">
                        <!-- NOTE: In edit mode, the volume button is displayed as part of the transport area, not in the header -->
                        <VolumeKnob
                            v-if="!isEditable"
                            :disabled="!isTrackLoaded"
                            :model-value="track.Volume"
                            @update:model-value="updateVolume"
                        /></div
                ></template>
            </TrackHeader>
        </div>

        <!-- The buttons field (for a single track in play mode) -->
        <div
            v-if="isPlayable && isOnlyMediaTrack && hasCues"
            :key="track.Id"
            class="block transition-in-place"
        >
            <CueButtonsField
                :disabled="!canPlay"
                :playback-mode="playbackMode"
                :cues="track.Cues"
                @click="
                    (cue) => {
                        cueClick(cue);
                    }
                "
            ></CueButtonsField>
        </div>

        <!-- The meter and cue level editors and playback bar (in edit mode for an expanded track)
         -->
        <Transition name="item-expand">
            <div v-if="isEditable && isExpanded" class="block">
                <!-- @devdoc: MeterLevelEditor does not use the provide/inject pattern, 
                    although it is used for the track's descendant components otherwise,
                    because I have experienced problems with the reactivity inside MeterLevelEditor.
                    A standard property/event approach is used here instead. -->
                <MeterLevelEditor
                    v-if="experimentalUseMeter && isEditable"
                    v-experiment="experimentalUseMeter"
                    :meter="track.Meter"
                    :use-measure-numbers="track.UseMeasureNumbers"
                    @update:meter="
                        (value: any /*IMeter*/): void => {
                            app.updateMeter(track.Id, value);
                        }
                    "
                    @adjust-origin-time="
                        () => {
                            app.updateTrackOriginTime(
                                track.Id,
                                currentPosition,
                            );
                        }
                    "
                    @update:use-measure-numbers="
                        (value: boolean | null) => {
                            app.updateUseMeasureNumbers(track.Id, value);
                        }
                    "
                    ><template
                        v-if="hasMeter && track.UseMeasureNumbers"
                        #left-end
                        v-experiment="experimentalUseMeter"
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
                                                    :model-value="
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
                                                @update:model-value="
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
                </MeterLevelEditor>
            </div>
        </Transition>

        <!-- Main container -->
        <Transition name="item-expand">
            <div
                v-if="isEditable && isExpanded"
                class="block levels"
                data-cy="cue-editors"
            >
                <CueLevelEditors
                    :cues="cues"
                    :disabled="!canPlay"
                    :playback-mode="playbackMode"
                    @click="cueClick"
                    @play="cuePlay"
                >
                </CueLevelEditors>
            </div>
        </Transition>
        <!-- 
                Track playback bar (In edit mode, this contains:
                - the play/pause-add-cue button combo
                - a wide slider
                - a very limited set of transport controls (no skip buttons)
                    -->
        <Transition name="item-expand">
            <nav
                v-if="isEditable && isExpanded"
                class="block level is-editable is-unselectable"
            >
                <!-- Left side -->
                <div class="level-left">
                    <div class="level-item is-justify-content-flex-start">
                        <CreateCueButton
                            :disabled="!canPlay"
                            class="mb-0"
                            :is-active-track="isActiveTrack"
                            data-cy="insert-cue"
                            @create-new-cue="createNewCue()"
                        ></CreateCueButton>
                    </div>
                </div>
                <!-- A central level item. Margins are set to provide nice-looking spacing at all widths -->
                <div class="level-item mt-4-mobile">
                    <PlayheadSlider
                        :disabled="!canPlay"
                        class="is-fullwidth ml-4-tablet mr-4-tablet"
                        :model-value="currentPosition ?? 0"
                        :track-duration="track.Duration"
                        @update:model-value="
                            (position) => seekToSeconds(position)
                        "
                        @seek="(seconds) => seek(seconds)"
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
                            :hide-stop-button="true"
                            :hide-track-navigation="true"
                            :hide-cue-navigation="true"
                            :hide-pre-roll-toggler="hidePreRollToggler"
                            :hide-fading-toggler="hideFadingToggler"
                            :playback-mode="playbackMode"
                            :is-fading-enabled="isFadingEnabled"
                            :is-pre-roll-enabled="isPreRollEnabled"
                            :volume="track.Volume"
                            :hide-play-pause-button="true"
                            @update:playback-mode="updatedPlaybackMode"
                            @update:is-fading-enabled="updatedIsFadingEnabled"
                            @update:is-pre-roll-enabled="
                                updatedIsPreRollEnabled
                            "
                            @update:volume="updateVolume"
                        >
                        </MediaControlsBar>
                    </div>
                </div>
            </nav>
        </Transition>

        <!-- The media player widget (with controls) but only once the source is available from the store
            Note: The mediaUrl property (the actual src attribute in the underlying media
            element) is also depending on the track state as a performance optimizations
            -->
        <div v-if="mediaUrl" class="block">
            <Teleport to="#media-player-panel" :disabled="!usePlayerPanel">
                <Transition :name="skipTransitionName">
                    <!-- The player widget for a track may be full screen only for the active track -->
                    <FullscreenPanel
                        ref="fullscreenPanel"
                        v-slot="{ isFullscreen, toggle }"
                    >
                        <!-- 
                    In the play view, the player widget is only shown for the active track
                    In the edit view, the player widgets are shown for all expanded tracks
                    In the mix view a dedicated mix widget is shown (defined as separate div) -->
                        <!-- NOTE: A v-show is used instead of a v-if to keep the media players permanently in the DOM. -->
                        <div
                            v-show="
                                (isMixable && isActiveTrack) ||
                                (isPlayable && isActiveTrack) ||
                                (isEditable && isExpanded)
                            "
                            :key="track.Id"
                            :class="{
                                section: isPlayable || isMixable,
                                'transition-in-place':
                                    isPlayable ||
                                    isMixable /* because in playback  or mix view, the players are replaced in place, not expanded */,
                                'has-background-grey-dark': !isFullscreen,
                                'is-fullscreen': isFullscreen,
                            }"
                            :disabled="!canPlay"
                        >
                            <!-- 
                            Track playback bar (In play mode, this contains:
                            - a slot for the expander icon (if not the only track)
                            - The title (with artist info)
                            - the play/pause button
                            - a smaller slider (hiddeon on mobile for videos)
                            - a standard set of transport controls, including cue and track skipping
                         -->
                            <!-- 
                            In full screen, this level is at the top, and not visually separated from the cues -->

                            <div
                                v-if="isPlayable"
                                class="widget level has-breakpoint-desktop"
                                :class="{
                                    'is-audio': isAudioTrack,
                                    'is-video': isVideoTrack,
                                    'is-youtube-video': isYoutubeVideoTrack,
                                }"
                            >
                                <!-- Left side (with expander, title and artist of the currently playing track; not shown for a single track) -->
                                <div v-if="isOnlyMediaTrack" class="level-left">
                                    <!-- empty placeholder -->
                                </div>
                                <div v-else class="level-left">
                                    <!-- Title and Artist of the currently playing track-->
                                    <div
                                        class="level-item is-justify-content-left has-cropped-text"
                                    >
                                        <!-- Offer the full screen, but not for a single track  -->
                                        <CollapsibleButton
                                            :model-value="isFullscreen"
                                            title="toggle full-screen mode"
                                            collapsed-chevron-direction="up"
                                            @click="toggle"
                                        ></CollapsibleButton>
                                        <p>
                                            <!-- Use smaller title in collapsed state, use regular size (4) when full screen -->
                                            <span
                                                :class="{
                                                    'has-text-success':
                                                        isActiveTrack,
                                                    'is-size-4': isFullscreen,
                                                    'is-size-5': !isFullscreen,
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
                                    <div
                                        class="level-item is-hidden-mobile-when-video"
                                    >
                                        <PlayheadSlider
                                            class="is-fullwidth"
                                            :model-value="currentPosition ?? 0"
                                            :track-duration="track.Duration"
                                            :disabled="!canPlay"
                                            @update:model-value="
                                                (position) =>
                                                    seekToSeconds(position)
                                            "
                                            @seek="(seconds) => seek(seconds)"
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
                                            :hide-stop-button="true"
                                            :hide-track-navigation="false"
                                            :has-previous-track="
                                                hasPreviousTrack
                                            "
                                            :has-previous-cue="hasPreviousCue"
                                            :has-next-cue="hasNextCue"
                                            :has-next-track="hasNextTrack"
                                            :playback-mode="playbackMode"
                                            :is-fading-enabled="isFadingEnabled"
                                            :is-pre-roll-enabled="
                                                isPreRollEnabled
                                            "
                                            :volume="track.Volume"
                                            :is-fading="
                                                isFading !== FadingMode.None
                                            "
                                            :hide-play-pause-button="false"
                                            :hide-pre-roll-toggler="
                                                hidePreRollToggler
                                            "
                                            :hide-fading-toggler="
                                                hideFadingToggler
                                            "
                                            :disabled="!canPlay"
                                            data-cy="media-controls-bar"
                                            @stop="stop()"
                                            @previous-track="
                                                $emit('previousTrack')
                                            "
                                            @previous-cue="toPreviousCue()"
                                            @next-cue="toNextCue()"
                                            @next-track="$emit('nextTrack')"
                                            @update:playback-mode="
                                                updatedPlaybackMode
                                            "
                                            @update:is-fading-enabled="
                                                updatedIsFadingEnabled
                                            "
                                            @update:is-pre-roll-enabled="
                                                updatedIsPreRollEnabled
                                            "
                                            @update:volume="updateVolume"
                                            @seek="(seconds) => seek(seconds)"
                                            @toggle-playing="skipToPlayPause()"
                                        >
                                            <PlaybackIndicator
                                                :is-ready="
                                                    !isTrackPlaying &&
                                                    isTrackLoaded
                                                "
                                                :is-unloaded="!isTrackLoaded"
                                                :is-unavailable="
                                                    !isMediaAvailable
                                                "
                                                data-cy="playback-indicator"
                                            />
                                        </MediaControlsBar>
                                    </div>
                                </div>
                            </div>

                            <!-- Offer the cue buttons as bar or block, depending on the situation. -->
                            <div
                                class="block"
                                :class="{
                                    'next-is-empty': isAudioTrack,
                                }"
                            >
                                <div v-if="isFullscreen">
                                    <CueButtonsField
                                        :playback-mode="playbackMode"
                                        :cues="track.Cues"
                                        @click="
                                            (cue) => {
                                                cueClick(cue);
                                            }
                                        "
                                    ></CueButtonsField>
                                </div>
                                <div
                                    v-if="
                                        (!isOnlyMediaTrack &&
                                            !isFullscreen &&
                                            isPlayable) ||
                                        (!isFullscreen && isMixable)
                                    "
                                >
                                    <CueButtonsBar
                                        :playback-mode="playbackMode"
                                        :cues="track.Cues"
                                        @click="
                                            (cue) => {
                                                cueClick(cue);
                                            }
                                        "
                                    ></CueButtonsBar>
                                </div>
                            </div>

                            <!-- The media viewport -->
                            <!-- Hide the waveform and Video for non-expanded track during edit, save screen real estate -->
                            <!-- //TODO make a proper distance, (using block?), but only if there is content to display -->
                            <div
                                v-show="!isEditable || isExpanded"
                                class="block"
                            >
                                <!-- //TODO currently the mediaUrl is not using the optimized
                variant, because otherwise the track is not correctly loaded
                after it has become the active track ( gets
                play-request-was-interrupted) -->
                                <TrackMediaElement
                                    v-if="isVideoTrack || isAudioTrack"
                                    :key="track.Id"
                                    :enable-video="isVideoTrack"
                                    :title="track.Name"
                                    :media-url="mediaUrl"
                                    :start="track.PlayheadPosition"
                                    :track-id="track.Id"
                                    :cues="track.Cues"
                                    :track-pre-roll="track.PreRoll"
                                    :show-level-meter-for-edit="
                                        showLevelMeterForEdit
                                    "
                                    :show-waveforms-on-edit="
                                        showWaveformsOnEdit
                                    "
                                    :show-overview-waveform-on-edit="
                                        showOverviewWaveformOnEdit
                                    "
                                    :level-meter-size-is-large="
                                        levelMeterSizeIsLarge
                                    "
                                    :small-video="!isFullscreen"
                                    @ready="useMediaHandler"
                                    @click="setActiveTrack"
                                ></TrackMediaElement>
                                <div v-if="isYoutubeVideoTrack">
                                    <OnYouTubeConsent>
                                        <!-- The YouTube player must get recreated on teleportation changes, 
                                            thus the usePlayerPanel is added to the key -->
                                        <TrackYouTubeElement
                                            :key="track.Id + usePlayerPanel"
                                            :title="track.Name"
                                            :url="mediaUrl"
                                            :start="track.PlayheadPosition"
                                            :track-id="track.Id"
                                            :cues="track.Cues"
                                            :track-pre-roll="track.PreRoll"
                                            :small-video="!isFullscreen"
                                            @ready="useMediaHandler"
                                            @click="setActiveTrack"
                                        ></TrackYouTubeElement>
                                    </OnYouTubeConsent>
                                </div>
                            </div>
                        </div>
                    </FullscreenPanel>
                </Transition>
            </Teleport>
        </div>
    </div>
</template>

<script setup lang="ts">
/** Displays a track div with a title, and a panel with a dedicated media player and the cue buttons for it.
 * @displayName MediaTrack
 * @remarks The panel is initially collapsed and no media is loaded into the player, as a performance optimization.
 * Details:
 * - The collapsed panel is not removed from the DOM because of issues with the ref handling in conjunction with v-if
 * - However, the player's src property is only set when actually used to keep the memory footprint low.
 * @remarks Also handles the common replayer events for tracks
 */
import {
    type PropType,
    type Ref,
    computed,
    provide,
    readonly,
    ref,
    watch,
    watchEffect,
} from 'vue';
import { nextTick } from 'process';
import OnYouTubeConsent from '@/components/dialogs/OnYouTubeConsent.vue';
import CueLevelEditors from '@/components/CueLevelEditors.vue';
import MeterLevelEditor from '@/components/editor/MeterLevelEditor.vue';
import TrackMediaElement from '@/components/track/TrackMediaElement.vue';
import TrackYouTubeElement from '@/components/track/TrackYouTubeElement.vue';
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
import FullscreenPanel from '@/components/FullscreenPanel.vue';
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
import type { IMediaHandler } from '@/code/media/IMediaHandler';
import { type IMediaLooper, LoopMode } from '@/code/media/IMediaLooper';
import { MediaLooper } from '@/code/media/MediaLooper';
import { FadingMode } from '@/code/media/IAudioFader';
import type { ICueScheduler } from '@/code/media/ICueScheduler';
import { CueScheduler } from '@/code/media/CueScheduler';
import { TrackViewMode } from '@/store/TrackViewMode';
import type { ICue } from '@/store/ICue';
import { PlaybackMode } from '@/store/PlaybackMode';
import type { ITrack } from '@/store/ITrack';
import { useTitle } from '@vueuse/core';
import router, { Route } from '@/router';

const emit = defineEmits([
    /** Occurs, when the previous track should be set as the active track
     * @remarks allows track navigation from within a track.
     */
    'previousTrack',

    /** Occurs, when the next track should be set as the active track
     * @remarks allows track navigation from within a track.
     */
    'nextTrack',

    /** Occurs, when this track starts playing.
     */
    'isTrackPlaying',

    /** Occurs on a seek operation
     */
    'seekToSeconds',

    /** Occurs, when the user toggles the playback mode */
    'update:playbackMode',

    /** Occurs, when the user changes the fading enabled state */
    'update:isFadingEnabled',

    /** Occurs, when the user changes the pre-roll enabled state */
    'update:isPreRollEnabled',

    /** Occurs, when the end of the track has been reached and playback has ended.
     * @remarks This is not triggered when the track or one of it's cue is looping.
     * @remarks Allows to select the next track in "play all" and "shuffle" mode.
     */
    'trackEnded',
]);

const props = defineProps({
    /** The track to handle
     */
    track: {
        type: Object as PropType<ITrack>,
        required: true,
    },

    /** Whether this track has a previous track
     */
    hasPreviousTrack: {
        type: Boolean,
        default: false,
    },

    /** Whether this track has a next track to skip to
     */
    hasNextTrack: {
        type: Boolean,
        default: false,
    },

    /** Whether this is the only track in the compilation
     * @remarks Is used to visually omit some unnecessary items for a compilation with just a single track
     */
    isOnlyMediaTrack: {
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

    /** The playback mode
     * @remarks Used overall in the compilation, not per track
     */
    playbackMode: {
        type: String as PropType<PlaybackMode>,
        required: true,
        default: PlaybackMode.PlayTrack,
    },

    /** Whether fading is enabled
     * @remarks Used overall in the compilation, not per track
     */
    isFadingEnabled: {
        type: Boolean,
        required: false,
        default: true,
    },

    /** Whether pre-roll is enabled
     * @remarks Used overall in the compilation, not per track
     */
    isPreRollEnabled: {
        type: Boolean,
        required: false,
        default: true,
    },
});

// --- metering ---

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

/** The track's musical meter
 * @devdoc This value is provided to descendant components using the provide/inject pattern.
 * @devdoc Here, a ComputedRef must be used, not a ref, because the ref of the dereferenced meter
 * would not be reactive.
 */
const meter = computed(() => props.track.Meter);
provide(meterInjectionKey, readonly(meter));

// --- playback handling

/** A reference to the appropriate media handler
 * @remarks Gets set only after the respective track media component emits the ready-to-play event.
 */
const mediaHandler: Ref<IMediaHandler | null> = ref(null);

/** A reference to the appropriate media looper
 * @remarks Gets set only after the media handler is avaialble and set.
 */
const mediaLooper: Ref<IMediaLooper | null> = ref(null);

/** A reference to the cue scheduler
 */
const cueScheduler: Ref<ICueScheduler | null> = ref(null);

/** Updates the media handler for this track, with the emitted one from the underlying component */
function useMediaHandler(handler: IMediaHandler) {
    // initialize
    console.debug('MediaTrack::useMediaHandler:id', handler.id);
    handler.fader.setVolume(props.track.Volume);

    // register for the required events
    handler.onCurrentTimeChanged.subscribe((currentTime) => {
        currentPosition.value = currentTime;
    });

    handler.onCanPlay.subscribe(() => {
        isTrackLoaded.value = true;
    });

    handler.onDurationChanged.subscribe((duration) => {
        removeCueScheduling();
        trackDuration.value = duration;
        app.updateDurations(props.track.Id, duration);
    });

    handler.onPausedChanged.subscribe((paused) => {
        removeCueScheduling();
        isTrackPlaying.value = !paused;
        if (paused) {
            // mmake sure we keep up-to-date persisted position when paused
            persistPlayheadPosition();
        }
    });

    handler.onEnded.subscribe(() => {
        removeCueScheduling();
        emit('trackEnded');
    });

    handler.onSeekingChanged.subscribe((seeking) => {
        removeCueScheduling();
        if (!seeking && !isTrackPlaying.value) {
            // make sure we keep up-to-date persisted position after seeking,
            // but, for playback performance reasons, only when paused
            persistPlayheadPosition();
        }
    });

    handler.fader.updateSettings(
        settings.fadeInDuration,
        settings.fadeOutDuration,
        /** Use the default pre-roll duration, only if none set on the track */
        preRollDuration.value == null
            ? settings.defaultPreRollDuration
            : preRollDuration.value,
        settings.addFadeInPreRoll,
    );

    handler.fader.onFadingChanged.subscribe((fading) => {
        isFading.value = fading;
    });

    handler.fader.onVolumeChanged.subscribe((volume) => {
        updateVolume(volume);
    });

    mediaHandler.value = handler;
    mediaLooper.value = new MediaLooper(handler);
    cueScheduler.value = new CueScheduler(handler);
}

// --- Persisted playback position ---

/** Persists the running playhead position
 * @remarks Implements #132
 * @devdoc Updates are only applied when mounted, to allow
 * proper application of the initial position before mount
 */
function persistPlayheadPosition() {
    if (props.track) {
        props.track.PlayheadPosition = currentPosition.value;
        // console.debug(
        //     `MediaTrack(${props.track.Name})::PlayheadPosition:${props.track.PlayheadPosition}`,
        // );
    }
}

// --- Transport ---

/** The (precise) playback progress in the current track, in [seconds]
 * @remarks This is used for cue event handling within the set of cues, like creating a new cue at the current position
 * @devdoc Start with the initial playhead position, which might be non-zero already
 */
const currentPosition = ref(props.track.PlayheadPosition ?? 0);
provide(currentPositionInjectionKey, readonly(currentPosition));

/** The playback progress in the current track, as a readonly, formatted, displayable text
 * @remarks This is used for track progress display within the set of cues
 */
const currentPositionDisplay = computed(() =>
    CompilationHandler.convertToDisplayTime(currentPosition.value),
);
provide(currentPositionDisplayInjectionKey, readonly(currentPositionDisplay));

// --- Track state ---

const isAudioTrack = computed(() =>
    CompilationHandler.isAudioTrack(props.track),
);
const isVideoTrack = computed(() =>
    CompilationHandler.isVideoTrack(props.track),
);
const isYoutubeVideoTrack = computed(() =>
    CompilationHandler.isYoutubeVideoTrack(props.track),
);

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
const isMuted = ref(false); //TODO fix?

/** Flag to indicate whether the track's audio is currently playing solo
 */
const isSoloed = ref(false); //TODO fix?

/** Indicates the kind of current fading */
const isFading = ref(FadingMode.None);

/** Whether the cues are currently expanded for editing */
const isExpanded = ref(false); //TODO fix?

/** The visual transition to use for skipping track */
const skipTransitionName = ref('slide-left');

const settings = useSettingsStore();
const {
    levelMeterSizeIsLarge,
    fadeInDuration,
    fadeOutDuration,
    addFadeInPreRoll,
    defaultPreRollDuration,
    showLevelMeterForEdit,
    experimentalShowPositionInTrackHeader,
    showWaveformsOnEdit,
    showOverviewWaveformOnEdit,
    experimentalUseMeter,
} = storeToRefs(settings);

/** Handles changes in the fading settings
 */
watchEffect(() => {
    mediaHandler.value?.fader?.updateSettings(
        fadeInDuration.value,
        fadeOutDuration.value,
        preRollDuration.value,
        addFadeInPreRoll.value,
    );
});

/** Computes whether the fading toggler is needed at all
 */
const hideFadingToggler = computed(
    () => fadeInDuration.value === 0 && fadeOutDuration.value === 0,
);

/** Computes whether the pre-roll toggler is needed at all
 */
const hidePreRollToggler = computed(() => preRollDuration.value === 0);

/** Applies updated fading and pre-roll to the media handler
 */
watchEffect(() => {
    if (mediaHandler.value && mediaHandler.value.fader) {
        mediaHandler.value.fader.isFadingEnabled = props.isFadingEnabled;
        mediaHandler.value.fader.isPreRollEnabled = props.isPreRollEnabled;
    }
});

const app = useAppStore();

const {
    selectedCueId,
    scheduledCueId,
    compilation,
    /**
     * @remarks A selected cue's data is used for looping on a cue's boundaries
     */
    selectedCue,
    mediaUrls,
    activeTrackId,
} = storeToRefs(app);

/// --- Transport ---

/** Stops playback and removes any selected or next cue
 * @remarks Does not assert whether this is the active track.
 */
function stop(): void {
    mediaHandler.value?.stop();
    app.updateSelectedCueId(CompilationHandler.EmptyId);
    app.updateScheduledCueId(CompilationHandler.EmptyId);
}

function toPreviousCue() {
    document.dispatchEvent(new Event(Replayer.TO_PREV_CUE));
}

function toNextCue() {
    document.dispatchEvent(new Event(Replayer.TO_NEXT_CUE));
}

/** Skips to this track (if loaded)
 * @remarks If the track is not loaded, does nothing.
 * If the track is not yet the active track, tries to activate the track and play.
 * If it's the active track, just toggles play/pause
 * @devdoc Conditional event registration inside the template did not work.
 */
function skipToPlayPause(): void {
    if (isTrackLoaded.value) {
        if (!isActiveTrack.value) {
            app.updateSelectedTrackId(props.track.Id);

            // Since the track's viewport might be hidden in the DOM,
            // let it first become un-hidden.
            nextTick(() => {
                // To account for the slide-in transition wait the
                // complete transition duration
                // This delay prevents error messages for video tracks, when the video
                // element hast the native controls enabled,
                // but is not completely visible yet
                setTimeout(
                    () => mediaHandler.value?.play(),
                    300 /*replayer-transition-duration*/,
                );
            });
        } else {
            togglePlayback();
        }
    }
}

/** Sets this track as the active track (if loaded)
 * @remarks If the track is not loaded, does nothing.
 * If the track is not yet the active track, tries to activate the track (which will autoplay).
 * If it's the active track, does nothing
 */
function setActiveTrack(): void {
    if (isTrackLoaded.value) {
        if (!isActiveTrack.value) {
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
            isMuted.value = !isMuted.value; //TODO later fix by using the media handle
        } else {
            isMuted.value = mute; //TODO later fix by using the media handle
        }
    }
}

/** Toggles the solo state of this track
 * @remarks If the track is not loaded, does nothing.
 * @param solo - If null or not given, toggles the soloed state. When given, sets to the specified state.
 * @param isAnySoloed - Provides, whether any track in the compilation is currently soloed. This is required to determine the muting of non-soloed tracks.
 */
function toggleSolo(solo: boolean | null = null): void {
    //TODO later fix by using the media handle
    if (isTrackLoaded.value) {
        if (solo === null) {
            isSoloed.value = !isSoloed.value;
        } else {
            isSoloed.value = solo;
        }
    }
}

/** Toggles the playback state, if this is the active track */
function togglePlayback() {
    if (isActiveTrack.value) {
        mediaHandler.value?.togglePlayback();
    }
}

/** Rewinds 5 seconds, if this is the active track */
function rewind() {
    if (isActiveTrack.value) {
        seek(-5);
    }
}

/** Forwards 5 seconds, if this is the active track */
function forward() {
    if (isActiveTrack.value) {
        seek(+5);
    }
}

/** Seeks forward or backward, for the given amount of seconds */
function seek(seconds: number): void {
    mediaHandler.value?.seek(seconds);
}

/** Seeks to the position, in [seconds], with emitting an event */
function seekToSeconds(seconds: number): void {
    mediaHandler.value?.seekTo(seconds);
}

/** Handles the volume down command if this is the active track */
function volumeDown() {
    if (isActiveTrack.value) {
        mediaHandler.value?.fader.volumeDown();
    }
}

/** Handles the volume up command if this is the active track */
function volumeUp() {
    if (isActiveTrack.value) {
        mediaHandler.value?.fader.volumeUp();
    }
}

/** Updates the volume of this track, regardless of whether it is the active track */
function updateVolume(volume: number) {
    app.updateTrackVolume(props.track?.Id, volume);
    mediaHandler.value?.fader.setVolume(volume);
}

/** Pauses playback and seeks to the currently selected cue's position, but only
 * if this track is the active track (i.e. the selected cue is within this track)
 */
function goToSelectedCue() {
    /*Check for the active track here (again), because otherwise some event handling
            sequences might cause actions on non-active tracks too.*/
    if (isActiveTrack.value) {
        console.debug(`MediaTrack(${props.track.Name})::goToSelectedCue`);
        if (selectedCue.value) {
            const cueTime = selectedCue.value.Time;

            //Control playback according to the play state, using a single operation.
            //This supports a possible fade operation.
            //For the cue time, handle all non-null values (Zero is valid)
            if (isTrackPlaying.value) {
                if (cueTime != null) {
                    mediaHandler.value?.pauseAndSeekTo(cueTime);
                } else {
                    mediaHandler.value?.pause();
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

/** Handle fading enabled updated
 */
function updatedIsFadingEnabled(isFadingEnabled: boolean): void {
    emit('update:isFadingEnabled', isFadingEnabled);
}

/** Handle pre-roll enabled updated
 */
function updatedIsPreRollEnabled(isPreRollEnabled: boolean): void {
    emit('update:isPreRollEnabled', isPreRollEnabled);
}

/** Handle isExpanded update
 */
function updateIsExpanded(expanded: boolean): void {
    isExpanded.value = expanded;
}

/** Handles the click of a cue button, by seeking to it and, optionally, toggling playback
 * @param cue The cue to handle
 * @param togglePlayback Whether to toggle playback. Optional, defaults to true
 * @devdoc Click invocations by the ENTER key are explicitly not handled here. These should not get handled by the keyboard shortcut engine.
 */
function cueClick(cue: ICue, togglePlayback = true) {
    console.debug(`MediaTrack(${props.track.Name})::cueClick:cue:`, cue);
    if (cue.Time != null && Number.isFinite(cue.Time)) {
        // Handle cue as current or scheduled?
        if (
            selectedCueId /*any is selected?*/ &&
            props.playbackMode == PlaybackMode.QueueCue &&
            isTrackPlaying.value
        ) {
            // Schedule the cue
            //TODO simplify this code
            if (cueScheduler.value && selectedCue.value) {
                //IDEA: Maybe we could also calculate the remaining
                //time to the current cue, not the selected cue,
                //to allow scheduling also while
                //the current cue has passed?
                const remainingTime =
                    CompilationHandler.calculateRemainingTimeToEndOfCue(
                        currentPosition.value,
                        selectedCue.value,
                    );
                if (remainingTime) {
                    console.debug(
                        `MediaTrack(${props.track.Name})::scheduling:remainingTime:`,
                        remainingTime,
                    );
                    cueScheduler.value
                        .ScheduleCue(cue, remainingTime)
                        .then(() => {
                            app.updateSelectedCueId(scheduledCueId.value);
                            app.updateScheduledCueId(
                                CompilationHandler.EmptyId,
                            );
                        })
                        .catch((reason) => {
                            console.warn(
                                `MediaTrack(${props.track.Name})::ScheduleCue:aborted:`,
                                reason,
                            );
                        });
                    app.updateScheduledCueId(cue.Id);
                }
            } else {
                console.warn('No cue selected, can not schedule the next cue');
            }
        } else {
            app.updateSelectedCueId(cue.Id);

            //Invoke the cue: set the position to this cue and handle playback
            if (togglePlayback) {
                if (isTrackPlaying.value) {
                    mediaHandler.value?.pauseAndSeekTo(cue.Time);
                } else {
                    mediaHandler.value?.playFrom(cue.Time);
                }
            } else {
                seekToSeconds(cue.Time);
            }
        }
    }
}

/** Handles the play event of a cue button, by immediately restarting playback at the cue (instead of toggling)
 * @devdoc Click invocations by the ENTER key are explicitly not handled here. These should not get handled by the keyboard shortcut engine.
 */
function cuePlay(cue: ICue) {
    console.debug(`MediaTrack(${props.track.Name})::cuePlay:cue:`, cue);
    if (cue.Time != null && Number.isFinite(cue.Time)) {
        app.updateSelectedCueId(cue.Id);

        //Set the position to this cue and handle playback
        if (isTrackPlaying.value) {
            seekToSeconds(cue.Time); //keep playing
        } else {
            mediaHandler.value?.playFrom(cue.Time);
        }
    }
}

/** Handles the request for a new cue by creating one for the current time
 */
function createNewCue(): void {
    if (currentPosition.value != null) {
        app.addCueAtTime(props.track.Id, currentPosition.value);
    } else
        throw new Error('currentPosition must be available for adding a cue');
}

defineExpose({
    /** For skipping from the compilation level, to a given track, the skipToPlayPause needs to be accessible from outside */
    skipToPlayPause,
});

/** Handles changes in whether this track is playing.
 */
watch(isTrackPlaying, () => {
    // console.debug(
    //     `MediaTrack(${props.track.Name})::isTrackPlaying:`,
    //     isTrackPlaying,
    // );
    emit('isTrackPlaying', isTrackPlaying);
});

/** Whether all required values for the use of the measure number as position are available.
 */
const hasMeter = computed(() => Meter.isValid(props.track.Meter));

const remainingTime = computed(() => {
    if (currentPosition.value) {
        return CompilationHandler.calculateRemainingTime(
            currentPosition.value,
            trackDuration.value,
        );
    }
    return trackDuration.value;
});

/** Calculate the custom pre-roll for this track */
const preRollDuration = computed(() => {
    if (props.track.PreRoll !== null) {
        return props.track.PreRoll;
    }
    return defaultPreRollDuration.value;
});

/** The description of the currently playing cue
 * @remarks The implementation makes sure that at least always an empty string
 * is returned. If you add a neutral blank space character in HTML, this avoids
 * layout flicker.
 */
const playingCueDescription = computed(() => {
    //TODO later use a properly generated description like from the CueButton
    //(centralize the implementation there)
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
        //TODO maybe the also a possible scheduled cue should be considered?
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
    const time = currentPosition.value;
    if (time == null) {
        return null;
    }

    return (
        props.track.Cues.filter(
            (cue) =>
                cue.Time !== null &&
                Number.isFinite(cue.Time) &&
                cue.Duration !== null &&
                Number.isFinite(cue.Duration) &&
                time >= cue.Time &&
                time < cue.Time + (cue.Duration ?? 0),
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
    return CompilationHandler.getMatchingPackageMediaUrl(
        props.track?.Url,
        mediaUrls.value,
    )?.url;
});

/** Returns all cues of this track */
const cues = computed(() => {
    return props.track.Cues;
});

// ---  Track/cue selection ---

/** Whether this track is the active track in the set of tracks */
const isActiveTrack = computed(() => activeTrackId.value === props.track.Id);

/** Handles changes in whether this is the active track.
 * @remarks When this ceases to be the active track, pause playback.
 This avoids having multiple tracks playing at the same time.
*/
watch(
    () => isActiveTrack.value,
    (isActive, wasActive) => {
        console.debug(
            `MediaTrack(${props.track.Name})::isActiveTrack:val:`,
            isActive,
        );

        // Pause this track, when it's no more active track
        if (wasActive === true && isActive === false) {
            mediaHandler.value?.pause();
        }
    },
);

/** Handles active track id changes.
 * @remarks Used to determine the requested player widget transition.
 */
watch(activeTrackId, (activeTrackId, previousTrackId) => {
    console.debug(
        `MediaTrack(${props.track.Name})::activeTrack:activeTrackId:`,
        activeTrackId,
        'prev:',
        previousTrackId,
    );

    if (activeTrackId != null && previousTrackId != null) {
        const indexOfActive = CompilationHandler.getIndexOfTrackById(
            //Because of the possible shuffling, the tracks computed property is not used
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

/// --- player panel usage ---

/** Whether to use the dedicated player panel for the player
 */
const usePlayerPanel = computed(() => {
    return router.currentRoute.value.name === Route.Play;
});

/// --- fullscreen ---

const fullscreenPanel = ref(null);

/** Forces the fullscreen exit when this is no more the active track */
watch(
    isActiveTrack,
    (isActiveTrack) => {
        if (!isActiveTrack) {
            (
                fullscreenPanel.value as never as InstanceType<
                    typeof FullscreenPanel
                >
            )?.exit();
        }
    },
    { immediate: true },
);

// --- looping ---

watchEffect(() => {
    switch (props.playbackMode) {
        case PlaybackMode.LoopTrack:
            if (mediaLooper.value && mediaHandler.value) {
                mediaLooper.value.RemoveLoop();
                mediaHandler.value.loop = true;
            }
            break;

        case PlaybackMode.PlayCue:
        case PlaybackMode.LoopCue:
            if (mediaLooper.value && mediaHandler.value) {
                mediaHandler.value.loop = false;

                const cueBegin = selectedCue.value?.Time;
                const cueDuration = selectedCue.value?.Duration;
                if (
                    cueBegin != null &&
                    cueBegin != undefined &&
                    Number.isFinite(cueBegin) &&
                    cueDuration != null &&
                    cueDuration != undefined &&
                    Number.isFinite(cueDuration) &&
                    cueDuration > 0
                ) {
                    const loopMode =
                        props.playbackMode === PlaybackMode.LoopCue
                            ? LoopMode.Recurring
                            : LoopMode.Once;
                    mediaLooper.value.SetLoop(
                        cueBegin,
                        cueBegin + cueDuration,
                        loopMode,
                    );
                }
            }
            break;

        default:
            if (mediaHandler.value) {
                mediaHandler.value.loop = false;
            }
            if (mediaLooper.value) {
                mediaLooper.value.RemoveLoop();
            }
            break;
    }
});

// --- document title

const title = useTitle();

/** For an active track, show the cue, track and app name in the document title
 * @devdoc This does unfortunately not work when only the track changes, and
 * no named cue is playing on a newly active track. The reason for this is
 * unknown.
 * Thus, an additional title update is implemented at a parent component level.
 */
watchEffect(() => {
    const existingTitle = title.value;
    let newTitle = 'Replayer';

    if (isActiveTrack.value == true) {
        newTitle =
            (playingCueDescription.value
                ? playingCueDescription.value + ' | '
                : '') +
            (props.track?.Name ? props.track?.Name + ' | ' : '') +
            newTitle;

        if (existingTitle !== newTitle) {
            console.debug(
                `MediaTrack(${props.track.Name})::title.value:`,
                newTitle,
            );
            title.value = newTitle;
        }
    }
});

// --- handling the cue scheduling

/** Removes the cue scheduling
 */
function removeCueScheduling(): void {
    app.updateScheduledCueId(CompilationHandler.EmptyId);
    cueScheduler.value?.RemoveSchedule();
}
</script>

<style lang="scss" scoped>
/* Track player widget specific styles*/

/* NOTE: class 'next-is-empty' is a trick to avoid extra bottom margin
         for this block, when it's not the last,
         but the last with actually visible content */
#media-player-panel .section .block.next-is-empty {
    margin-bottom: 0;
}

/* Track item styles*/

// Define an overall width allocation for fixed right-hand side of the playback control level items
.level {
    .level-left {
        // The value for the basis have been empirically found to work best on
        // Google Chrome, Brave and Firefox, on Ubuntu
        flex-basis: calc(100% - 686px);
        .level-item {
            flex-shrink: 1;
        }
    }
    .level-right {
        flex-basis: 686px;
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

/** Hide the widget track slider for video content, when used in the media player panel, on mobile devices */
@media screen and (max-width: 768px) {
    #media-player-panel .widget.is-youtube-video .is-hidden-mobile-when-video,
    #media-player-panel .widget.is-video .is-hidden-mobile-when-video {
        display: none;
    }
}
</style>
<style lang="scss">
/** Specific styles for a vertical level in the header (if used there).
These are chosen for a nice visual fit in the header */
.track-header {
    .audio-level-container {
        meter.audio-level-meter {
            max-width: 40px;
            transform: rotate(-90deg);
        }
    }
}
</style>
