<template>
    <!-- Have some more margin to keep the editing track separate from the other, listed tracks -->
    <div
        class="track is-together-print"
        :class="{
            'is-active-track': isActiveTrack,
            'is-inactive-track': !isActiveTrack,
            'is-editable': isTrackEditable,
            'is-audio': isAudioTrack,
            'is-video': isVideoTrack,
            'is-youtube-video': isYoutubeVideoTrack,
        }"
        data-cy="track-media"
        @click="setActiveTrack()"
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
                v-model:is-expanded="isExpanded"
                :can-collapse="!hasSingleMediaTrack"
                :track="track"
                :is-active="isActiveTrack"
            >
                <template
                    v-if="isTrackMixable || isTrackPlayable || isTrackEditable"
                    #left-start
                >
                    <div class="level-item is-narrow">
                        <div v-if="isYoutubeVideoTrack">
                            <OnYouTubeConsent class="mr-2"></OnYouTubeConsent>
                        </div>

                        <!-- Routing controls only when mixable -->
                        <template v-if="isTrackMixable">
                            <SelectButton
                                :disabled="!canPlay"
                                :is-selected="isActiveTrack"
                                data-cy="select"
                                @click="setActiveTrack()"
                                ><span
                                    :class="{
                                        'is-invisible': track.Cues.length == 0,
                                    }"
                                    class="has-text-warning"
                                    >{{ track.Cues.length }}</span
                                ></SelectButton
                            >
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
                        </template>
                        <PlayPauseButton
                            v-else
                            :disabled="!canPlay"
                            :class="{
                                'is-success': isActiveTrack,
                                'is-clickable': canPlay,
                                'has-cursor-not-allowed': !canPlay,
                            }"
                            :is-loading="isFading !== FadingMode.None"
                            data-cy="toggle-playback"
                            @click="app.skipToPlayPause(props.track)"
                        />
                        <!-- Cue count (without expander in play mode) -->
                        <span
                            v-if="!hasSingleMediaTrack"
                            :class="{
                                'is-hidden': track.Cues.length == 0,
                            }"
                            class="ml-3 tag is-warning is-rounded is-hidden-mobile is-unselectable"
                            >{{ track.Cues.length }}</span
                        >

                        <!-- Title -->
                        <TrackTitle
                            v-if="!isTrackEditable"
                            class="is-flex-shrink-1 ml-3"
                            :class="{
                                'is-clickable': canPlay,
                                'has-cursor-not-allowed': !canPlay,
                            }"
                            :track="track"
                            :is-active="isActiveTrack"
                            @click="setActiveTrack()"
                        ></TrackTitle>
                    </div>
                </template>

                <template #left-additional> </template>

                <template #right-start>
                    <!-- Placeholder for the audio level meter (used for teleporting from the player component) -->
                    <div class="level-item is-narrow mr-0">
                        <div
                            :class="{
                                'is-clickable': canPlay,
                                'has-cursor-not-allowed': !canPlay,
                            }"
                            @click="app.skipToPlayPause(props.track)"
                        >
                            <span
                                :id="`track-${track.Id}-HeaderLevelPlaceholder`"
                            ></span>
                        </div>
                    </div>
                </template>
                <template #right-action-items>
                    <div class="level-item is-narrow mr-0 is-hidden-mobile">
                        <!-- NOTE: In all except the mix mode, the volume button 
                         is displayed as part of the transport/player widget area, 
                         not in the header -->
                        <VolumeKnob
                            v-if="isTrackMixable"
                            :disabled="!canPlay"
                            :volume="track.Volume"
                            @update:volume="updateVolume"
                        />
                    </div>
                    <div class="level-item is-narrow mr-0">
                        <PlaybackIndicator
                            :fading-duration="fadingDuration"
                            :fading-action="isFading"
                            :state="playbackState"
                            data-cy="playback-indicator"
                        />
                    </div>
                </template>
            </TrackHeader>
        </div>

        <!-- The buttons field (for a single track in play mode) -->
        <div
            v-if="isTrackPlayable && hasSingleMediaTrack && hasCues"
            :key="track.Id"
            class="block transition-in-place"
        >
            <CueButtonsField
                :disabled="!canPlay"
                :playback-mode="playbackMode as PlaybackMode"
                :track="track"
                :is-active-track="isActiveTrack"
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
            <div v-if="isTrackEditable && isExpanded" class="block">
                <!-- @devdoc: MeterLevelEditor does not use the provide/inject pattern, 
                    although it is used for the track's descendant components otherwise,
                    because I have experienced problems with the reactivity inside MeterLevelEditor.
                    A standard property/event approach is used here instead. -->
                <MeterLevelEditor
                    v-if="experimentalUseMeter && isTrackEditable"
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
                    >
                        <div
                            v-experiment="experimentalUseMeter"
                            class="level-item"
                        >
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

                        <div
                            v-experiment="experimentalUseMeter"
                            class="level-item"
                        >
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
                v-if="isTrackEditable && isExpanded"
                class="block levels"
                data-cy="cue-editors"
            >
                <CueLevelEditors
                    :cues="cues"
                    :disabled="!canPlay"
                    :playback-mode="playbackMode as PlaybackMode"
                    @click="cueClick"
                    @seek="
                        (cue: ICue) => {
                            if (cue.Time) {
                                seekToSeconds(
                                    cue.Time,
                                    true /* omit fade-in when editing*/,
                                );
                            }
                        }
                    "
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
                v-if="isTrackEditable && isExpanded"
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
                        :model-value="currentPositionCoarse"
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
                            <!-- Avoid layout flicker by always having at least a neutral blank space -->
                            <span>
                                {{
                                    playingCueDescription
                                        ? playingCueDescription
                                        : '&nbsp;'
                                }}
                            </span>
                            <span class="ml-2 is-italic is-size-7">{{
                                playingCue?.Remarks
                            }}</span>
                        </p>
                    </PlayheadSlider>
                </div>
                <div class="level-right">
                    <div class="level-item is-justify-content-flex-end">
                        <MediaControlsBar
                            :disabled="!canPlay"
                            :hide-stop-button="true"
                            :hide-track-navigation="true"
                            :has-previous-track="
                                !isFirstMediaTrack || isLoopingPlaybackMode
                            "
                            :has-next-track="
                                !isLastMediaTrack || isLoopingPlaybackMode
                            "
                            :hide-cue-navigation="true"
                            :playback-mode="playbackMode"
                            :is-pre-roll-enabled="isPreRollEnabled"
                            :volume="track.Volume"
                            :hide-play-pause-button="true"
                            @update:playback-mode="updatedPlaybackMode"
                            @update:volume="updateVolume"
                        >
                            <template #after-play>
                                <MediaContextMenu
                                    v-if="mediaHandler"
                                    :handler="mediaHandler"
                                    :track="track"
                                />
                            </template>
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
            <Teleport to="#media-player-panel" :disabled="isTrackEditable">
                <!-- The player widget for a track may be full screen only for the active track -->
                <FullscreenPanel
                    ref="fullscreenPanel"
                    v-slot="{
                        isFullscreen,
                        hasNative: hasNativeFullscreenSupport,
                        toggle,
                    }"
                >
                    <Transition :name="skipTransitionName">
                        <!-- 
                    In the play view, the player widget is only shown for the active track
                    In the edit view, the player widgets are shown for all expanded tracks
                    In the mix view a dedicated mix widget is shown (defined as separate div) -->
                        <!-- NOTE: A v-show is used instead of a v-if to keep the media players permanently in the DOM. -->
                        <div
                            v-show="
                                (isTrackMixable && isActiveTrack) ||
                                (isTrackPlayable && isActiveTrack) ||
                                (isTrackEditable && isExpanded)
                            "
                            :key="track.Id"
                            :class="{
                                section: isTrackPlayable || isTrackMixable,
                                'transition-in-place':
                                    isTrackPlayable ||
                                    isTrackMixable /* because in playback  or mix view, the players are replaced in place, not expanded */,
                                'has-background-grey-dark': !isFullscreen,
                                'is-fullscreen': isFullscreen,
                                'is-single-media-track': hasSingleMediaTrack,
                            }"
                            :disabled="!canPlay"
                        >
                            <!-- The messages need to be shown inside the native fullscren element; otherwise they would get hidden below -->
                            <MessageOverlay
                                v-if="
                                    isFullscreen && hasNativeFullscreenSupport
                                "
                            />

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
                                v-if="isTrackPlayable"
                                class="widget level has-breakpoint-desktop"
                                :class="{
                                    'is-audio': isAudioTrack,
                                    'is-video': isVideoTrack,
                                    'is-youtube-video': isYoutubeVideoTrack,
                                }"
                            >
                                <!-- Left side (with expander, title and artist etc... of the currently playing track) -->
                                <div class="level-left">
                                    <!-- Title of the currently playing track-->
                                    <div
                                        class="level-item is-justify-content-left has-cropped-text"
                                    >
                                        <!-- Offer the full screen-->
                                        <FullscreenToggler
                                            v-if="hasNativeFullscreenSupport"
                                            :model-value="isFullscreen"
                                            title="Toggle full-screen mode"
                                            @click="toggle"
                                        ></FullscreenToggler>
                                        <CollapsibleButton
                                            v-else
                                            :model-value="isFullscreen"
                                            title="Toggle full-page mode"
                                            collapsed-chevron-direction="up"
                                            @click="toggle"
                                        ></CollapsibleButton>
                                        <!-- Keep some distance to the fullscreen button -->

                                        <p class="ml-3">
                                            <!-- Title -->
                                            <!-- Use smaller title in collapsed/non-fullscreen state -->
                                            <TrackTitle
                                                v-if="!isTrackEditable"
                                                class="is-flex-shrink-1 ml-3"
                                                :class="{
                                                    'is-clickable': canPlay,
                                                    'has-cursor-not-allowed':
                                                        !canPlay,
                                                }"
                                                :track="track"
                                                :is-active="isActiveTrack"
                                                :small="!isFullscreen"
                                                @click="setActiveTrack()"
                                            ></TrackTitle>
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
                                            :model-value="currentPositionCoarse"
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
                                                <!-- Avoid layout flicker by always having at least a neutral blank space -->
                                                <span>
                                                    {{
                                                        playingCueDescription
                                                            ? playingCueDescription
                                                            : '&nbsp;'
                                                    }}
                                                </span>
                                                <span
                                                    class="ml-2 is-italic is-size-7"
                                                    >{{
                                                        playingCue?.Remarks
                                                    }}</span
                                                >
                                            </p>
                                        </PlayheadSlider>
                                    </div>

                                    <div
                                        class="level-item is-justify-content-flex-end"
                                    >
                                        <MediaControlsBar
                                            :hide-stop-button="true"
                                            :hide-track-navigation="true"
                                            :has-previous-track="
                                                !isFirstMediaTrack ||
                                                isLoopingPlaybackMode
                                            "
                                            :has-next-track="
                                                !isLastMediaTrack ||
                                                isLoopingPlaybackMode
                                            "
                                            :has-previous-cue="hasPreviousCue"
                                            :has-next-cue="hasNextCue"
                                            :playback-mode="
                                                playbackMode as PlaybackMode
                                            "
                                            :is-pre-roll-enabled="
                                                isPreRollEnabled
                                            "
                                            :volume="track.Volume"
                                            :is-fading="
                                                isFading !== FadingMode.None
                                            "
                                            :hide-play-pause-button="false"
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
                                            @update:volume="updateVolume"
                                            @seek="(seconds) => seek(seconds)"
                                            @toggle-playing="
                                                app.skipToPlayPause(props.track)
                                            "
                                        >
                                            <template #start>
                                                <MediaContextMenu
                                                    v-if="mediaHandler"
                                                    :handler="mediaHandler"
                                                    :track="track"
                                                />
                                            </template>
                                            <PlaybackIndicator
                                                :fading-duration="
                                                    fadingDuration
                                                "
                                                :fading-action="isFading"
                                                :state="playbackState"
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
                                        :playback-mode="
                                            playbackMode as PlaybackMode
                                        "
                                        :track="track"
                                        :disabled="!canPlay"
                                        :is-active-track="isActiveTrack"
                                        @click="
                                            (cue) => {
                                                cueClick(cue);
                                            }
                                        "
                                    ></CueButtonsField>
                                </div>
                                <div
                                    v-if="
                                        (!hasSingleMediaTrack &&
                                            !isFullscreen &&
                                            isTrackPlayable) ||
                                        (!isFullscreen && isTrackMixable)
                                    "
                                >
                                    <CueButtonsBar
                                        :playback-mode="
                                            playbackMode as PlaybackMode
                                        "
                                        :cues="track.Cues"
                                        :disabled="!canPlay"
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
                            <div
                                v-show="!isTrackEditable || isExpanded"
                                class="block"
                            >
                                <TrackMediaElement
                                    v-if="isVideoTrack || isAudioTrack"
                                    :key="track.Id"
                                    :enable-video="isVideoTrack"
                                    :media-url="mediaUrl"
                                    :start="track.PlayheadPosition"
                                    :track-id="track.Id"
                                    :cues="track.Cues"
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
                                            :small-video="!isFullscreen"
                                            @click="setActiveTrack"
                                        ></TrackYouTubeElement>
                                    </OnYouTubeConsent>
                                </div>
                            </div>
                        </div>
                    </Transition>
                </FullscreenPanel>
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
    onBeforeUnmount,
} from 'vue';
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
import MediaContextMenu from '@/components/context-menu/MediaContextMenu.vue';
import PlayPauseButton from '@/components/buttons/PlayPauseButton.vue';
import CreateCueButton from '@/components/buttons/CreateCueButton.vue';
import CollapsibleButton from '@/components/buttons/CollapsibleButton.vue';
import FullscreenToggler from '@/components/buttons/FullscreenToggler.vue';
import MuteButton from '@/components/buttons/MuteButton.vue';
import SoloButton from '@/components/buttons/SoloButton.vue';
import SelectButton from '@/components/buttons/SelectButton.vue';
import MeasureDisplay from '@/components/MeasureDisplay.vue';
import MetricalEditor from '@/components/editor/MetricalEditor.vue';
import CompilationHandler from '@/store/compilation-handler';
import PlayheadSlider from '@/components/PlayheadSlider.vue';
import VolumeKnob from '@/components/controls/VolumeKnob.vue';
import PlaybackIndicator from '@/components/indicators/PlaybackIndicator.vue';
import FullscreenPanel from '@/components/FullscreenPanel.vue';
import TrackTitle from '@/components/track/TrackTitle.vue';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/store/app';
import { Meter } from '@/code/music/Meter';
import {
    currentPositionDisplayInjectionKey,
    currentPositionInjectionKey,
    meterInjectionKey,
    useMeasureNumbersInjectionKey,
    trackPreRollDurationInjectionKey,
    trackFadeInDurationInjectionKey,
    isOmittingNextFadeInInjectionKey,
} from './TrackInjectionKeys';
import { playbackStateInjectionKey } from './TrackInjectionKeys';
import { ReplayerEvent } from '@/code/ui/ReplayerEvent';
import type { IMediaHandler } from '@/code/media/IMediaHandler';
import { LoopMode } from '@/code/media/IMediaLooper';
import { FadingMode } from '@/code/media/IAudioFader';
import type { ICueScheduler } from '@/code/media/ICueScheduler';
import { CueScheduler } from '@/code/media/CueScheduler';
import type { ICue } from '@/store/ICue';
import { PlaybackMode } from '@/store/PlaybackMode';
import type { ITrack } from '@/store/ITrack';
import router, { Route } from '@/router';
import MessageOverlay from '@/components/MessageOverlay.vue';
import type { ICompilation } from '@/store/ICompilation';
import { useAudioStore } from '@/store/audio';
import {
    SubEvent,
    Subscription,
    type ISubOptions,
    type SubFunction,
} from 'sub-events';
import { PlaybackState } from '@/code/media/PlaybackState';

