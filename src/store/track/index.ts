/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

import { defineStore } from 'pinia';
import { computed, ref, watchEffect } from 'vue';
import { useAppStore } from '../app';
import { storeToRefs } from 'pinia';
import { useAudioStore } from '../audio';
import CompilationHandler from '../compilation-handler';
import FileHandler from '../filehandler';
import { Meter } from '@/code/music/Meter';
import { useSettingsStore } from '../settings';

// export factory function
export function createTrackStore(trackId: string) {
    return defineStore(`tracks/${trackId}`, () => {
        const app = useAppStore();
        const settings = useSettingsStore();
        const audio = useAudioStore();

        const { defaultPreRollDuration } = storeToRefs(settings);

        const track =
            app.getTrackById(trackId) ??
            (() => {
                throw new Error(
                    `The track with trackId '${trackId}' does not exist in the current set of tracks.`,
                );
            })();

        /** The track's musical meter */
        const meter = computed(() => track.Meter);

        /** Whether to use measure numbers for the track's cue position handling
         * @remarks Must only be true, whan a valid meter is also provided
         */
        const useMeasureNumbers = computed(() => {
            return track.UseMeasureNumbers === true;
        });

        /** A reference to the appropriate media handler
         * @remarks This handler is available only after the respective track media component added it's handler to the audio store.
         */
        const mediaHandler = computed(() =>
            audio.getMediaHandlerByTrackId(trackId),
        );

        // --- transport ---

        /** The (precise) playback progress in the current track, in [seconds]
         * @remarks This is used for cue event handling within the set of cues, like creating a new cue at the current position
         * @devdoc Start with the initial playhead position, which might be non-zero already
         */
        const currentPosition = ref(track.PlayheadPosition ?? 0);

        /** Sets the track duration. Using the track duration and the existing cues,
         * calculates the durations of all cues, including the last one.
         * @remarks No ordering is done with this operation
         * The calculated durations are only valid as long as the cues, their times, and the track does not change
         * @param {number} trackDuration - the track duratin in [seconds]. Could be NaN or infinity, depending on the source.
         */
        function updateDurations(trackDuration: number): void {
            track.Duration = trackDuration;
            CompilationHandler.updateCueDurations(
                track.Cues,
                trackDuration,
            );
        }

        // --- Track metadata ---

        /** The name of the track */
        const name = computed({
            get: () => track.Name,
            set: (val) => {
                track.Name = val;
            },
        });

        /** The album of the track */
        const album = computed({
            get: () => track.Album,
            set: (val) => {
                track.Album = val;
            },
        });

        /** The artist of the track */
        const artist = computed({
            get: () => track.Artist,
            set: (val) => {
                track.Artist = val;
            },
        });

        /** The tags of the track */
        const tags = computed({
            get: () => track.Tags,
            set: (val) => {
                track.Tags = val;
            },
        });


        /** Returns all cues of this track */
        const cues = computed(() => {
            return track.Cues;
        });

        /** Gets the effective media source URL for this track
         * @remarks For non-online URL's, a match is sought from 
         * previously stored binary blobs
         */
        const mediaUrl = computed(() => {
            if (FileHandler.isValidHttpUrl(track.Url)) {
                return track.Url;
            }

            // Get the corresponding object url from the stored blobs
            const url = CompilationHandler.getMatchingPackageMediaUrl(
                track.Url,
                app.mediaUrls,
            )?.url;
            return url;
        });

        /** Whether all required values for the use of the measure number as 
         * position are available. */
        const hasMeter = computed(() => Meter.isValid(track.Meter));

        /** The pre-roll duration [in secods] to use for this track. 
         * Zero for no pre-roll.
         * @remarks This considers the default pre-roll setting and the possibly
         * defined track-specific pre-roll duration.
         */
        const preRollDuration = computed(() => {
            if (track.PreRoll != null) {
                return track.PreRoll;
            }
            return defaultPreRollDuration.value;
        });

        // --- Track state ---

        const { selectedTrackId, selectedCueId } = storeToRefs(app);

        /** Whether this track is the active track in the set of tracks */
        const isActiveTrack = computed(() => {
            return trackId === selectedTrackId.value;
        });

        /** Sets this track as the active track
         * @remarks If the track is not yet the active track,
         * this track is selected as the active track.
         */
        function setActiveTrack(): void {
            if (!isActiveTrack.value) {
                app.updateSelectedTrackId(trackId);
            }
        }

        /** The description of the current cue (by position)
         */
        const playingCueDescription = computed(() => {
            return playingCue.value?.Description;
        });

        /** The remarks of the current cue (by position)
         */
        const playingCueRemarks = computed(() => {
            return playingCue.value?.Remarks;
        });

        /** Whether the current cue (by position) is the selected cue
         * @remarks can be used for the playhead slider visualization
         */
        const playingCueIsSelected = computed(() => {
            if (!selectedCueId.value) {
                // premature exit, if none selected none can match
                return false;
            }

            const playingCueId = playingCue.value?.Id;

            if (
                playingCueId != undefined &&
                selectedCueId.value === playingCueId
            ) {
                return true;
            }
            return false;
        });

        /** Whether the current cue (by position) has a previous cue
         */
        const hasPreviousCue = computed(() => {
            return (
                selectedCueId !== null &&
                allCueIds.value[0] !== selectedCueId.value
            );
        });

        /** Whether the current cue (by position) has a next cue
         */
        const hasNextCue = computed(() => {
            return (
                //to be implemented: maybe the also a possible scheduled cue should be considered?
                selectedCueId !== null &&
                allCueIds.value.slice(-1)[0] !== selectedCueId.value
            );
        });

        /** The Ids of all cue in this track
         */
        const allCueIds = computed(() => {
            return cues.value?.map((cue) => cue.Id) ?? [];
        });

        /** Whether this track has any cue at all */
        const hasCues = computed(() => {
            return cues.value.length !== undefined && cues.value.length > 0;
        });

        /** Gets the current cue (by position), if any, regardless whether it is selected
         */
        const playingCue = computed(() => {
            const time = currentPosition.value;
            if (time == null) {
                return null;
            }

            return (
                cues.value.find(
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

        /** Whether this is the first track in the set of media tracks */
        const isFirstMediaTrack = computed(() => app.isFirstMediaTrack(track));

        /** Whether this is the last track in the set of media tracks */
        const isLastMediaTrack = computed(() => app.isLastMediaTrack(track));

        const isAudioTrack = computed(() =>
            CompilationHandler.isAudioTrack(track),
        );
        const isVideoTrack = computed(() =>
            CompilationHandler.isVideoTrack(track),
        );
        const isYoutubeVideoTrack = computed(() =>
            CompilationHandler.isYoutubeVideoTrack(track),
        );

        // --- track manipulation ---

        /** Handles the request for a new cue by creating one for the current time */
        function createNewCue(): void {
            if (currentPosition.value != null) {
                app.addCueAtTime(trackId, currentPosition.value);
            } else
                throw new Error(
                    'currentPosition must be available for adding a cue',
                );
        }


        /** Persists the running playhead position
         * @remarks Implements #132 */
        function persistPlayheadPosition() {
            track.PlayheadPosition = currentPosition.value;
        }

        /** The last persisted playhead position. To be used for setting the initial position on track load. */
        const initialPlayheadPosition = computed(() =>
            track.PlayheadPosition
        );

        // --- audio state ---

        const volume = computed({
            get: () => track.Volume,
            set: (val) => {
                track.Volume = val;
            },
        });

        const playbackRate = computed({
            get: () => track.PlaybackRate,
            set: (val) => {
                track.PlaybackRate = val;
            },
        });

        const pitchShift = computed({
            get: () => track.PitchShift,
            set: (val) => {
                track.PitchShift = val;
            },
        });

        return {
            /** The track's musical meter */
            meter,

            /** Whether all required values for the use of the measure number as 
             * position are available. */
            hasMeter,

            /** Whether to use measure numbers for the track's cue position handling
             * @remarks Must only be true, whan a valid meter is also provided
             */
            useMeasureNumbers,

            /** A reference to the appropriate media handler
             * @remarks This handler is available only after the respective track media component added it's handler to the audio store.
             */
            mediaHandler,

            /** The (precise) playback progress in the current track, in [seconds]
             * @remarks This is used for cue event handling within the set of cues, like creating a new cue at the current position
             */
            currentPosition,

            /** Whether this track is the active track in the set of tracks */
            isActiveTrack,

            /** Handles the request for a new cue by creating one for the current time */
            createNewCue,

            volume,

            /** Returns all cues of this track (readonly)*/
            cues,

            /** The description of the current cue (by position) */
            playingCueDescription,

            /** The remarks of the current cue (by position) */
            playingCueRemarks,

            /** Whether the current cue (by position) is the selected cue
             * @remarks can be used for the playhead slider visualization
             */
            playingCueIsSelected,

            /** Whether the current cue (by position) has a previous cue */
            hasPreviousCue,

            /** Whether the current cue (by position) has a next cue */
            hasNextCue,

            /** The Ids of all cue in this track
             */
            allCueIds,

            /** Whether this track has any cue at all */
            hasCues,

            /** Gets the current cue (by position), if any, regardless whether it is selected */
            playingCue,

            /** Gets the effective media source URL for this track
             * @remarks For non-online URL's, a match is sought from previously stored binary blobs
             */
            mediaUrl,

            /** The pre-roll duration [in secods] to use for this track. 
             * Zero for no pre-roll.
             * @remarks This considers the default pre-roll setting and the possibly
             * defined track-specific pre-roll duration.
             */
            preRollDuration,

            /** The track
             * @remarks It is recommended to not use the track as a whole, 
             * but to use the specific track properties as destructured refs
            */
            track,

            /** Whether this is the first track in the set of media tracks */
            isFirstMediaTrack,
            /** Whether this is the last track in the set of media tracks */
            isLastMediaTrack,

            isAudioTrack,
            isVideoTrack,
            isYoutubeVideoTrack,

            /** The name of the track */
            name,
            /** The album of the track */
            album,
            /** The artist of the track */
            artist,
            /** The tags of the track */
            tags,

            /** The last persisted playhead position. To be used for setting the initial position on track load. */
            initialPlayheadPosition,
            playbackRate,
            pitchShift,

            /** Persists the running playhead position */
            persistPlayheadPosition,

            setActiveTrack,

            /** Sets the track duration. Using the track duration and the existing cues,
             * calculates the durations of all cues, including the last one.
             * @remarks No ordering is done with this operation
             * The calculated durations are only valid as long as the cues, their times, and the track does not change
             * @param {number} trackDuration - the track duratin in [seconds]. Could be NaN or infinity, depending on the source.
             */
            updateDurations,
        };
    })();
}
function useSettingStore() {
    throw new Error('Function not implemented.');
}

