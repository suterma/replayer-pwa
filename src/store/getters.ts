import { GetterTree } from 'vuex';
import { Cue, ICompilation } from './compilation-types';
import { State } from './state';
import { MediaFile } from './state-types';

export type Getters = {
    /** Determines whether a compilation is availabe (created or loaded) */
    compilation(state: State): ICompilation;
    /** Defines the function to determine whether a compilation is availabe (created or loaded) */
    hasCompilation(state: State): boolean;
    fileUrls(state: State): Array<MediaFile>;
    /** Gets the latest (newest) progress message from the stack */
    progressMessage(state: State): string | null;
    /** Determines whether the given cue is the currently selected one
     * @devdoc //TODO parametrized call currently do not work, reason is unknown
     */
    isSelected(state: State, cue: Cue): boolean;
    /** Gets the currently selected cue
     * @remarks Only one cue may be selected at any time, within one compilation / application instance.
     */
    selectedCue(state: State): Cue;
    /** Whether to never show the welcome overlay at application start
     */
    neverShowWelcomeMessageAgain(state: State): boolean;
};

export const getters: GetterTree<State, State> & Getters = {
    /** @inheritdoc */
    compilation: (state) => {
        return state.compilation as ICompilation;
    },
    /** @inheritdoc */
    hasCompilation: (state) => {
        if ((state.compilation as ICompilation).Id) {
            return true;
        }
        return false;
    },
    /** @inheritdoc */
    fileUrls: (state) => {
        return state.fileUrls as Array<MediaFile>;
    },
    /** @inheritdoc */
    progressMessage: (state) => {
        const progressMessage =
            state.progressMessageStack[state.progressMessageStack.length - 1];
        return progressMessage;
    },
    /** @inheritdoc */
    isSelected: (state, cue: Cue) => {
        return cue.Id == state.selectedCue.Id;
    },
    /** @inheritdoc */
    selectedCue: (state) => {
        return state.selectedCue;
    },
    neverShowWelcomeMessageAgain: (state) => {
        return state.neverShowWelcomeMessageAgain;
    },
};