const emit = defineEmits([
    /** Occurs, when the previous track should be set as the active track
     * @remarks allows track navigation from within a track.
     */
    'previousTrack',

    /** Occurs, when the next track should be set as the active track
     * @remarks allows track navigation from within a track.
     */
    'nextTrack',

    /** Occurs on a seek operation
     */
    'seekToSeconds',

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

    /** Whether any track (including this one) in the compilation is currently soloed.
     * This is required to determine the muting of non-soloed tracks.
     */
    isAnySoloed: {
        type: Boolean,
        required: false,
        default: false,
    },
});

const app = useAppStore();
const {
    isTrackEditable,
    isTrackPlayable,
    isTrackMixable,
    playbackMode,
    isLoopingPlaybackMode,
    isPreRollEnabled,
} = storeToRefs(app);

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

const audio = useAudioStore();

/** A reference to the appropriate media handler
 * @remarks This handler is available only after the respective track media component added it's handler to the audio store.
 */
const mediaHandler = computed(() =>
    audio.getMediaHandlerByTrackId(props.track.Id),
);

/** A reference to the cue scheduler
 */
const cueScheduler: Ref<ICueScheduler | null> = ref(null);

let currentTimeChangedSubscription: Subscription;
let onCanPlaySubscription: Subscription;
let onDurationChangedSubscription: Subscription;
let onPauseChangedSubscription: Subscription;
let onNextFadeInOmissionChangedSubscription: Subscription;
let onEndedSubscription: Subscription;
let onSeekingChangedSubscription: Subscription;
let onFadingChangedSubscription: Subscription;
let onVolumeChangedSubscription: Subscription;
let onMutedChangedSubscription: Subscription;
let onSoloedChangedSubscription: Subscription;
let onPlaybackRateChangedSubscription: Subscription;
let onPitchShiftChangedSubscription: Subscription;

