import { Store } from '@/store/store';
import { MutationTypes } from './mutation-types';
import PersistentStorage from './persistent-storage';

/** Called when the store is initialized */
export const persistencePlugin = (store: Store) => {
    /** Called after every mutation.
     * @remarks The mutation comes in the format of `{ type, payload }`.
     */
    store.subscribe((mutation, state) => {
        //console.debug('store:mutation', mutation);
        //console.debug('store:state', state);

        //Actions that occur before a previously persisted compilation is loaded back,
        //should not trigger persisting. Otherwise the still empty state would erase the
        //previously persisted state.
        if (
            !(
                mutation.type === MutationTypes.RETRIEVE_SETTINGS ||
                mutation.type === MutationTypes.PUSH_PROGRESS_MESSAGE ||
                mutation.type === MutationTypes.PUSH_ERROR_MESSAGE
            )
        ) {
            PersistentStorage.storeCompilation(state.compilation);
        }

        //Actions that occur before a previously persisted selected cue is loaded back,
        //should not trigger persisting. Otherwise the still empty state would erase the
        //previously persisted state.
        if (
            !(
                mutation.type === MutationTypes.RETRIEVE_SETTINGS ||
                mutation.type === MutationTypes.PUSH_PROGRESS_MESSAGE ||
                mutation.type === MutationTypes.PUSH_ERROR_MESSAGE ||
                mutation.type === MutationTypes.REPLACE_COMPILATION
            )
        ) {
            PersistentStorage.storeSelectedCueId(state.selectedCueId);
        }
    });
};