<template>
    <!-- Each track is a tile (vertically distributed), and contains all the cues -->
    <div class="tile is-ancestor">
        <div class="tile is-vertical is-parent">
            <div class="tile is-child card">
                <div class="card-content">
                    <h2 class="subtitle">
                        <span class="">{{ track?.Name }}</span>

                        <!-- Text colors similar to cues -->
                        <span
                            v-if="!showCues"
                            class="is-pulled-right ml-3 tag is-warning"
                            ><a @click="toggleCueDisplay" role="button">
                                <!-- Text colors similar to cues -->
                                <span
                                    class="icon-text is-size-7 has-text-light"
                                    v-if="!showCues"
                                >
                                    Show
                                    {{ track?.Cues?.length }} cues</span
                                >
                            </a></span
                        >
                        <span
                            v-if="showCues"
                            class="is-pulled-right ml-3 tag is-dark"
                            ><a @click="toggleCueDisplay" role="button">
                                <span
                                    class="icon-text is-size-7 has-text-light"
                                    v-if="showCues"
                                >
                                    Hide cues</span
                                >
                            </a></span
                        >

                        <!-- Artist info -->
                        <span class="is-pulled-right is-size-7 has-text-right">
                            <span v-if="track?.Artist" class="has-opacity-half">
                                by
                            </span>
                            <span class="is-italic">
                                {{ track?.Artist }}
                            </span>
                            <br />
                            <span v-if="track?.Album" class="has-opacity-half">
                                on
                            </span>
                            <span class="is-italic">
                                {{ track?.Album }}
                            </span>
                        </span>
                    </h2>

                    <div v-show="showCues">
                        <!-- The audio player, but only shown when the source is available -->
                        <TrackAudioPlayer
                            v-if="trackFileUrl?.objectUrl"
                            ref="player"
                            :title="trackFileUrl?.fileName"
                            :src="trackFileUrl?.objectUrl"
                            v-on:timeupdate="updateTime"
                            v-on:trackLoaded="calculateCueDurations"
                        ></TrackAudioPlayer>

                        <!-- Otherwise show a placeholder -->
                        <p v-else>
                            <span class="has-opacity-half"> Waiting for </span>
                            <span class="is-italic">
                                {{ track?.Url }}
                            </span>
                        </p>

                        <div class="buttons">
                            <template v-for="cue in cues" :key="cue.Id">
                                <CueButton
                                    :disabled="!trackFileUrl?.objectUrl"
                                    :cue="cue"
                                    :currentSeconds="currentSeconds"
                                    @click="cueClick(cue.Time)"
                                />
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track, ICue } from '@/store/compilation-types';
import CueButton from '@/components/CueButton.vue';
import TrackAudioPlayer from '@/components/TrackAudioPlayer.vue';
import { MediaFile } from '@/store/state-types';

export default defineComponent({
    name: 'TrackTile',
    components: { CueButton, TrackAudioPlayer },
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
        };
    },
    methods: {
        /** Toggles the display of the cue buttons */
        toggleCueDisplay() {
            this.showCues = !this.showCues;
            return this.showCues;
        },
        /** Handles the click of a cue button, by toggling playback and seeking to it */
        cueClick(time: number | null) {
            console.debug('TrackTime::cueClick:time', time);
            if (time != null) {
                var trackPlayer = this.$refs.player as InstanceType<
                    typeof TrackAudioPlayer
                >;

                if (trackPlayer.playing === true) {
                    trackPlayer.pause();
                    trackPlayer.seekTo(time);
                } else {
                    trackPlayer.playFrom(time);
                }
            }
        },
        /** Determines, whether one of the given string ends with the other */
        isEndingWithOneAnother(first: string, second: string): boolean {
            return first.endsWith(second) || second.endsWith(first);
        },
        /** Finds the matching the media file (playable file content) for a track's file name, from an already loaded package
         * @remarks If strict file names do not match, a more lazy approach without case and without non-ascii characters is attempted
         */
        getMatchingPackageFileUrl(
            fileName: string | undefined,
            fileUrls: Array<MediaFile>,
        ): MediaFile | null {
            if (fileUrls && fileName) {
                let url = fileUrls.filter((fileUrl: MediaFile) => {
                    return this.isEndingWithOneAnother(
                        fileName,
                        fileUrl.fileName,
                    );
                })[0];
                if (!url) {
                    //In case of possible weird characters, or case mismatch, try a more lazy match.
                    //See https://stackoverflow.com/a/9364527/79485 and
                    //https://stackoverflow.com/questions/20856197/remove-non-ascii-character-in-string
                    const lazyFileName = fileName
                        .toLowerCase()
                        // eslint-disable-next-line
                        .replace(/[^\x00-\x7F]/g, '');
                    url = fileUrls.filter((fileUrl: MediaFile) => {
                        var lazyUrlFileName = fileUrl.fileName
                            .toLowerCase()
                            // eslint-disable-next-line
                            .replace(/[^\x00-\x7F]/g, '');
                        return this.isEndingWithOneAnother(
                            lazyFileName,
                            lazyUrlFileName,
                        );
                    })[0];
                }
                return url;
            } else {
                return null;
            }
        },
        /** Finds the matching the media file (playable file content) for a track's file name, from the local file system */
        getMatchingLocalFileUrl(
            _fileName: string | undefined,
        ): MediaFile | null {
            // if (fileName) {
            //     var objectUrl = URL.createObjectURL(blob);

            //     const objectURL = window.URL.createObjectURL(file);
            // }
            return null; //TODO load the file
        },
        /** Updates the current seconds property with the temporal position of the track audio player
         * @remarks This is used to control the cue display for this track's cues
         */
        updateTime(currentTime: any) {
            this.currentSeconds = currentTime;
        },
        /** Calculates the cue durations
         * @remarks Using the existing cues, and the now available track duration, calculates the durations of all cues, including the last one
         * @devdoc The calculated durations are only valid as long as the cues, their times, and the track does not change */
        calculateCueDurations(trackDurationSeconds: number) {
            console.debug(
                'TrackTile::calculateCueDurations:trackDurationSeconds',
                trackDurationSeconds,
            );

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
                console.debug(
                    'TrackTile::calculateCueDurations:originalCues',
                    originalCues,
                );
            }
        },
    },
    computed: {
        cues(): Array<ICue> | undefined {
            return this.track?.Cues;
        },
        /** Returns the media file (playable file content) for a track's file name
         * @remarks if available, the tracks from a compilation package are used, otherwise the
         * files are to be loaded from the file system or from the internet
         */

        trackFileUrl(): MediaFile | null {
            const fileUrls = this.$store.getters.fileUrls as Array<MediaFile>;
            let fileUrl = this.getMatchingPackageFileUrl(
                this.track?.Url,
                fileUrls,
            );
            if (fileUrl === null) {
                fileUrl = this.getMatchingLocalFileUrl(this.track?.Url);
            }
            return fileUrl;
        },
    },
});
</script>