/** Updates a received media handler for this track */
function assumeMediaHandler(handler: IMediaHandler) {
    // initialize from persisted track values
    console.debug('MediaTrack::assumeMediaHandler:id', handler.id);
    handler.fader.setVolume(props.track.Volume);
    handler.fader.updateSettings(
        settings.fadeInDuration,
        settings.fadeOutDuration,
        settings.addFadeInPreRoll,
    );
    handler.playbackRateController.playbackRate = props.track.PlaybackRate;
    handler.pitchShiftController.pitchShift = props.track.PitchShift;
    //TODO why we do not have a persisted currentTime??

    // register for the required events (immediately initializing some of the
    // internal state to initial values)
    currentTimeChangedSubscription =
        handler.onCurrentTimeChanged.subscribeImmediate(
            (currentTime: number) => {
                updateCurrentPosition(currentTime);
            },
        );

    onCanPlaySubscription = handler.onCanPlay.subscribeImmediate(() => {
        canPlay.value = true;
    });
    canPlay.value = handler.canPlay; // subscribeImmediate does not work for Events without value

    onDurationChangedSubscription =
        handler.onDurationChanged.subscribeImmediate((duration: number) => {
            updateDuration(duration);
        });

    onPauseChangedSubscription = handler.onPausedChanged.subscribeImmediate(
        (paused: boolean) => {
            updatePaused(paused);
        },
    );

    onPauseChangedSubscription =
        handler.onPlaybackStateChanged.subscribeImmediate(
            (playbackState: PlaybackState) => {
                updatePlaybackState(playbackState);
            },
        );

    onNextFadeInOmissionChangedSubscription =
        handler.onNextFadeInOmissionChanged.subscribeImmediate(
            (omitsNextFadeIn: boolean) => {
                isPlayerOmittingNextFadeIn.value = omitsNextFadeIn;
            },
        );

    onEndedSubscription = handler.onEnded.subscribeImmediate(() => {
        removeCueScheduling();
        emit('trackEnded');
    });

    onSeekingChangedSubscription = handler.onSeekingChanged.subscribe(
        (seeking: boolean) => {
            removeCueScheduling();
            if (!seeking && playbackState.value !== PlaybackState.Playing) {
                // make sure we keep up-to-date persisted position after seeking,
                // but, for playback performance reasons, only when paused
                persistPlayheadPosition();
            }
        },
    );

    onFadingChangedSubscription =
        handler.fader.onFadingChanged.subscribeImmediate(
            (fading: FadingMode) => {
                isFading.value = fading;
            },
        );

    onVolumeChangedSubscription =
        handler.fader.onVolumeChanged.subscribeImmediate((volume: number) => {
            updateVolume(volume);
        });

    onMutedChangedSubscription =
        handler.fader.onMutedChanged.subscribeImmediate((muted: boolean) => {
            isMuted.value = muted;
        });

    onSoloedChangedSubscription =
        handler.fader.onSoloedChanged.subscribeImmediate((soloed: boolean) => {
            isSoloed.value = soloed;
        });

    onPlaybackRateChangedSubscription =
        handler.playbackRateController.onPlaybackRateChanged.subscribeImmediate(
            (rate: number) => {
                app.updateTrackPlaybackRate(props.track?.Id, rate);
            },
        );

    onPitchShiftChangedSubscription =
        handler.pitchShiftController.onPitchShiftChanged.subscribeImmediate(
            (shift: number) => {
                app.updateTrackPitchShift(props.track?.Id, shift);
            },
        );

    cueScheduler.value = new CueScheduler(handler);
}

