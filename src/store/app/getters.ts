import { ICompilation } from '../compilation-types';
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

    /** Whether this compilation has exactly one (single) audio track.
     * @remarks Non-audio tracks are not considered
     */
    hasSingleAudioTrack: computed(() => {
        return (
            state.compilation.value?.Tracks.filter((track) =>
                CompilationHandler.isAudioTrack(track),
            ).length == 1
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

    /** Gets the set of audio tracks */
    audioTracks: computed(() => {
        return state.compilation.value?.Tracks.filter((track) =>
            CompilationHandler.isAudioTrack(track),
        );
    }),

    /** Gets the set of text tracks */
    textTracks: computed(() => {
        return state.compilation.value?.Tracks.filter((track) =>
            CompilationHandler.isTextTrack(track),
        );
    }),

    /** Gets the Id of the active track
     * @remarks The active track is either:
     * - the track that contains the currently selected cue, if any
     * - or an explicitly selected track, if any
     * - or the single audio track (if there is only one audio track)
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

        const single = getters.hasSingleAudioTrack;
        if (single.value) {
            return state.compilation.value?.Tracks.filter((track) =>
                CompilationHandler.isAudioTrack(track),
            )[0]?.Id;
        }

        // none
        return CompilationHandler.EmptyId;
    }),

    /** Gets the track with the given Id
     */
    getTrackById: computed(() => {
        return (trackId: string) => {
            return CompilationHandler.getTrackByCueId(
                state.compilation.value,
                trackId,
            );
        };
    }),
};
