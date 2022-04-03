<template>
    <div class="track">
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
            v-if="this.isEditable"
            :track="this.track"
            v-model="this.expanded"
            :isPlaying="this.isPlaying"
            :isTrackLoaded="this.isTrackLoaded"
            :isActiveTrack="this.isActiveTrack"
        />
        <TrackHeader
            v-else
            :track="this.track"
            v-model="this.expanded"
            :isPlaying="this.isPlaying"
            :isTrackLoaded="this.isTrackLoaded"
            :isActiveTrack="this.isActiveTrack"
            :isEditable="this.isEditable"
            :isCollapsible="this.isCollapsible"
            :isLinkOnly="this.isLinkOnly"
        />

        <!-- The cues as buttons (in a slider, whose use is optional, for a better overview)-->
        <slide-up-down
            v-model="this.expanded"
            :duration="300"
            timingFunction="linear"
        >
            <!-- The audio player, but only once the source is available from the store
            Note: The actual src property/attribute is also depending 
            on the show state as a performance optimizations
            -->
            <template v-if="mediaObjectUrl">
                <TrackAudioApiPlayer
                    :isEditable="this.isEditable"
                    v-if="mediaObjectUrl"
                    ref="playerReference"
                    :title="trackFileUrl?.fileName"
                    :src="optimizedMediaObjectUrl"
                    @timeupdate="updateTime"
                    @trackLoaded="calculateCueDurations"
                    @trackPlaying="updatePlaying"
                    @newCueTriggered="createNewCue"
                    :loopStart="this.selectedCue?.Time"
                    :loopEnd="
                        this.selectedCue?.Time + this.selectedCue?.Duration
                    "
                    :source="this.track?.Url"
                ></TrackAudioApiPlayer>
            </template>
            <!-- A simplified emulation of an empty player with a seekbar/timeline as placeholder for the missing track's URL -->
            <template v-else>
                <div class="field player-panel is-fullwidth">
                    <p class="control">
                        <button disabled class="button is-fullwidth">
                            <LongLine
                                :text="`Fetching resource ${this.track?.Url}`"
                                :hasProgress="true"
                                :clipLeft="true"
                            />
                        </button>
                    </p>
                </div>
            </template>

            <!-- The cue buttons (in play mode) -->
            <template v-if="!this.isEditable">
                <div class="buttons">
                    <template v-for="cue in cues" :key="cue.Id">
                        <CueButton
                            :disabled="!mediaObjectUrl || !isTrackLoaded"
                            :cue="cue"
                            :isTrackPlaying="isPlaying"
                            :currentSeconds="currentSeconds"
                            @click="cueClick(cue)"
                        />
                    </template>
                </div>
            </template>
            <template v-else>
                <ul class="levels">
                    <template v-for="cue in cues" :key="cue.Id">
                        <li>
                            <CueLevel
                                :disabled="!mediaObjectUrl || !isTrackLoaded"
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
        </slide-up-down>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track, ICue, TrackDisplayMode } from '@/store/compilation-types';