function updateCurrentPosition(currentTime: number) {
    currentPosition.value = currentTime;
}

function updateDuration(duration: number) {
    removeCueScheduling();
    trackDuration.value = duration;
    app.updateDurations(props.track.Id, duration);
}

function updatePaused(paused: boolean) {
    removeCueScheduling();
    if (paused) {
        // mmake sure we keep up-to-date persisted position when paused
        persistPlayheadPosition();
    }
}

function updatePlaybackState(state: PlaybackState) {
    playbackState.value = state;
}

/** Releases a used media handler for this track */
function releaseMediaHandler() {
    const handler = mediaHandler.value;
    console.debug('MediaTrack::releaseMediaHandler:id', handler?.id);

    // un-register for the registered events
    currentTimeChangedSubscription?.cancel;
    onCanPlaySubscription?.cancel;
    onDurationChangedSubscription?.cancel;
    onPauseChangedSubscription?.cancel;
    onNextFadeInOmissionChangedSubscription?.cancel;
    onEndedSubscription?.cancel;
    onSeekingChangedSubscription?.cancel;
    onFadingChangedSubscription?.cancel;
    onVolumeChangedSubscription?.cancel;
    onMutedChangedSubscription?.cancel;
    onSoloedChangedSubscription?.cancel;
    onPlaybackRateChangedSubscription?.cancel;
    onPitchShiftChangedSubscription?.cancel;

    cueScheduler.value?.RemoveSchedule();
    cueScheduler.value = null;
}

