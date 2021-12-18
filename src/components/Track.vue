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
        <TrackHeader
            :track="this.track"
            v-model="this.expanded"
            :isPlaying="this.isPlaying"
            :isTrackLoaded="this.isTrackLoaded"
            :isActiveTrack="this.isActiveTrack"
        />

        <slide-up-down
            v-model="expanded"
            :duration="250"
            timingFunction="ease-out"
        >
            <!-- The audio player, but only once the source is available 
            Note: The actual src property/attribute is also depending 
            on the show state as a performance optimizations
            -->
            <TrackAudioApiPlayer
                v-if="mediaObjectUrl"
                ref="playerReference"
                :title="trackFileUrl?.fileName"
                :src="optimizedMediaObjectUrl"
                v-on:timeupdate="updateTime"
                v-on:trackLoaded="calculateCueDurations"
                v-on:trackPlaying="updatePlaying"
            ></TrackAudioApiPlayer>

            <!-- A simplified emulation of an empty player with a seekbar/timeline as placeholder for the missing track's URL -->
            <div v-else class="field has-addons player-panel">
                <p class="control">
                    <button class="button">
                        <!-- empty, as a placeholder to have rounded edges -->
                    </button>
                </p>
                <p class="control player-seekbar player-timeline player-time">
                    <span class="player-time-current">
                        <span class="has-opacity-half"> Waiting for </span>
                        <span class="is-italic">
                            {{ track?.Url }}
                        </span>
                    </span>
                </p>
                <p class="control">
                    <button class="button">
                        <!-- empty, as a placeholder to have rounded edges -->
                        <!-- //TODO later, here we could  have a file load or URL input element to fix the missing URL -->
                    </button>
                </p>
            </div>

            <!-- The cue buttons -->
            <div class="buttons">
                <template v-for="cue in cues" :key="cue.Id">
                    <CueButton
                        :disabled="!trackFileUrl?.objectUrl || !isTrackLoaded"
                        :cue="cue"
                        :currentSeconds="currentSeconds"
                        @click="cueClick(cue)"
                    />
                </template>
            </div>
        </slide-up-down>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track, ICue } from '@/store/compilation-types';
import CueButton from '@/components/CueButton.vue';
import TrackAudioApiPlayer from '@/components/TrackAudioApiPlayer.vue';
import { MediaUrl } from '@/store/state-types';
import { MutationTypes } from '@/store/mutation-types';
import ReplayerEventHandler from '@/components/ReplayerEventHandler.vue';
import TrackHeader from '@/components/TrackHeader.vue';

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
        TrackAudioApiPlayer,
        ReplayerEventHandler,
        TrackHeader,
    },
    props: {
        track: Track,
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
    data() {
        return {
            /** Whether this track tile is shown as expanded, with the player and the cue buttons displayed.
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
        };
    },
    methods: {
        togglePlayback() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance?.togglePlayback();
            }
        },
        rewindOneSecond() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance?.rewindOneSecond();
            }
        },
        forwardOneSecond() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance?.forwardOneSecond();
            }
        },
        volumeDown() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance?.volumeDown();
            }
        },
        volumeUp() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance?.volumeUp();
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
                    if (this.trackPlayerInstance?.playing === true) {
                        this.trackPlayerInstance?.pause();
                    }

                    const cueTime = this.cues?.filter(
                        (c) => c.Id === selectedCueId,
                    )[0]?.Time;
                    //Handle all non-null values (Zero is valid)
                    if (cueTime != null) {
                        this.trackPlayerInstance?.seekTo(cueTime);
                    }
                }
            }
        },

        updateExpanded(value: boolean) {
            this.expanded = value;
            this.$emit('update:expanded', value);
        },

        toggleExpanded() {
            this.expanded = !this.expanded;
            this.$emit('update:expanded', this.expanded);
        },
        /** Handles the click of a cue button, by toggling playback and seeking to it
         * @remarks Click invocations by the ENTER key are explicitly not handeled here. These should not get handeled by the keyboard shortcut engine.
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
                    this.trackPlayerInstance?.pause();
                    this.trackPlayerInstance?.seekTo(cue.Time);
                } else {
                    this.trackPlayerInstance?.playFrom(cue.Time);
                }
            }
        },
        /** Determines, whether one of the given string ends with the other */
        isEndingWithOneAnother(first: string, second: string): boolean {
            return first.endsWith(second) || second.endsWith(first);
        },
        /** Finds the matching the media URL (playable data) for a track's file name, from an already loaded package
         * @param fileName - The file name to search for.
         * @param mediaUrlMap - A set of media files to search through.
         * @remarks If strict file names do not match, a more lazy approach without case and without non-ascii characters is attempted
         */
        getMatchingPackageMediaUrl(
            fileName: string | undefined,
            mediaUrlMap: Map<string, MediaUrl>,
        ): MediaUrl | null {
            if (mediaUrlMap && fileName) {
                //Default: Find by literal partial match of the file name
                let url = null;
                for (let [mediaFileName, mediaUrl] of mediaUrlMap) {
                    if (this.isEndingWithOneAnother(fileName, mediaFileName)) {
                        url = mediaUrl;
                    }
                }

                if (!url) {
                    //In case of possible weird characters, or case mismatch, try a more lazy match.
                    //See https://stackoverflow.com/a/9364527/79485 and
                    //https://stackoverflow.com/questions/20856197/remove-non-ascii-character-in-string
                    const lazyFileName = fileName
                        .toLowerCase()
                        // eslint-disable-next-line
                        .replace(/[^\x00-\x7F]/g, '');

                    for (let [mediaFileName, mediaUrl] of mediaUrlMap) {
                        var lazyMediaFileName = mediaFileName
                            .toLowerCase()
                            // eslint-disable-next-line
                            .replace(/[^\x00-\x7F]/g, '');

                        if (
                            this.isEndingWithOneAnother(
                                lazyFileName,
                                lazyMediaFileName,
                            )
                        ) {
                            url = mediaUrl;
                        }
                    }
                }
                return url;
            } else {
                return null;
            }
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

            const originalCues = this.cues?.filter(function (el) {
                return el.Time !== null;
            });
            if (originalCues && originalCues.length > 0) {
                //Create a shallow, backward sorted copy of the cue list, to iterate through, and setting the duration of the cue objects
                const sortedBackwards = [...originalCues].sort(
                    (a, b) => (b.Time ?? 0) - (a.Time ?? 0),
                );

                var lastTime: number | null = trackDurationSeconds;

                sortedBackwards.forEach((element) => {
                    if (lastTime && element.Time !== null) {
                        element.Duration = lastTime - element.Time;
                    }
                    lastTime = element.Time;
                });
            }
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

            //show active always expanded
            if (val === true) {
                this.updateExpanded(true);
            }
        },
    },
    computed: {
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
        /** Gets the media object URL, if available
         */
        mediaObjectUrl(): string | undefined {
            return this.trackFileUrl?.objectUrl;
        },

        /** Gets the media object URL, if available,
         * and optimized for the expanded and the active track state
         * @remarks To save memory in the audio elements, an URL is only provided when
         * the player is actually in the expanded state and the track is the currently active track
         */
        optimizedMediaObjectUrl(): string | undefined {
            if (this.expanded || this.isActiveTrack) {
                return this.trackFileUrl?.objectUrl;
            } else {
                return undefined;
            }
        },

        cues(): Array<ICue> | undefined {
            return this.track?.Cues;
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
            let mediaUrl = this.getMatchingPackageMediaUrl(
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
</style>