import CueButton from '@/components/CueButton.vue';
import CueLevel from '@/components/CueLevel.vue';
import TrackAudioApiPlayer from '@/components/TrackAudioApiPlayer.vue';
import { MediaUrl } from '@/store/state-types';
import { MutationTypes } from '@/store/mutation-types';
import ReplayerEventHandler from '@/components/ReplayerEventHandler.vue';
import TrackHeaderEdit from '@/components/TrackHeaderEdit.vue';
import TrackHeader from '@/components/TrackHeader.vue';
import LongLine from '@/components/LongLine.vue';
import CompilationHandler from '@/store/compilation-handler';
import { settingsMixin } from '@/mixins/settingsMixin';
import NoSleep from 'nosleep.js';
import { ActionTypes } from '@/store/action-types';

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
        LongLine,
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
    emits: ['update:expanded'],
    mounted() {
        //If it's mounted as already the active track, show expanded already
        //(unfortunately the watcher only handles changes after mounted)
        if (this.isActiveTrack) {
            console.debug('Track::mounted:isActiveTrack:' + this.track?.Name);

            this.updateExpanded(true);
        }
    },
    unmounted() {
        this.deactivateWakeLock();
    },
    data() {
        return {
            /** Whether this track is shown as expanded. Default: false, but can later be dynamically changed.
             */
            expanded: false,
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

        /** Updates the expanded state with the given value*/
        updateExpanded(value: boolean) {
            //In link mode, never expand
            if (this.displayMode === TrackDisplayMode.Link) {
                value = false;
            }

            //Let the DOM update first, to have proper height handling when items get added late on
            this.$nextTick(() => {
                console.debug('Track::updateExpanded:value:', value);
                this.expanded = value;
                this.$emit('update:expanded', value);
            });
        },
        /** Handles the click of a cue button, by toggling playback and seeking to it
         * @devdoc Click invocations by the ENTER key are explicitly not handeled here. These should not get handeled by the keyboard shortcut engine.
         */
        cueClick(cue: ICue) {
            console.debug('Track::cueClick:cue:', cue);
            if (cue.Time != null) {
                //Update the selected cue to this cue
                this.$store.commit(
                    MutationTypes.UPDATE_SELECTED_CUE_ID,
                    cue.Id,
                );

                //Set the position to this cue and handle playback
                if (this.trackPlayerInstance?.playing === true) {
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
            console.debug('Track::cueClick:cue:', cue);
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
        /** Calculates the cue durations
         * @remarks Using the existing cues, and the now available track duration, calculates the durations of all cues, including the last one
         * @devdoc The calculated durations are only valid as long as the cues, their times, and the track does not change */
        calculateCueDurations(trackDurationSeconds: number) {
            console.debug(
                'Track::calculateCueDurations:trackDurationSeconds:' +
                    trackDurationSeconds,
            );
            this.isTrackLoaded = true;
            const trackId = this.track.Id;
            this.$store.commit(MutationTypes.UPDATE_CUE_DURATIONS, {
                trackId,
                trackDurationSeconds,
            });
        },
        /** Updates the playing flag from the associated player event */
        updatePlaying(value: boolean) {
            console.debug('Track::updatePlaying:value:' + value);
            this.isPlaying = value;
        },
    },

    watch: {
        /** Handles changes in whether this is the active track.
         * @remarks When this ceases to be the active track, stop playback.
           This avoids having multiple tracks playing at the same time.
           @remarks Always show newly active tracks as expanded
         */
        isActiveTrack(val, oldVal) {
            console.debug('Track::isActiveTrack:val:', val);
            //Pause no more active track
            if (oldVal === true && val === false) {
                this.trackPlayerInstance?.pause();
            }

            //show active expanded
            if (val === true) {
                this.updateExpanded(true);
            }
        },
        /** Handles changes in whether this track is playing.
         * @remarks This activates the wake lock, when playing starts.
         */
        isPlaying(val) {
            console.debug('Track::isPlaying:val:', val);
            if (val) {
                this.activateWakeLock();
            }
        },
        /** Handles changes in whether this track is expanded.
         * @remarks This deactivates the wake lock, when collapsed. It activates it back, when expanded while already playing.
         */
        expanded(expanded) {
            console.debug('Track::expanded:expanded:', expanded);
            if (!expanded) {
                this.deactivateWakeLock();
            }
            if (expanded && this.isPlaying) {
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

        /** Whether this component supports expand/collapse (using a button)
         * If set to false, the component is always shown in the expanded state, without the toggling button.
         * @devdoc Allows to reuse this component for more than one display mode.
         */
        isCollapsible(): boolean {
            return this.displayMode === TrackDisplayMode.Collapsible;
        },

        /** Whether this component shows the tracks only with a link to the track detail
         * @devdoc Allows to reuse this component for more than one display mode.
         */
        isLinkOnly(): boolean {
            return this.displayMode === TrackDisplayMode.Link;
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
        mediaObjectUrl(): string | undefined {
            return this.trackFileUrl?.url;
        },

        /** Gets the media object URL, if available,
         * and optimized for the expanded and the active track state
         * @remarks To save memory in the audio elements, an URL is only provided when
         * the player is actually in the expanded state and the track is the currently active track
         */
        optimizedMediaObjectUrl(): string | undefined {
            if (this.expanded || this.isActiveTrack) {
                return this.trackFileUrl?.url;
            } else {
                return undefined;
            }
        },

        cues(): Array<ICue> | undefined {
            return this.track.Cues;
        },

        /** Returns the media file (playable file content) for a track's file name
         * @remarks if available, the tracks from a compilation package are used, otherwise the
         * files are to be loaded from the file system or from the internet
         */

        trackFileUrl(): MediaUrl | null {
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
/** Never show scrollbars on the track tiles (this important style is necessary
     *  as remedy while using the slide-up-down control) */
.slide-up-down__container {
    overflow-x: hidden !important;
    overflow-y: hidden !important;
}

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
    /** The cue button have also an additional small margin at their end.
    This results in a similar space between level, player, cue buttons and the
    end of the track */
    margin-bottom: 4px;
}

.track .levels {
    /** The cue levels have also an additional small margin at their top.
    This results in a similar space between levels as use within 
    the environment      */
    margin-top: 12px;

    /** The cue levels have also an additional small margin at their end.
    This results in a similar space between levels as use within 
    the environment      */
    margin-bottom: 12px;
}
</style>
