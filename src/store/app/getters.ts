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

//import router, { Route } from '@/router';
import router, { Route } from '@/router';
import type { ICompilation } from '../ICompilation';
import type { ITrack } from '../ITrack';
import CompilationHandler from '../compilation-handler';
import FileHandler from '../filehandler';
import { state } from './state';
import { computed } from 'vue';
import { TrackViewMode } from '../TrackViewMode';
import type { ICue } from '../ICue';
import { PlaybackMode } from '../PlaybackMode';

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
    hasAnyAvailableMedia: computed(() => {
        return state.mediaUrls.value.size > 0;
    }),

    /** Whether this compilation has exactly one (single) media track.
     * @remarks Non-media tracks are not considered
     */
    hasSingleMediaTrack: computed(() => {
        return (
            state.compilation.value?.Tracks?.filter((track) =>
                CompilationHandler.isMediaTrack(track),
            )?.length == 1
        );
    }),

    /** Gets the currently selected cue
     * @remarks This is more expensive than only getting the selected cue id.
     * Only one cue may be selected at any time, within one compilation / application instance.
     * @returns The cue; or null, if no cue is selected or the selected cue is can not be found.
     */
    selectedCue: computed(() => {
        return CompilationHandler.getCompilationCueById(
            state.compilation.value,
            state.selectedCueId.value,
        );
    }),

    /** Gets the currently scheduled cue
     * @remarks This is more expensive than only getting the scheduled cue id.
     * Only one cue may be scheduled at any time, within one compilation / application instance.
     * @returns The cue; or null, if no cue is scheduled or the scheduled cue is can not be found.
     */
    scheduledCue: computed(() => {
        return CompilationHandler.getCompilationCueById(
            state.compilation.value,
            state.scheduledCueId.value,
        );
    }),

    /** Gets the set of all tracks, of any type, in their order */
    allTracks: computed(() => {
        return state.compilation.value?.Tracks;
    }),

    /** Gets the set of media tracks (audio, video, YouTube), in their order */
    mediaTracks: computed(() => {
        return state.compilation.value?.Tracks?.filter((track) =>
            CompilationHandler.isMediaTrack(track),
        );
    }),

    /** Gets the set of text tracks, in their order */
    textTracks: computed(() => {
        return state.compilation.value?.Tracks?.filter((track) =>
            CompilationHandler.isTextTrack(track),
        );
    }),

    /** Gets the set of PDF tracks, in their order */
    pdfTracks: computed(() => {
        return state.compilation.value?.Tracks?.filter((track) =>
            CompilationHandler.isPdfTrack(track),
        );
    }),

    /** Gets the Id of the active track
     * @remarks The active track is either:
     * - the track that contains the currently selected cue, if any
     * - or an explicitly selected track, if any
     * - or the single media track (if there is only one media track)
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

        const mediaTracks = state.compilation.value?.Tracks?.filter((track) =>
            CompilationHandler.isMediaTrack(track),
        );
        if (mediaTracks.length === 1) {
            return mediaTracks[0].Id;
        }

        // none
        return CompilationHandler.EmptyId;
    }),

    /** Gets the media URL for the given track
     * @remarks For non-online URL's, a match is sought from previously stored binary blobs
     */
    getMediaUrlByTrack: computed(() => {
        return (track: ITrack) => {
            if (FileHandler.isValidHttpUrl(track.Url)) {
                return track.Url;
            }

            // Get the corresponding object url from the stored blobs
            const url = CompilationHandler.getMatchingPackageMediaUrl(
                track?.Url,
                state.mediaUrls.value,
            )?.url;
            return url;
        };
    }),

    // --- cue selection ---

    /** Gets all cues of all tracks in a flat array, or an empty array if there are none
     */

    getAllCues: computed(() => {
        const tracks = getters.allTracks.value;
        const cues = new Array<ICue>();
        if (tracks) {
            tracks.forEach((track) =>
                track.Cues.forEach((cue) => cues.push(cue)),
            );
        }
        return cues;
    }),

    // --- track view mode ---

    trackViewMode: computed(() => {
        const routeName = router.currentRoute.value.name;
        switch (routeName) {
            case Route.Edit:
                return TrackViewMode.Edit;
            case Route.Play:
                return TrackViewMode.Play;
            case Route.Mix:
                return TrackViewMode.Mix;
            default:
                return TrackViewMode.Edit;
        }
    }),

    /** Whether the track is shown with editable inputs for the contained data */
    isTrackEditable: computed((): boolean => {
        return getters.trackViewMode.value == TrackViewMode.Edit;
    }),

    /** Whether the track is shown optimized for playback */
    isTrackPlayable: computed((): boolean => {
        return getters.trackViewMode.value == TrackViewMode.Play;
    }),

    /** Whether the track is shown optimized for multi-track/mixer playback */
    isTrackMixable: computed((): boolean => {
        return getters.trackViewMode.value == TrackViewMode.Mix;
    }),

    // --- playback mode ---

    /** Whether the PlaybackMode is looping the tracks
     * in the compilation.
     * @remarks These are PlaybackMode.LoopCompilation
     * and PlaybackMode.ShuffleCompilation
     */
    isLoopingPlaybackMode: computed(() => {
        return (
            state.playbackMode.value === PlaybackMode.ShuffleCompilation ||
            state.playbackMode.value === PlaybackMode.LoopCompilation
        );
    }),

    // --- tags ---

    /** Gets all distinct tags of all tracks in a set, or an empty set if there are none */
    getAllTags: computed(() => {
        const tracks = state.compilation.value?.Tracks;
        const tags = new Set<string>([]);
        if (tracks) {
            tracks.forEach((track) =>
                track.Tags.forEach((tag) => tags.add(tag)),
            );
        }
        return tags;
    }),

    /** Gets the selected tags from compilation, or an empty set if there are none */
    selectedTags: computed(() => {
        return state.compilation.value.SelectedTags ?? new Set<string>([]);
    }),
};
