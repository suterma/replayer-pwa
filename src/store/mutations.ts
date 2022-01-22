import { MutationTree } from 'vuex';
import { Compilation, ICompilation, ITrack } from './compilation-types';
import { MutationTypes } from './mutation-types';
import { State } from './state';
import { MediaUrl, Settings } from './state-types';
import PersistentStorage from './persistent-storage';
import { ObjectUrlHandler } from '@/code/storage/ObjectUrlHandler';

export type Mutations<S = State> = {
    [MutationTypes.PUSH_PROGRESS_MESSAGE](state: S, payload: string): void;
    [MutationTypes.POP_PROGRESS_MESSAGE](state: S): void;
    [MutationTypes.PUSH_ERROR_MESSAGE](state: S, payload: string): void;
    [MutationTypes.POP_ERROR_MESSAGE](state: S): void;
    [MutationTypes.FINISH_PROGRESS](state: State): void;
    [MutationTypes.ADD_MEDIA_URL](state: S, mediaUrl: MediaUrl): void;
    [MutationTypes.ADD_TRACK](state: S, track: ITrack): void;
    [MutationTypes.REPLACE_COMPILATION](
        state: S,
        compilation: ICompilation,
    ): void;
    [MutationTypes.REPLACE_COMPILATION_AND_SELECT_FIRST_CUE](
        state: S,
        compilation: ICompilation,
    ): void;
    [MutationTypes.UPDATE_SELECTED_CUE_ID](state: S, cueId: string): void;
    [MutationTypes.CLOSE_COMPILATION](state: S): void;
    [MutationTypes.REVOKE_ALL_MEDIA_URLS](state: State): void;
    [MutationTypes.UPDATE_SETTINGS](state: S, settings: Settings): void;
    [MutationTypes.RETRIEVE_SETTINGS](state: S): void;
    [MutationTypes.UPDATE_COMPILATION_TITLE](state: State, title: string): void;
};

export const mutations: MutationTree<State> & Mutations = {
    [MutationTypes.PUSH_PROGRESS_MESSAGE](state: State, message: string) {
        state.progressMessageStack.push(message);
        console.log('PROGRESS: ' + message);
    },
    [MutationTypes.PUSH_ERROR_MESSAGE](state: State, message: string) {
        state.errorMessageStack.push(message);
        console.log('ERROR: ' + message);
    },
    [MutationTypes.POP_PROGRESS_MESSAGE](state: State) {
        const message = state.progressMessageStack.pop();
        console.debug('POP_PROGRESS_MESSAGE: ' + message);
    },
    [MutationTypes.POP_ERROR_MESSAGE](state: State) {
        const message = state.errorMessageStack.pop();
        console.debug('POP_ERROR_MESSAGE: ' + message);
    },
    [MutationTypes.FINISH_PROGRESS](state: State) {
        state.progressMessageStack.length = 0;
        console.debug('FINISH_PROGRESS');
    },

    [MutationTypes.ADD_MEDIA_URL](state: State, mediaUrl: MediaUrl) {
        //Remove any previously matching, even it was the same object, because
        //the caller has already create a new one for this mediaUrl's blob.
        const matchingFile = state.mediaUrls.get(mediaUrl.fileName);
        if (matchingFile) {
            console.debug(
                'mutations::ADD_MEDIA_URL:removing matching item for key:',
                mediaUrl.fileName,
            );
            ObjectUrlHandler.revokeObjectURL(matchingFile.objectUrl);
            state.mediaUrls.delete(mediaUrl.fileName);
        }

        //Keep the others and add the new one
        console.debug('mutations::ADD_MEDIA_URL:', mediaUrl.fileName);
        state.mediaUrls.set(mediaUrl.fileName, mediaUrl);
    },

    [MutationTypes.ADD_TRACK](state: State, track: ITrack) {
        console.debug('mutations::ADD_TRACK:', track);
        state.compilation.Tracks.push(track);
        PersistentStorage.storeCompilation(state.compilation);
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
        PersistentStorage.storeCompilation(compilation);
    },
    [MutationTypes.REPLACE_COMPILATION_AND_SELECT_FIRST_CUE](
        state: State,
        compilation: ICompilation,
    ) {
        console.debug(
            'mutations::REPLACE_COMPILATION_AND_SELECT_FIRST_CUE:compilation',
            compilation,
        );

        //find and commit the first cue
        if (compilation) {
            const tracks = compilation.Tracks;
            const cues = tracks.flatMap((track) => track.Cues);
            const firstCueId = cues[0]?.Id;

            state.selectedCueId = firstCueId;
            PersistentStorage.storeSelectedCueId(firstCueId);
        }

        state.compilation = compilation;
        PersistentStorage.storeCompilation(compilation);
    },
    [MutationTypes.UPDATE_SELECTED_CUE_ID](state: State, cueId: string) {
        //Do not update the store, when it's the same value
        if (state.selectedCueId == cueId) {
            return;
        }
        state.selectedCueId = cueId;
        PersistentStorage.storeSelectedCueId(cueId);
    },

    [MutationTypes.CLOSE_COMPILATION](state: State) {
        PersistentStorage.clearCompilation();

        state.selectedCueId = '';
        state.compilation = Compilation.empty();

        state.mediaUrls.forEach((file) => {
            ObjectUrlHandler.revokeObjectURL(file.objectUrl);
        });
        state.mediaUrls.clear();
    },
    [MutationTypes.REVOKE_ALL_MEDIA_URLS](state: State) {
        state.mediaUrls.forEach((file) => {
            ObjectUrlHandler.revokeObjectURL(file.objectUrl);
        });
        state.mediaUrls.clear();
    },
    /** Updates the application settings
     * @param state - The vuex state
     * @param settings - The application settings
     */
    [MutationTypes.UPDATE_SETTINGS](state: State, settings: Settings) {
        PersistentStorage.storeSettings(settings);
        state.settings = settings;
    },
    [MutationTypes.RETRIEVE_SETTINGS](state: State) {
        state.settings = PersistentStorage.retrieveSettings();
    },
    [MutationTypes.UPDATE_COMPILATION_TITLE](
        state: State,
        title: string,
    ): void {
        console.debug('mutations::UPDATE_COMPILATION_TITLE:title', title);
        state.compilation.Title = title;
        PersistentStorage.storeCompilation(state.compilation);
    },
};
