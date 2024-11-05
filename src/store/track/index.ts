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

// export factory function
export function createTrackStore(trackId: string) {
    return defineStore(`tracks/${trackId}`, () => {
        const app = useAppStore();
        const audio = useAudioStore();

        const { selectedTrackId } = storeToRefs(app);

        /** Whether this track is the active track in the set of tracks */
        const isActiveTrack = computed(() => {
            return trackId === selectedTrackId.value;
        });

        const thisTrack = app.getTrackById(trackId) ?? (() => { throw new Error(`The track with trackId '${trackId}' does not exist in the current set of tracks.`) })();

        /** The track's musical meter */
        const meter = computed(() => thisTrack.Meter);

        /** Whether to use measure numbers for the track's cue position handling
         * @remarks Must only be true, whan a valid meter is also provided
         */
        const useMeasureNumbers = computed(() => {
            return thisTrack.UseMeasureNumbers === true;
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
        const currentPosition = ref(thisTrack.PlayheadPosition ?? 0);

        /** Sets the track duration. Using the track duration and the existing cues,
        * calculates the durations of all cues, including the last one.
        * @remarks No ordering is done with this operation
        * The calculated durations are only valid as long as the cues, their times, and the track does not change
        * @param {number} trackDuration - the track duratin in [seconds]. Could be NaN or infinity, depending on the source.
        */
        function updateDurations(trackDuration: number): void {
            thisTrack.Duration = trackDuration;
            CompilationHandler.updateCueDurations(thisTrack.Cues, trackDuration);
        }


        // --- audio state ---

        const volume = computed({
            get: () => thisTrack.Volume,
            set: (val) => {
                thisTrack.Volume = val
            }
        })

        const playbackRate = computed({
            get: () => thisTrack.PlaybackRate,
            set: (val) => {
                thisTrack.PlaybackRate = val
            }
        })

        const pitchShift = computed({
            get: () => thisTrack.PitchShift,
            set: (val) => {
                thisTrack.PitchShift = val
            }
        })

        return {
            /** The track's musical meter */
            meter,

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

            volume,
            playbackRate,
            pitchShift,

            /** Sets the track duration. Using the track duration and the existing cues,
            * calculates the durations of all cues, including the last one.
            * @remarks No ordering is done with this operation
            * The calculated durations are only valid as long as the cues, their times, and the track does not change
            * @param {number} trackDuration - the track duratin in [seconds]. Could be NaN or infinity, depending on the source.
            */
            updateDurations


        };
    })();
}

// /** A dynamic store (without persistence) for an individual track.
//  * It acts as an intermediary between an instance of a
//  * track visualization/handling component
//  * and the persisted app store. The track id acts as the store's id*/
// export const useTrackStore = defineStore(`tracks/trackId`, () => {
//     const app = useAppStore();
//     const { selectedTrackId } = storeToRefs(app);

//     //const thisTrackId = ref(trackId);

//     /** Whether this track is the active track in the set of tracks */
//     const isActiveTrack = computed(() => {
//         return false; // return trackId === selectedTrackId.value;
//     });

//     // /** Returns the settings to their default value */
//     // function $reset() {
//     // }

//     function test(test: string) {
//         console.log(test);
//     }

//     return {
//         isActiveTrack,
//         test,
//         //            $reset,
//     };
// });

// /** A dynamic store (without persistence) for an individual track.
//  * It acts as an intermediary between an instance of a
//  * track visualization/handling component
//  * and the persisted app store. The track id acts as the store's id*/
// export const useTrackStore = (trackId: string) => {
//     return defineStore(`tracks/${trackId}`, () => {
//         const app = useAppStore();
//         const { selectedTrackId } = storeToRefs(app);

//         //const thisTrackId = ref(trackId);

//         /** Whether this track is the active track in the set of tracks */
//         const isActiveTrack = computed(() => {
//             return trackId === selectedTrackId.value;
//         });

//         // /** Returns the settings to their default value */
//         // function $reset() {
//         // }

//         function test(test: string) {
//             console.log(test);
//         }

//         return {
//             isActiveTrack,
//             test,
//             //            $reset,
//         };
//     });
// };
