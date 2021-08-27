import { GetterTree } from 'vuex';
import { ICompilation } from './compilation-types';
import { State } from './state';
import { MediaFile } from './state-types';

export type Getters = {
    compilation(state: State): ICompilation;
    fileUrls(state: State): Array<MediaFile>;
    progressMessage(state: State): string | null;
};

export const getters: GetterTree<State, State> & Getters = {
    compilation: (state) => {
        return state.compilation as ICompilation;
    },
    fileUrls: (state) => {
        return state.fileUrls as  Array<MediaFile>;
    },
    progressMessage: (state) => {
        return state.progressMessage;
    },
};
