import { GetterTree } from 'vuex';
import { ICompilation, ICue, ITrack } from './compilation-types';
import PersistentStorage from './persistent-storage';
import CompilationHandler from './compilation-handler';
import { State } from './state';
import { MediaUrl, Settings } from './state-types';

export type Getters = {
    /** Returns the currently available compilation */
    compilation(state: State): ICompilation;
    /** Defines the function to determine whether a compilation is availabe (created or loaded) */
    hasCompilation(state: State): boolean;
    /** Defines the function to determine whether a compilation is availabe to retrieve from the persistent storage */
    hasRetrievableCompilation(): boolean;
    /** The set of available Media URL's */
    mediaUrls(state: State): Map<string, MediaUrl>;
    /** Gets the latest (newest) progress message from the stack */
    progressMessage(state: State): string | null;
    /** Gets the latest (newest) error message from the stack */
    errorMessage(state: State): string | null;
    /** Gets the currently selected cue id
     * @remarks Only one cue may be selected at any time, within one compilation / application instance.
     * @returns The cue identifier; or null, if no cue is selected.
     */
    selectedCueId(state: State): string | null;
    /** Gets the currently selected cue
     * @remarks This is more expensive than only getting the selected cue id
     * @remarks Only one cue may be selected at any time, within one compilation / application instance.
     * @returns The cue; or null, if no cue is selected or the selected cue is can not be found.
     */
    selectedCue(state: State): ICue | null;
    /** Gets the application settings
     */
    settings(state: State): Settings;

    /** Gets the active track
     * @remarks The active track is either:
     * - the track that contains the currently selected cue, if any
     * - otherwise an explicitly selected track, if any
     */
    activeTrack(state: State): ITrack | null;

    /** Gets the set of tracks */
    tracks(state: State): Array<ITrack> | undefined;
};

export const getters: GetterTree<State, State> & Getters = {
    /** @inheritdoc */
    compilation: (state) => {
        return state.compilation as ICompilation;
    },
    /** @inheritdoc */
    hasCompilation: (state) => {
        //A compilation is recognised as existing, when there is at least one track
        if ((state.compilation as ICompilation).Tracks.length > 0) {
            return true;
        }
        return false;
    },
    /** @inheritdoc */
    hasRetrievableCompilation: () => {
        return PersistentStorage.hasRetrievableCompilation();
    },
    /** @inheritdoc */
    mediaUrls: (state) => {
        return state.mediaUrls as Map<string, MediaUrl>;
    },
    /** @inheritdoc */
    progressMessage: (state) => {
        const progressMessage =
            state.progressMessageStack[state.progressMessageStack.length - 1];
        return progressMessage ?? null;
    },
    /** @inheritdoc */
    errorMessage: (state) => {
        const errorMessage =
            state.errorMessageStack[state.errorMessageStack.length - 1];
        return errorMessage ?? null;
    },
    /** @inheritdoc */
    selectedCueId: (state) => {
        return state.selectedCueId;
    },
    /** @inheritdoc */
    selectedCue: (state) => {
        return CompilationHandler.getCueById(
            state.compilation,
            state.selectedCueId,
        );
    },
    /** @inheritdoc */ settings: (state) => {
        return state.settings;
    },
    /** @inheritdoc */
    activeTrack: (state): ITrack | null => {
        const selectedCueId = state.selectedCueId as string;
        if (selectedCueId) {
            return (
                CompilationHandler.getTrackByCueId(
                    state.compilation,
                    selectedCueId,
                ) ?? null
            );
        }
        //if no cue is selected, try the track
        const selectedTrackId = state.selectedTrackId as string;
        if (selectedTrackId) {
            return (
                CompilationHandler.getTrackById(
                    state.compilation.Tracks,
                    selectedTrackId,
                ) ?? null
            );
        }
        return null;
    },
    /** @inheritdoc */
    tracks: (state): Array<ITrack> | undefined => {
        return state.compilation?.Tracks;
    },
};
