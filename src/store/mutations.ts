import { MutationTree } from 'vuex';
import { MutationTypes } from './mutation-types';
import { State } from './state';

export type Mutations<S = State> = {
    [MutationTypes.SET_PROGRESS_MESSAGE](state: S, payload: string): void;
    [MutationTypes.ADD_TRACK](state: S, payload: string): void;
    [MutationTypes.ADD_FILE_URL](state: S, fileUrl: string): void;
};

export const mutations: MutationTree<State> & Mutations = {
    [MutationTypes.SET_PROGRESS_MESSAGE](state, message: string) {
        state.progressMessage = message;
        console.log(message);
    },
    [MutationTypes.ADD_TRACK](state, payload: string) {
        state.compilation.push(payload);
    },
    [MutationTypes.ADD_FILE_URL](state, fileUrl: string) {
        state.fileUrls.push(fileUrl);
    },
};
