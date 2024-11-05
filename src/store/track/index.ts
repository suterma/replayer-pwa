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
import { computed } from 'vue';
import { useAppStore } from '../app';
import { storeToRefs } from 'pinia';

// export factory function
export function createTrackStore(trackId: string) {
    return defineStore(`tracks/${trackId}`, () => {
        const app = useAppStore();
        const { selectedTrackId } = storeToRefs(app);

        /** Whether this track is the active track in the set of tracks */
        const isActiveTrack = computed(() => {
            return trackId === selectedTrackId.value;
        });

        const thisTrack = app.getTrackById(trackId);

        if (!thisTrack) {
            throw new Error(
                `The track with trackId '${trackId}' does not exist in the current set of tracks.`,
            );
        }

        /** Whether to use measure numbers for the track's cue position handling
         * @remarks Must only be true, whan a valid meter is also provided
         */
        const useMeasureNumbers = computed(() => {
            return thisTrack.UseMeasureNumbers === true;
        });

        /** The track's musical meter */
        const meter = computed(() => thisTrack.Meter);

        function test(test: string) {
            console.log(test);
        }

        return {
            /** Whether to use measure numbers for the track's cue position handling
             * @remarks Must only be true, whan a valid meter is also provided
             */
            useMeasureNumbers,

            /** The track's musical meter */
            meter,

            /** Whether this track is the active track in the set of tracks */
            isActiveTrack,
            test,
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
