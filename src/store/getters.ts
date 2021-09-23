import { GetterTree } from 'vuex';
import { ICompilation } from './compilation-types';
import { State } from './state';
import { MediaFile } from './state-types';

export type Getters = {
    compilation(state: State): ICompilation;
    /** Defines the function to determine whether a compilation is availabe (created or loaded) */
    hasCompilation(state: State): boolean;
    fileUrls(state: State): Array<MediaFile>;
    progressMessage(state: State): string | null;
};

export const getters: GetterTree<State, State> & Getters = {
    compilation: (state) => {
        return state.compilation as ICompilation;
    },
    /** Determines whether a compilation is availabe (created or loaded) */
    hasCompilation: (state) => {
        if ((state.compilation as ICompilation).Id) {
            return true;
        }
        return false;
    },
    fileUrls: (state) => {
        return state.fileUrls as Array<MediaFile>;
    },
    /** Gets the latest (newest) progress message from the stack */
    progressMessage: (state) => {
        const progressMessage =
            state.workMessageStack[state.workMessageStack.length - 1];
        return progressMessage;
    },
};
