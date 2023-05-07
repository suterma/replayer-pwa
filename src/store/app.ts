import { defineStore } from 'pinia';
import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import PersistentStorage from './persistent-storage';
import { StorageKeys } from '.';

/** A store for the app (compilation and associated) state
 * @devdoc This follows the setup store syntax. See https://pinia.vuejs.org/core-concepts/#setup-stores
 */
export const useAppStore = defineStore(StorageKeys.APP, () => {
    PersistentStorage.retrieveAllMediaBlobs().then((mediaBlobs) => {
        mediaBlobs.forEach((blob) => {
            actions.addMediaBlob(blob);
        });
    });

    return {
        ...state,
        ...getters,
        ...actions,
    };
});