onBeforeUnmount(() => {
    releaseMediaHandler();
});

/** Update for any media handler changes.
 */
watch(
    mediaHandler,
    (newMediaHandler, oldMediaHandler) => {
        if (newMediaHandler?.id !== oldMediaHandler?.id) {
            if (oldMediaHandler) {
                releaseMediaHandler();
            }

            if (newMediaHandler) {
                assumeMediaHandler(newMediaHandler);
            }
        }
    },
    { immediate: true },
);

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

/** The coarse (with 1 digit after the comma) playback progress in the current track, in [seconds]
 * @remarks This is used for the slider progress component only
 * @devdoc A coarser value is used here to avoid unneccessarily frequent slider component updates.
 * This is quite a micro optimisation, but still saves about 50% time when the playback is running.
 */
const currentPositionCoarse = computed(
    () => Math.round(currentPosition.value * 10) / 10,
);

// --- Track state ---

/** Whether this is the first track in the set of media tracks */
const isFirstMediaTrack = computed(() => app.isFirstMediaTrack(props.track));

/** Whether this is the last track in the set of media tracks */
const isLastMediaTrack = computed(() => app.isLastMediaTrack(props.track));

const isAudioTrack = computed(() =>
    CompilationHandler.isAudioTrack(props.track),
);
const isVideoTrack = computed(() =>
    CompilationHandler.isVideoTrack(props.track),
);
const isYoutubeVideoTrack = computed(() =>
    CompilationHandler.isYoutubeVideoTrack(props.track),
);

/** Whether the current track can accept playback operations.
 * (Here, this means that the media is loaded to the extent that it's ready to play,
 * or it's actually already playing)
 * @remarks This is used to toggle playback and other button states
 */
const canPlay = ref(false);

/** Gets the duration of the current track, in [seconds]
 * @remarks This is only available after successful load of the track (i.e. it's media metadata).
 * Could be NaN or infinity, depending on the source
 */
const trackDuration: Ref<number | null> = ref(null);

/** Indicates this track's playback state
 */
const playbackState = ref(PlaybackState.Unavailable);
provide(playbackStateInjectionKey, readonly(playbackState));

/** Whether the cues are currently expanded for editing */
const isExpanded = ref(false);

/** The visual transition to use for skipping track */
const skipTransitionName = ref('item-expand');

