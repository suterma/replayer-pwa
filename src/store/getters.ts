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
    /** Determines whether the given cue is the currently selected one
     * @devdoc //TODO parametrized call currently do not work, reason is unknown
     */
    isSelected(state: State, cueId: string): boolean;
    /** Gets the currently selected cue id
     * @remarks Only one cue may be selected at any time, within one compilation / application instance.
     */
    selectedCueId(state: State): string;
    /** Gets the currently selected cue
     * @remarks This is more expensive than only getting the selected cue id
     * @remarks Only one cue may be selected at any time, within one compilation / application instance.
     */
    selectedCue(state: State): ICue | undefined;
    /** Gets the application settings
     */
    settings(state: State): Settings;
    /** Gets the active track (i.e. the globally selected cue is from this track ) */
    activeTrack(state: State): ITrack | undefined;
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
        return progressMessage;
    },
    /** @inheritdoc */
    errorMessage: (state) => {
        const errorMessage =
            state.errorMessageStack[state.errorMessageStack.length - 1];
        return errorMessage;
    },
    /** @inheritdoc */
    isSelected: (state, cueId: string) => {
        return cueId == state.selectedCueId;
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
    activeTrack: (state): ITrack | undefined => {
        const selectedCueId = state.selectedCueId as string;
        if (selectedCueId) {
            //Check for matching Ids
            return CompilationHandler.getTrackByCueId(
                state.compilation,
                selectedCueId,
            );
        }
        //if none selected, no track is active anyway
        return undefined;
    },
};
