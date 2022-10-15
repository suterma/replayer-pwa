<template>
    <div class="track is-together-print">
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
        <TrackHeader
            v-else
            :track="track"
            :isPlaying="isPlaying"
            :isTrackLoaded="isTrackLoaded"
            :isEditable="isEditable"
            :isActive="isActiveTrack"
        />

        <!-- The cues as buttons -->

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
                <div v-show="isActiveTrack">
                    <TrackAudioApiPlayer
                        :isEditable="isEditable"
                        ref="playerReference"
                        :title="track?.Name"
                        :mediaUrl="mediaUrl"
                        @timeupdate="updateTime"
                        @durationChanged="calculateCueDurations"
                        v-model:isPlaying="isPlaying"
                        @update:playbackMode="updatedPlaybackMode"
                        :playbackMode="track.PlaybackMode"
                        :loopStart="selectedCue?.Time"
                        :loopEnd="selectedCue?.Time + selectedCue?.Duration"
                        :sourceDescription="track?.Url"
                        @update:volume="updatedVolume"
                        :volume="track.Volume"
                    ></TrackAudioApiPlayer>
                </div>
            </Teleport>
        </template>

        <!-- The cue buttons (in play mode) -->
        <template v-if="!isEditable">
            <div class="buttons">
                <template v-for="cue in cues" :key="cue.Id">
                    <CueButton
                        :cue="cue"
                        :isTrackPlaying="isPlaying"
                        :currentSeconds="currentSeconds"
                        @click="cueClick(cue)"
                    />
                </template>

                <Experimental>
                    <!-- Extra cue trigger button (with similar layouting as a regular cue button) -->

                    //TODO move the cue class styles up to the
                    .track.buttons.button selector. Then remove the cue class
                    here
                    <button
                        :class="{
                            button: true,
                            cue: true,
                            'is-multiline': true,
                            'has-text-left': 'true',
                        }"
                        title="Create a cue now (at the current playback time)!"
                    >
                        <span>
                            <BaseIcon name="plus" />
                            &nbsp;
                            <span class="has-text-weight-semibold foreground"
                                >Add cue!</span
                            >
                            <br />
                            <!-- second line (use a horizontal level also on mobile)-->
                            <span class="level is-mobile">
                                <div class="level-item mr-3">
                                    <TimeDisplay
                                        class="has-opacity-half foreground"
                                        :modelValue="currentSeconds"
                                    ></TimeDisplay>
                                </div>
                            </span>
                        </span>
                    </button>
                </Experimental>
            </div>
        </template>
        <template v-else>
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
import CueButton from '@/components/buttons/CueButton.vue';
import CueLevel from '@/components/CueLevel.vue';
import TrackAudioApiPlayer from '@/components/TrackAudioApiPlayer.vue';
import { MediaUrl } from '@/store/state-types';
import { MutationTypes } from '@/store/mutation-types';
import ReplayerEventHandler from '@/components/ReplayerEventHandler.vue';
import TrackHeaderEdit from '@/components/TrackHeaderEdit.vue';
import Experimental from '@/components/Experimental.vue';
import TrackHeader from '@/components/TrackHeader.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import CompilationHandler from '@/store/compilation-handler';
import { settingsMixin } from '@/mixins/settingsMixin';
import NoSleep from 'nosleep.js';
import { ActionTypes } from '@/store/action-types';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import { Hotkey } from '@simolation/vue-hotkey';

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
        CueButton,
        CueLevel,
        TrackAudioApiPlayer,
        ReplayerEventHandler,
        TrackHeader,
        TrackHeaderEdit,
        BaseIcon,
        Experimental,
        TimeDisplay,
        Hotkey,
    },
    mixins: [settingsMixin],
    props: {
        /** The track to display
         * @remarks One of track or trackId is required.
         */
        track: {
            type: Track,
            required: true,
        },

        /** The display mode of this track.
         * @devdoc Allows to reuse this component for more than one DisplayMode.
         * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        displayMode: {
            type: String as () => TrackDisplayMode,
            default: TrackDisplayMode.Collapsible,
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
        };
    },
    methods: {
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
        /** Handles the click of a cue button, by toggling playback and seeking to it
         * @devdoc Click invocations by the ENTER key are explicitly not handeled here. These should not get handeled by the keyboard shortcut engine.
         */
        cueClick(cue: ICue) {
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

                if (isPlaying === true) {
                    this.trackPlayerInstance?.pauseAndSeekTo(cue.Time);
                } else {
                    this.trackPlayerInstance?.playFrom(cue.Time);
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
<style lang="css" scoped>
div.track {
    /** a border as separator between the tracks */
    border-color: #52575c;
    border-style: solid;
    border-width: 1px 0 0 0;
}

div.compilation div.track:last-child {
    border-width: 1px 0 1px 0;
}

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
</style>
