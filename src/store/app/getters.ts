/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import type { ICompilation } from '../ICompilation';
import CompilationHandler from '../compilation-handler';
import { state } from './state';
import { computed } from 'vue';

export const getters = {
    /** Defines the function to determine whether a compilation is available (created or loaded) */
    hasCompilation: computed(() => {
        //A compilation is recognized as existing, when there is at least one track, regardless of it's type
        if (
            state.compilation.value &&
            (state.compilation.value as ICompilation).Tracks.length > 0
        ) {
            return true;
        }
        return false;
    }),

    /** The current compilation title */
    compilationTitle: computed(() => {
        return state.compilation.value?.Title;
    }),

    /** Whether any Media URL's are available */
    hasAvailableMedia: computed(() => {
        return state.mediaUrls.value.size > 0;
    }),

    /** Whether this compilation has exactly one (single) media track.
     * @remarks Non-media tracks are not considered
     */
    hasSingleMediaTrack: computed(() => {
        return (
            state.compilation.value?.Tracks?.filter(
                (track) =>
                    CompilationHandler.isAudioTrack(track) ||
                    CompilationHandler.isYoutubeVideoTrack(track) ||
                    CompilationHandler.isVideoTrack(track),
            )?.length == 1
        );
    }),

    /** Gets the currently selected cue
     * @remarks This is more expensive than only getting the selected cue id
     * @remarks Only one cue may be selected at any time, within one compilation / application instance.
     * @returns The cue; or null, if no cue is selected or the selected cue is can not be found.
     */
    selectedCue: computed(() => {
        return CompilationHandler.getCompilationCueById(
            state.compilation.value,
            state.selectedCueId.value,
        );
    }),

    /** Gets the currently scheduled cue
     * @remarks This is more expensive than only getting the scheduled cue id
     * @remarks Only one cue may be scheduled at any time, within one compilation / application instance.
     * @returns The cue; or null, if no cue is scheduled or the scheduled cue is can not be found.
     */
    scheduledCue: computed(() => {
        return CompilationHandler.getCompilationCueById(
            state.compilation.value,
            state.scheduledCueId.value,
        );
    }),

    /** Gets the set of media tracks */
    mediaTracks: computed(() => {
        return state.compilation.value?.Tracks?.filter(
            (track) =>
                CompilationHandler.isAudioTrack(track) ||
                CompilationHandler.isYoutubeVideoTrack(track) ||
                CompilationHandler.isVideoTrack(track),
        );
    }),

    /** Gets the set of text tracks */
    textTracks: computed(() => {
        return state.compilation.value?.Tracks?.filter((track) =>
            CompilationHandler.isTextTrack(track),
        );
    }),

    /** Gets the set of PDF tracks */
    pdfTracks: computed(() => {
        return state.compilation.value?.Tracks?.filter((track) =>
            CompilationHandler.isPdfTrack(track),
        );
    }),

    /** Gets the Id of the active track
     * @remarks The active track is either:
     * - the track that contains the currently selected cue, if any
     * - or an explicitly selected track, if any
     * - or the single audio track (if there is only one audio track)
     * The active track is not dependend of any currently scheduled cues
     */
    activeTrackId: computed(() => {
        const selectedTrackByCue = CompilationHandler.getTrackByCueId(
            state.compilation.value,
            state.selectedCueId.value,
        );

        if (selectedTrackByCue) {
            return selectedTrackByCue.Id;
        }

        const selectedTrackByTrackId = state.selectedTrackId.value;
        if (selectedTrackByTrackId) {
            return selectedTrackByTrackId;
        }

        const single = getters.hasSingleMediaTrack;
        if (single.value) {
            return state.compilation.value?.Tracks?.filter(
                (track) =>
                    CompilationHandler.isAudioTrack(track) ||
                    CompilationHandler.isVideoTrack(track) ||
                    CompilationHandler.isYoutubeVideoTrack(track),
            )[0]?.Id;
        }

        // none
        return CompilationHandler.EmptyId;
    }),

    /** Gets the track with the given Id
     */
    getTrackById: computed(() => {
        return (trackId: string) => {
            return CompilationHandler.getTrackById(
                state.compilation.value.Tracks,
                trackId,
            );
        };
    }),
};
