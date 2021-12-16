<template>
    <!-- Main container -->
    <nav class="level">
        <!-- Left side -->
        <div class="level-left">
            <div class="level-item">
                <p class="subtitle is-5"><strong>123</strong> posts</p>
            </div>
            <div class="level-item">
                <div class="field has-addons">
                    <p class="control">
                        <input
                            class="input"
                            type="text"
                            placeholder="Find a post"
                        />
                    </p>
                    <p class="control">
                        <button class="button">Search</button>
                    </p>
                </div>
            </div>
        </div>

        <!-- Right side -->
        <div class="level-right">
            <p class="level-item"><strong>All</strong></p>
            <p class="level-item"><a>Published</a></p>
            <p class="level-item"><a>Drafts</a></p>
            <p class="level-item"><a>Deleted</a></p>
            <p class="level-item"><a class="button is-success">New</a></p>
        </div>
    </nav>

    <h2
        :class="{
            subtitle: isActiveTrack,
        }"
        class="subtitle is-clickable"
        v-bind:id="'track-' + track.Id"
        @click="toggleExpanded()"
    >
        <span
            :class="{
                'has-text-success': isActiveTrack,
            }"
            >{{ track.Name }}</span
        >

        <!-- Playback indicator -->
        <span class="ml-3">
            <span
                :class="{
                    icon: true,
                    'has-text-success': this.isPlaying,
                    'is-invisible	': !this.isPlaying,
                }"
            >
                <i class="mdi mdi-24px">
                    <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
                        <path
                            fill="currentColor"
                            d="M19,12C19,15.86 15.86,19 12,19C8.14,19 5,15.86 5,12C5,8.14 8.14,5 12,5C15.86,5 19,8.14 19,12Z"
                        />
                    </svg>
                </i>
            </span>
        </span>

        <!-- Text colors similar to cues -->
        <!-- Note: The click handler is registered on the complete title -->

        <CollapsibleButton
            class="is-pulled-right is-size-7 has-text-right ml-3"
            :modelValue="this.modelValue"
        />

        <!-- Artist info -->
        <span
            class="is-pulled-right is-hidden-mobile is-size-7 has-text-right ml-3"
        >
            <span v-if="track.Artist" class="has-opacity-half"> by </span>
            <span class="is-italic">
                {{ track.Artist }}
            </span>

            <span v-if="track.Album" class="has-opacity-half"> on </span>
            <span class="is-italic">
                {{ track.Album }}
            </span>
        </span>
    </h2>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track, ICue } from '@/store/compilation-types';
import { MediaUrl } from '@/store/state-types';
import CollapsibleButton from '@/components/CollapsibleButton.vue';

/** Displays a track tile with a title, and a panel with a dedicated media player and the cue buttons for it.
 * @remarks The panel is initially collapsed and no media is loaded into the player, as a performance optimization.
 * Details:
 * - The collapsed panel is not removed from the DOM because of issues with the $ref handling in conjunction with v-if
 * - However, the player's src property is only set when actually used to keep the memory footprint low.
 * @remarks Also handles the common replayer events for tracks
 */
export default defineComponent({
    name: 'TrackHeader',
    components: {
        CollapsibleButton,
    },
    props: {
        track: Track,

        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    emits: ['update:modelValue'],
    data() {
        return {
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
        toggleExpanded() {
            const expanded = !this.modelValue;
            console.debug(
                `CollapsibleButton::toggleExpanded:expanded:${expanded}`,
            );
            this.$emit('update:modelValue', expanded);
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
        /** Updates the playing flag from the associated player event */
        updatePlaying(value: boolean) {
            console.debug('TrackTile::updatePlaying:value:' + value);
            this.isPlaying = value;
        },
    },
    watch: {},
    computed: {
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
<style lang="css" scoped></style>