const settings = useSettingsStore();
const {
    levelMeterSizeIsLarge,
    fadeInDuration,
    fadeOutDuration,
    addFadeInPreRoll,
    defaultPreRollDuration,
    showLevelMeterForEdit,
    showWaveformsOnEdit,
    showOverviewWaveformOnEdit,
    useFadingOnLoopBoundaries,
    experimentalUseMeter,
} = storeToRefs(settings);

const {
    selectedCueId,
    scheduledCueId,
    compilation,
    /**
     * @remarks A selected cue's data is used for looping on a cue's boundaries
     */
    selectedCue,
    activeTrackId,
} = storeToRefs(app);

// --- fading ---

/** Handles changes in the fading settings
 */
watchEffect(() => {
    mediaHandler.value?.fader?.updateSettings(
        fadeInDuration.value,
        fadeOutDuration.value,
        addFadeInPreRoll.value,
    );
});

/** Handles changes in the loop fading settings
 */
watchEffect(() => {
    const looper = mediaHandler.value?.looper;
    if (looper) {
        looper.useFadingOnLoopBoundaries = useFadingOnLoopBoundaries.value;
    }
});

/** Indicates the kind of current fading, if any */
const isFading = ref(FadingMode.None);

/** The currently fading duration in use
 * @remarks Intended for visual feedback of an ongoing fade operation
 */
const fadingDuration = computed(() => {
    if (playbackState.value === PlaybackState.Playing) {
        if (isFading.value === FadingMode.FadeIn) {
            return fadeInDuration.value;
        }
        if (isFading.value === FadingMode.FadeOut) {
            return fadeOutDuration.value;
        }
    }
    return 0; //no fading or no playback ended
});

/** Whether the media player will omit the next fade-in */
const isPlayerOmittingNextFadeIn = ref(false);

/** Whether the next playback operation omits any fade-in */
const isOmittingNextFadeInIn = computed(() => {
    return isPlayerOmittingNextFadeIn.value || settings.fadeInDuration === 0;
});

provide(isOmittingNextFadeInInjectionKey, readonly(isOmittingNextFadeInIn));

// --- Persisted playback position ---

/** Persists the running playhead position
 * @remarks Implements #132
 * @devdoc Updates are only applied when mounted, to allow
 * proper application of the initial position before mount
 */
function persistPlayheadPosition() {
    app.updatePersistedPlayheadPosition(props.track, currentPosition.value);
}

/// --- Transport ---

/** Stops playback and removes any selected or next cue
 * @remarks Does not assert whether this is the active track.
 */
function stop(): void {
    mediaHandler.value?.stop();
    app.updateSelectedCueId(CompilationHandler.EmptyId);
    app.updateScheduledCueId(CompilationHandler.EmptyId);
}

//TODO move all these events to app store
function toPreviousCue() {
    document.dispatchEvent(new Event(ReplayerEvent.TO_PREV_CUE));
}

//TODO move all these events to app store
function toNextCue() {
    document.dispatchEvent(new Event(ReplayerEvent.TO_NEXT_CUE));
}

/** Sets this track as the active track (if loaded)
 * @remarks If the track is not loaded, does nothing.
 * If the track is not yet the active track, tries to activate the track (which will autoplay).
 * If it's the active track, does nothing
 */
function setActiveTrack(): void {
    if (playbackState.value === PlaybackState.Ready) {
        if (!isActiveTrack.value) {
            app.updateSelectedTrackId(props.track.Id);
        }
    }
}

// --- mute/solo ---

/** Toggles the muted state of this track
 * @remarks If the track is not loaded, does nothing.
 * @param mute - If null or not given, toggles the muted state. When given, sets to the specified state.
 */
function toggleMute(mute: boolean | null = null): void {
    if (canPlay.value) {
        if (mediaHandler.value) {
            if (mute === null) {
                mediaHandler.value.fader.muted =
                    !mediaHandler.value?.fader.muted;
            } else {
                mediaHandler.value.fader.muted = mute;
            }
        }
    }
}

/** Whether this track is muted */
const isMuted = ref(false);

/** Toggles the solo state of this track
 * @remarks If the track is not loaded, does nothing.
 * @param solo - If null or not given, toggles the soloed state. When given, sets to the specified state.
 */
function toggleSolo(solo: boolean | null = null): void {
    if (canPlay.value) {
        if (mediaHandler.value) {
            if (solo === null) {
                mediaHandler.value.fader.soloed =
                    !mediaHandler.value?.fader.soloed;
            } else {
                mediaHandler.value.fader.soloed = solo;
            }
        }
    }
}

/** Whether this track is soloed */

const isSoloed = ref(false);

// --- transport ---

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

/** Seeks to the position, in [seconds], with emitting an event
 * @param {boolean} [omitNextFadeIn=false] - When set, omits the fade-in at a subsequent playback start. Default is false.
 */
