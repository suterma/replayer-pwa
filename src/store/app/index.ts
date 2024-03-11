import { defineStore } from 'pinia';
import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import PersistentStorage from '../persistent-storage';
import { Store } from '..';
import { useMessageStore } from '../messages';

/** A store for the app (compilation and associated) state
 * @devdoc This follows the setup store syntax. See https://pinia.vuejs.org/core-concepts/#setup-stores
 */
export const useAppStore = defineStore(Store.App, () => {
    PersistentStorage.retrieveAllMediaBlobs()
        .then((mediaBlobs) => {
            mediaBlobs.forEach((blob) => {
                actions.addMediaBlob(blob);
            });
        })
        .catch(() => {
            useMessageStore().pushError(
                `Some media files are not available from the persistent storage. These media files must get provided by the user.`,
            );
        });

    return {
        ...state,
        ...getters,
        ...actions,
    };
});
