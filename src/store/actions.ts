import { ActionTree, ActionContext } from 'vuex';
import { State } from './state';
import { Mutations } from './mutations';
import { ActionTypes } from './action-types';
import { MutationTypes } from './mutation-types';
import PersistentStorage from './persistent-storage';
import CompilationParser from './compilation-parser';
import { MediaBlob, MediaUrl } from './state-types';

type AugmentedActionContext = {
    commit<K extends keyof Mutations>(
        key: K,
        payload: Parameters<Mutations[K]>[1],
    ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, 'commit'>;

/** Implements the actions for the store */
export interface Actions {
    // [ActionTypes.PLAY_TRACK](
    //     { commit }: AugmentedActionContext,
    //     payload: string,
    // ): Promise<string>;
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
    [ActionTypes.ADD_MEDIA_BLOB](
        { commit }: AugmentedActionContext,
        payload: { fileName: string; blob: Blob },
    ): void;
}
export const actions: ActionTree<State, State> & Actions = {
    // [ActionTypes.PLAY_TRACK]({ commit }) {
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             const data = 'action return value';
    //             commit(MutationTypes.PUSH_PROGRESS_MESSAGE, 'Playing track...');
    //             resolve(data);
    //         }, 500);
    //     });
    // },
    [ActionTypes.RETRIEVE_COMPILATION]({ commit }) {
        console.debug('RETRIEVE_COMPILATION');
        commit(
            MutationTypes.PUSH_PROGRESS_MESSAGE,
            'Retrieving last compilation...',
        );
        PersistentStorage.retrieveCompilation()
            .then((compilation) => {
                commit(MutationTypes.REPLACE_COMPILATION, compilation);
            })
            .then(() => {
                //retrieve all blobs (which should also include the ones for the afore-loaded compilation)
                PersistentStorage.retrieveAllMediaBlobs()
                    .then((mediaBlobs) => {
                        mediaBlobs.forEach((mediaBlob) => {
                            const objectUrl = URL.createObjectURL(
                                mediaBlob.blob,
                            );
                            commit(
                                MutationTypes.ADD_MEDIA_URL,
                                new MediaUrl(mediaBlob.fileName, objectUrl),
                            );
                        });
                    })
                    .then(() => {
                        //Update the selected cue
                        PersistentStorage.retrieveSelectedCueId()
                            .then((cueId) => {
                                commit(
                                    MutationTypes.UPDATE_SELECTED_CUE_ID,
                                    cueId,
                                );
                            })
                            .finally(() => {
                                commit(
                                    MutationTypes.POP_PROGRESS_MESSAGE,
                                    undefined,
                                );
                            });
                    });
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

    [ActionTypes.ADD_MEDIA_BLOB]({ commit }, payload: MediaBlob) {
        console.debug(
            'actions::ADD_MEDIA_BLOB:payload-filename',
            payload.fileName,
        );

        const objectUrl = URL.createObjectURL(payload.blob);
        commit(
            MutationTypes.ADD_MEDIA_URL,
            new MediaUrl(payload.fileName, objectUrl),
        );
        //Store persistently, but after committing, to keep the process faster
        PersistentStorage.storeMediaBlob(payload);
    },
};
