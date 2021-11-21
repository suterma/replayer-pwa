import { ActionTree, ActionContext } from 'vuex';
import { State } from './state';
import { Mutations } from './mutations';
import { ActionTypes } from './action-types';
import { MutationTypes } from './mutation-types';
import { PersistentStorage } from './persistent-storage';
import { CompilationParser } from './compilation-parser';

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
    [ActionTypes.SET_COMPILATION_FROM_XML](
        { commit }: AugmentedActionContext,
        payload: string,
    ): void;
    [ActionTypes.SET_COMPILATION_FROM_PLIST](
        { commit }: AugmentedActionContext,
        payload: string,
    ): void;
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
    //    [ActionTypes.SET_COMPILATION]({ commit }, payload: ICompilation) {},
    [ActionTypes.RETRIEVE_COMPILATION]({ commit }) {
        console.debug('RETRIEVE_COMPILATION');
        commit(
            MutationTypes.SET_PROGRESS_MESSAGE,
            'Retrieving last compilation...',
        );
        PersistentStorage.retrieveCompilation()
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
    [ActionTypes.SET_COMPILATION_FROM_XML]({ commit }, payload: any) {
        console.debug('actions::SET_COMPILATION_FROM_XML:payload', payload);

        const compilation = CompilationParser.parseFromXmlCompilation(
            payload.XmlCompilation,
        );
        commit(MutationTypes.REPLACE_COMPILATION, compilation);
        //Store persistently, but after committing, to keep the process faster
        PersistentStorage.storeCompilation(compilation);
    },

    [ActionTypes.SET_COMPILATION_FROM_PLIST]({ commit }, payload: any) {
        console.debug('actions::SET_COMPILATION_FROM_PLIST:payload', payload);

        const compilation =
            CompilationParser.parseFromPListCompilation(payload);
        commit(MutationTypes.REPLACE_COMPILATION, compilation);
        //Store persistently, but after committing, to keep the process faster
        PersistentStorage.storeCompilation(compilation);
    },
};
