import { ICompilation } from '../compilation-types';
import CompilationHandler from '../compilation-handler';
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

    /** Whether any Media URL's are available */
    hasAvailableMedia: computed(() => {
        return state.mediaUrls.value.size > 0;
    }),

    /** Whether this compilation has exactly one (single) playable track.
     * @remarks Non-audio tracks are not considered
     */
    hasSingleAudioTrack: computed(() => {
        return (
            state.compilation.value?.Tracks.filter(
                (track) => !CompilationHandler.isNonPlayableTrack(track),
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

    /** Gets the set of tracks */
    tracks: computed(() => {
        return state.compilation.value?.Tracks;
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
            return state.compilation.value?.Tracks.filter(
                (track) => !CompilationHandler.isNonPlayableTrack(track),
            )[0]?.Id;
        }

        // none
        return CompilationHandler.EmptyId;
    }),
};
