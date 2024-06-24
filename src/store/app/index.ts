/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

import { defineStore } from 'pinia';
import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import PersistentStorage from '../persistent-storage';
import { Store } from '..';
import { useMessageStore } from '../messages';
import { mediaActions } from './mediaActions';
import { watch } from 'vue';

/** A store for the general app state, including the currently loaded compilation
 * @remarks This implements the application store part of the main concepts, documented at https://github.com/suterma/replayer-pwa/tree/main/doc#main-concepts
 * @devdoc This follows the setup store syntax. See https://pinia.vuejs.org/core-concepts/#setup-stores
 */
export const useAppStore = defineStore(Store.App, () => {
    //TODO actually create a separate store, as already pictured in the doc: https://github.com/suterma/replayer-pwa/tree/main/doc
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

    /** Updates the shuffle seed if required by a playback mode change.
     */
    watch(
        getters.isTracksShuffled,
        (isShuffled) => {
            if (isShuffled) {
                state.shuffleSeed = ++state.shuffleSeed;
            }
        },
        { deep: true },
    );

    return {
        ...state,
        ...getters,
        ...actions,
        ...mediaActions,
    };
});
