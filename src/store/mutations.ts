import { MutationTree } from 'vuex';
import { Compilation, ICompilation, Cue } from './compilation-types';
import { MutationTypes } from './mutation-types';
import { State } from './state';
import { MediaFile } from './state-types';
import PersistentStorage from './persistent-storage';

export type Mutations<S = State> = {
    [MutationTypes.SET_PROGRESS_MESSAGE](state: S, payload: string): void;
    [MutationTypes.END_PROGRESS](state: S): void;
    [MutationTypes.ADD_FILE_URL](state: S, payload: MediaFile): void;
    [MutationTypes.REPLACE_COMPILATION](
        state: S,
        compilation: ICompilation,
    ): void;
    [MutationTypes.UPDATE_SELECTED_CUE](state: S, payload: Cue): void;
    [MutationTypes.CLOSE_COMPILATION](state: S): void;
    [MutationTypes.UPDATE_NEVER_SHOW_WELCOME_MESSAGE_AGAIN](
        state: S,
        neverShowWelcomeMessageAgain: boolean,
    ): void;
    [MutationTypes.INIT_APPLICATION_STATE](state: S): void;
};

export const mutations: MutationTree<State> & Mutations = {
    [MutationTypes.SET_PROGRESS_MESSAGE](state: State, message: string) {
        state.progressMessageStack.push(message);
        console.log('PROGRESS: ' + message);
    },
    [MutationTypes.END_PROGRESS](state: State) {
        const message = state.progressMessageStack.pop();
        console.debug('END_PROGRESS: ' + message);
    },
    [MutationTypes.ADD_FILE_URL](state: State, payload: MediaFile) {
        //Remove any previously matching
        const matchingFile = state.fileUrls.get(payload.fileName);
        if (matchingFile) {
            console.debug(
                'mutations::ADD_FILE_URL:removing item for key:',
                payload.fileName,
            );
            URL.revokeObjectURL(matchingFile.objectUrl);
            state.fileUrls.delete(payload.fileName);
        }

        //Keep the others and add the new one
        console.debug(
            'mutations::ADD_FILE_URL:adding item for key:',
            payload.fileName,
        );
        state.fileUrls.set(payload.fileName, payload);

        //TODO store the blob in indexed db first, then call this mutation on the store afterwards
    },
    [MutationTypes.REPLACE_COMPILATION](
        state: State,
        compilation: ICompilation,
    ) {
        console.debug(
            'mutations::REPLACE_COMPILATION:compilation',
            compilation,
        );

        state.compilation = compilation;
    },

    [MutationTypes.UPDATE_SELECTED_CUE](state: State, payload: Cue) {
        state.selectedCue = payload;
        PersistentStorage.storeSelectedCue(payload);
    },

    [MutationTypes.CLOSE_COMPILATION](state: State) {
        //TODO handle the indexed db persistence in an action first.
        PersistentStorage.clearCompilation();

        state.selectedCue = new Cue();
        state.compilation = new Compilation();

        state.fileUrls.forEach((file) => {
            URL.revokeObjectURL(file.objectUrl);
        });
        state.fileUrls.clear();
    },
    /** Sets whether to never show the welcome message ever again
     * @param state - The vuex state
     * @param neverShowWelcomeMessageAgain - The value for neverShowWelcomeMessageAgain
     */
    [MutationTypes.UPDATE_NEVER_SHOW_WELCOME_MESSAGE_AGAIN](
        state: State,
        neverShowWelcomeMessageAgain: boolean,
    ) {
        console.debug(
            'mutations::UPDATE_NEVER_SHOW_WELCOME_MESSAGE_AGAIN:neverShowWelcomeMessageAgain',
            neverShowWelcomeMessageAgain,
        );
        //TODO maybe replace this very simplictic local storage approach with in a more generic way
        localStorage.setItem(
            'neverShowWelcomeMessageAgain',
            neverShowWelcomeMessageAgain?.toString(),
        );
        state.neverShowWelcomeMessageAgain = neverShowWelcomeMessageAgain;
    },
    [MutationTypes.INIT_APPLICATION_STATE](state: State) {
        const storedNeverShowWelcomeMessageAgain = localStorage.getItem(
            'neverShowWelcomeMessageAgain',
        );
        if (storedNeverShowWelcomeMessageAgain) {
            state.neverShowWelcomeMessageAgain =
                storedNeverShowWelcomeMessageAgain == 'true';
        }
    },
};
