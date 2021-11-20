import { ActionTree, ActionContext } from 'vuex';
import { State } from './state';
import { Mutations } from './mutations';
import { ActionTypes } from './action-types';
import { MutationTypes } from './mutation-types';
import { PersistentStorage } from './persistent-storage';

type AugmentedActionContext = {
    commit<K extends keyof Mutations>(
        key: K,
        payload: Parameters<Mutations[K]>[1],
    ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, 'commit'>;

export interface Actions {
    //TODO later actions instead of mutations directly, when appropriate
    //These are currently not used
    [ActionTypes.PLAY_TRACK](
        { commit }: AugmentedActionContext,
        payload: string,
    ): Promise<string>;
    [ActionTypes.RETRIEVE_COMPILATION]({
        commit,
    }: AugmentedActionContext): void;
}
export const actions: ActionTree<State, State> & Actions = {
    [ActionTypes.PLAY_TRACK]({ commit }) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const data = 'action return value';
                commit(MutationTypes.SET_PROGRESS_MESSAGE, 'Playing track...');
                resolve(data);
            }, 500);
        });
    },
    [ActionTypes.RETRIEVE_COMPILATION]({ commit }) {
        console.debug('RETRIEVE_COMPILATION');
        commit(
            MutationTypes.SET_PROGRESS_MESSAGE,
            'Retrieving last compilation...',
        );
        PersistentStorage.retrieveCompilationAsync()
            .then((compilation) => {
                console.debug('committing compilation: ', compilation);
                commit(MutationTypes.REPLACE_COMPILATION, compilation);
            })
            .then(() => {
                PersistentStorage.retrieveSelectedCue().then((cue) => {
                    console.debug('committing cue: ', cue);
                    commit(MutationTypes.UPDATE_CURRENT_CUE, cue);
                });
            })
            .finally(() => {
                commit(MutationTypes.END_PROGRESS, undefined);
            });
    },
};