function seekToSeconds(seconds: number, omitNextFadeIn?: boolean): void {
    mediaHandler.value?.seekTo(seconds).then(() => {
        if (omitNextFadeIn) {
            mediaHandler.value?.omitNextFadeIn();
        }
    });
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

/** Pauses playback and seeks to the currently selected cue's start position, but only
 * if this track is the active track (i.e. the selected cue is within this track)
 * @remarks Applies the effective start time for this cue, accounting for all
 * possibly set pre-roll options.
 */
function goToSelectedCue() {
    /* Check for the active track here (again), because otherwise some event handling
            sequences might cause actions on non-active tracks too.*/
    if (isActiveTrack.value) {
        const cue = selectedCue.value;
        console.debug(
            `MediaTrack(${props.track.Name})::goToSelectedCue:cue:`,
            cue,
        );
        if (cue) {
            const startTime = getCuePreRollStartTime(selectedCue.value);

            // Control playback according to the play state, using a single operation.
            // This supports a possible fade operation.
            if (playbackState.value === PlaybackState.Playing) {
                mediaHandler.value?.pauseAndSeekTo(startTime, cue.OmitFadeIn);
            } else {
                seekToSeconds(startTime, cue.OmitFadeIn);
            }
        }
    }
}

// --- playback ---

/** Toggles the playback state, if this is the active track */
function togglePlayback() {
    if (isActiveTrack.value) {
        mediaHandler.value?.togglePlayback();
    }
}

/** Handle playback mode updates
 */
function updatedPlaybackMode(updatedPlaybackMode: PlaybackMode): void {
    playbackMode.value = updatedPlaybackMode;
}

/** Gets the effective start time for this cue, accounting for all
 * possibly set pre-roll options.
 * @remarks NOTE: Fade-in specific additional pre-roll is not included.
 * Throws an error if no finite time is set on the cue.
 */
function getCuePreRollStartTime(cue: ICue): number {
    if (cue.Time != null && Number.isFinite(cue.Time)) {
        return cue.OmitPreRoll ? cue.Time : cue.Time - preRollDuration.value;
    }
    throw new Error(`Cue with id (${cue.Id}) does not have a valid time set`);
}

/** Handles the click of a cue button, by seeking to it and, optionally, toggling playback
 * @param cue The cue to handle
 * @param togglePlayback Whether to toggle playback. Optional, defaults to true
 * @devdoc Click invocations by the ENTER key are explicitly not handled here.
 * These should get handled by the keyboard shortcut engine.
 */
function cueClick(cue: ICue, togglePlayback = true) {
    console.debug(`MediaTrack(${props.track.Name})::cueClick:cue:`, cue);
    if (cue.Time != null && Number.isFinite(cue.Time)) {
        // Handle cue as current or scheduled?
        if (
            selectedCueId /*any is selected?*/ &&
            playbackMode.value == PlaybackMode.QueueCue &&
            playbackState.value === PlaybackState.Playing
        ) {
            // Schedule the cue
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

            //Invoke the cue: set the position to the start time for this cue and handle playback
            const startTime = getCuePreRollStartTime(cue);
            if (startTime != null) {
                if (togglePlayback) {
                    if (playbackState.value === PlaybackState.Playing) {
                        mediaHandler.value?.pauseAndSeekTo(
                            startTime,
                            cue.OmitFadeIn,
                        );
                    } else {
                        mediaHandler.value?.playFrom(startTime, cue.OmitFadeIn);
                    }
                } else {
                    seekToSeconds(startTime, cue.OmitFadeIn);
                }
            }
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

/** Whether all required values for the use of the measure number as position are available.
 */
const hasMeter = computed(() => Meter.isValid(props.track.Meter));

/** The pre-roll duration [in secods] to use for this track. Zero for no pre-roll.
 * @remarks This considers the default pre-roll setting and the possibly
 * defined track-specific pre-roll duration.
 */
const preRollDuration = computed(() => {
    if (props.track.PreRoll != null) {
        return props.track.PreRoll;
    }
    return defaultPreRollDuration.value;
});

/** Provide the pre-roll duration [in secods] to use for this track
 */
provide(trackPreRollDurationInjectionKey, readonly(preRollDuration));

/** Provide the fade-in duration [in secods] to use for this track
 */
provide(trackFadeInDurationInjectionKey, readonly(fadeInDuration));

/** The description of the currently playing cue
 */
const playingCueDescription = computed(() => {
    return playingCue.value?.Description;
});

/** Whether the currently playing cue is the selected cue
 * @remarks used for the playhead slider visualization
 */
const playingCueIsSelected = computed(() => {
    if (!selectedCueId.value) {
        // premature exit, if none selected none can match
        return false;
    }

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
        //to be implemented: maybe the also a possible scheduled cue should be considered?
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
        props.track?.Cues?.find(
            (cue) =>
                cue.Time !== null &&
                Number.isFinite(cue.Time) &&
                cue.Duration !== null &&
                Number.isFinite(cue.Duration) &&
                time >= cue.Time &&
                time < cue.Time + (cue.Duration ?? 0),
        ) ?? null
    );
});

/** Gets the effective media source URL for this track
 */
const mediaUrl = computed(() => {
    return app.getMediaUrlByTrack(props.track);
});

/** Returns all cues of this track */
const cues = computed(() => {
    return props.track.Cues;
});

// ---  Track/cue selection ---

const { hasSingleMediaTrack } = storeToRefs(app);

/** Whether this track is the active track in the set of tracks */
const isActiveTrack = computed(() => activeTrackId.value === props.track.Id);

/** Handles changes in whether this is the active track.
 * @remarks When this ceases to be the active track, pause playback.
 This avoids having multiple tracks playing at the same time.
*/
watch(isActiveTrack, (isActive, wasActive) => {
    console.debug(
        `MediaTrack(${props.track.Name})::isActiveTrack:val:`,
        isActive,
    );

    // Pause and reset this track, when it's no more the active track
    if (wasActive === true && isActive === false) {
        mediaHandler.value?.pause().then(() => {
            mediaHandler.value?.seekTo(0);
        });
    }
});

/** Handles active track id changes.
 * @remarks Used to determine the requested player widget transition.
 * In edit mode, keep the default transition, as no horizontal slides are used
 * In other modes, slide according to the track index
 */
watch(
    [activeTrackId, isTrackEditable],
    ([activeTrackId, newIsEditable], [previousTrackId]) => {
        // console.debug(
        //     `MediaTrack(${props.track.Name})::activeTrack:activeTrackId:`,
        //     activeTrackId,
        //     'prev:',
        //     previousTrackId,
        // );
        if (newIsEditable) {
            skipTransitionName.value = 'item-expand';
        } else if (activeTrackId != null && previousTrackId != null) {
            const indexOfActive = CompilationHandler.getIndexOfTrackById(
                //Because of the possible shuffling, the tracks computed property is not used
                (compilation.value as ICompilation).Tracks,
                activeTrackId,
            );

            const indexOfPrevious = CompilationHandler.getIndexOfTrackById(
                (compilation.value as ICompilation).Tracks,
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
    },
);

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
    switch (playbackMode.value) {
        case PlaybackMode.LoopTrack:
            if (mediaHandler.value) {
                mediaHandler.value.looper.RemoveLoop();
                mediaHandler.value.loop = true;
            }
            break;

        case PlaybackMode.PlayCue:
        case PlaybackMode.LoopCue:
            if (mediaHandler.value) {
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
                        playbackMode.value === PlaybackMode.LoopCue
                            ? LoopMode.Recurring
                            : LoopMode.Once;
                    mediaHandler.value.looper?.SetLoop(
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
            mediaHandler.value?.looper?.RemoveLoop();
            break;
    }
});

// --- document title

/** For an active track, show the cue, track and app name in the document title
 * @devdoc VueUse/useTitle does unfortunately not work when only the track
 * changes from a track with cues and
 * no named cue is playing on a newly active track. The reason for this is
 * unknown.
 * Thus, an explicit document title update is used here.
 */
watch(
    [playingCueDescription, isActiveTrack],
    ([playingCueDescription, isActiveTrack]) => {
        const existingTitle = document.title;
        let newTitle = 'Replayer';

        if (isActiveTrack) {
            newTitle =
                (playingCueDescription ? playingCueDescription + ' | ' : '') +
                (props.track?.Name ? props.track?.Name + ' | ' : '') +
                newTitle;

            if (existingTitle !== newTitle) {
                document.title = newTitle;
            }
        }
    },
    { immediate: true },
);

// --- handling the cue scheduling

/** Removes the cue scheduling
 */
function removeCueScheduling(): void {
    // app.updateScheduledCueId(CompilationHandler.EmptyId);
    // cueScheduler.value?.RemoveSchedule();
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
        // for the given set of playback controls
        // (slider, next/previous cue, playback mode, pre-roll toggler, fading toggler, volume knob, playback indicator)
        flex-basis: calc(100% - 620px);
        .level-item {
            flex-shrink: 1;
        }
    }
    .level-right {
        flex-basis: 620px;
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

/*******************************************************************************
* Specific width for track sliders depending on breakpoints
* @remarks This allows the use of cropped text for the
* cue description with dynamic width 
*******************************************************************************/
//.track .is-single-media-track {
@media screen and (max-width: 768px) {
    /** in Play mode */
    .playhead-slider .has-cropped-text {
        max-width: calc(100vw - 150px);
    }
    /** in Edit mode */
    .is-editable .playhead-slider .has-cropped-text {
        max-width: calc(100vw - 150px);
    }
}

@media screen and (min-width: 769px) {
    /** in Play mode */
    .playhead-slider .has-cropped-text {
        max-width: 129px;
    }
    /** in Edit mode */
    .is-editable .playhead-slider .has-cropped-text {
        max-width: calc(100vw - 640px);
    }
}
//}

/*******************************************************************************
 * Hide the widget track slider for video content, 
 * when used in the media player panel, on mobile devices 
 ******************************************************************************/
@media screen and (max-width: 768px) {
    #media-player-panel .widget.is-youtube-video .is-hidden-mobile-when-video,
    #media-player-panel .widget.is-video .is-hidden-mobile-when-video {
        display: none;
    }
}
</style>
<!-- non-scoped -->
<style lang="scss">
/** Specific styles for a vertical level in the header (if used there),
in the edit view. These are chosen for a nice visual fit in the header */
.route.edit .track-header {
    .audio-level-container {
        meter.audio-level-meter {
            max-width: 40px;
            transform: rotate(-90deg);
        }
    }
}
</style>
