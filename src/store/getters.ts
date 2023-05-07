import { ICompilation } from './compilation-types';
import CompilationHandler from './compilation-handler';
import { state } from './state';
import { computed } from 'vue';

export const getters = {
    /** Defines the function to determine whether a compilation is available (created or loaded) */
    hasCompilation: computed(() => {
        //A compilation is recognized as existing, when there is at least one track
        if (
            state.compilation.value &&
            (state.compilation.value as ICompilation).Tracks.length > 0
        ) {
            return true;
        }
        return false;
    }),

    /** The set of available Media URL's */
    // mediaUrls: computed(() => {
    //     return state.mediaUrls.value as Map<string, MediaUrl>;
    // }),

    /** Whether any Media URL's are available */
    hasAvailableMedia: computed(() => {
        return state.mediaUrls.value.size > 0;
    }),

    /** Gets the currently selected cue
     * @remarks This is more expensive than only getting the selected cue id
     * @remarks Only one cue may be selected at any time, within one compilation / application instance.
     * @returns The cue; or null, if no cue is selected or the selected cue is can not be found.
     */ selectedCue: computed(() => {
        return CompilationHandler.getCompilationCueById(
            state.compilation.value,
            state.selectedCueId.value,
        );
    }),
    /** Gets the active track
     * @remarks The active track is either:
     * - the track that contains the currently selected cue, if any
     * - otherwise an explicitly selected track, if any
     */
    activeTrack: computed(() => {
        const selectedCueId = state.selectedCueId.value;

        let selectedTrack = CompilationHandler.getTrackByCueId(
            state.compilation.value,
            selectedCueId,
        );

        //if no cue is applicable, try the track
        if (!selectedTrack) {
            const selectedTrackId = state.selectedTrackId.value;

            if (selectedTrackId) {
                selectedTrack = CompilationHandler.getTrackById(
                    state.compilation.value.Tracks,
                    selectedTrackId,
                );
            }
        }

        return selectedTrack ?? null;
    }),

    /** Gets the Id of the active track
     * @remarks The active track is either:
     * - the track that contains the currently selected cue, if any
     * - otherwise an explicitly selected track, if any
     */
    activeTrackId: computed(() => {
        const selectedTrack = CompilationHandler.getTrackByCueId(
            state.compilation.value,
            state.selectedCueId.value,
        );

        if (selectedTrack) {
            return selectedTrack.Id;
        }
        //if no cue is applicable, probably the track is explicitly selected
        return state.selectedTrackId.value;
    }),

    /** Gets the set of tracks */
    tracks: computed(() => {
        return state.compilation.value?.Tracks;
    }),
};
