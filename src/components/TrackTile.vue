<template>
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

    <hr class="is-hidden-tablet" />
    <!-- Each track is a box, styled like a card, and contains all the cues -->
    <div
        :class="{
            box: true,
            card: true,
            track: true,
        }"
    >
        <h2 class="subtitle" v-bind:id="'track-' + track.Id">
            <span
                :class="{
                    'has-text-success': false,
                }"
                >{{ track.Name }}</span
            >

            <!-- Text colors similar to cues -->
            <span v-if="!showCues" class="is-pulled-right ml-3"
                ><a
                    @click="toggleCueDisplay"
                    role="button"
                    class="button is-warning is-small"
                >
                    <!-- Text colors similar to cues -->
                    <span class="is-size-7 has-text-light" v-if="!showCues">
                        Show
                        {{ track.Cues?.length }} cues</span
                    >
                </a></span
            >
            <span v-if="showCues" class="is-pulled-right ml-3"
                ><a
                    @click="toggleCueDisplay"
                    title="Hides the player and cue buttons"
                    role="button"
                    class="button is-small"
                >
                    <span class="is-size-7 has-text-light" v-if="showCues">
                        Collapse</span
                    >
                </a></span
            >

            <!-- Artist info -->
            <span class="is-pulled-right is-size-7 has-text-right">
                <span v-if="track.Artist" class="has-opacity-half"> by </span>
                <span class="is-italic">
                    {{ track.Artist }}
                </span>
                <br />
                <span v-if="track.Album" class="has-opacity-half"> on </span>
                <span class="is-italic">
                    {{ track.Album }}
                </span>
            </span>
        </h2>

        <div v-show="showCues">
            <!-- The audio player, but only shown when the source is available -->
            <TrackAudioApiPlayer
                v-if="trackFileUrl?.objectUrl"
                ref="TrackAudioApiPlayer"
                :title="trackFileUrl?.fileName"
                :src="trackFileUrl?.objectUrl"
                v-on:timeupdate="updateTime"
                v-on:trackLoaded="calculateCueDurations"
            ></TrackAudioApiPlayer>

            <!-- Otherwise show a placeholder -->
            <p v-else>
                <span class="has-opacity-half"> Waiting for </span>
                <span class="is-italic">
                    {{ track?.Url }}
                </span>
            </p>
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
        </div>
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

/** Displays a track tile
 * @remarks Also handles the common replayer events for tracks
 */
export default defineComponent({
    name: 'TrackTile',
    components: { CueButton, TrackAudioApiPlayer, ReplayerEventHandler },
    props: {
        track: Track,
    },
    data() {
        return {
            showCues: true,
            /** The playback progress in the current track, in [seconds]
             * @remarks This is used for track progress display within the set of cues
             */
            currentSeconds: 0,
            /** Flag to indicate whether the player has it's track loaded.
             * @remarks This is used to toggle playback button states
             */
            isTrackLoaded: false,
        };
    },
    methods: {
        /** Toggles the display of the cue buttons */
        toggleCueDisplay() {
            this.showCues = !this.showCues;
        },
        togglePlayback() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance.togglePlayback();
            }
        },
        rewindOneSecond() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance.rewindOneSecond();
            }
        },
        forwardOneSecond() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance.forwardOneSecond();
            }
        },
        volumeDown() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance.volumeDown();
            }
        },
        volumeUp() {
            if (this.isActiveTrack) {
                this.trackPlayerInstance.volumeUp();
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
                    if (this.trackPlayerInstance.playing === true) {
                        this.trackPlayerInstance?.pause();
                    }

                    const cueTime = this.cues?.filter(
                        (c) => c.Id === selectedCueId,
                    )[0]?.Time;
                    //Handle all non-null values (Zero is valid)
                    if (cueTime != null) {
                        this.trackPlayerInstance.seekTo(cueTime);
                    }
                }
            }
        },
        /** Handles the click of a cue button, by toggling playback and seeking to it
         * @remarks Click invocations by the ENTER key are explicitly not handeled here. These should not get handeled by the keyboard shortcut engine.
         */
        cueClick(cue: ICue) {
            if (cue.Time != null) {
                //Update the selected cue to this cue
                this.$store.commit(
                    MutationTypes.UPDATE_SELECTED_CUE_ID,
                    cue.Id,
                );

                //Set the position to this cue and handle playback
                //TODO maybe check handling to avoid double play/pause?
                if (this.trackPlayerInstance.playing === true) {
                    this.trackPlayerInstance?.pause();
                    this.trackPlayerInstance.seekTo(cue.Time);
                } else {
                    this.trackPlayerInstance.playFrom(cue.Time);
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
                'TrackTile::calculateCueDurations:trackDurationSeconds:' +
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
    },
    watch: {
        /** Handle playback when the active track changes.
         * a) When this ceases to be the active track, stop playback.
         * @remarks This avoids having multiple tracks playing at the same time.
         */
        isActiveTrack(val, oldVal) {
            //is no more active?
            if (oldVal === true && val === false) {
                this.trackPlayerInstance?.pause();
            }
        },
    },
    computed: {
        trackPlayerInstance(): InstanceType<typeof TrackAudioApiPlayer> {
            return this.$refs.TrackAudioApiPlayer as InstanceType<
                typeof TrackAudioApiPlayer
            >;
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
<style lang="css">
/** For mobiles, use a slimmer layout */
@media screen and (max-width: 768px /*only mobile*/) {
    .box.track {
        border: none;
        padding: 0;
    }
}
</style>
