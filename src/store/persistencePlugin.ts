import { ObjectUrlHandler } from '@/code/storage/ObjectUrlHandler';
import { Store } from '@/store/store';
import CompilationHandler from './compilation-handler';
import { MutationTypes } from './mutation-types';
import PersistentStorage from './persistent-storage';
import { MediaUrl } from './state-types';

/** A plugin that handles persistence, to keep the settings, the compilation and
 * the selected cue over app restarts.
 *  */
export const persistencePlugin = (store: Store): void => {
    retrieveState(store);

    /** Subscribes to mutations of the state and persists the updated state.
     * @remarks Called after every mutation. The mutation comes in the format of `{ type, payload }`.
     */
    store.subscribe((mutation, state): void => {
        // console.debug('store:mutation', mutation);
        // console.debug('store:state', state);
        // Updated Messages are not persisted
        if (
            mutation.type === MutationTypes.PUSH_PROGRESS ||
            mutation.type === MutationTypes.PUSH_ERROR ||
            mutation.type === MutationTypes.POP_ERROR ||
            mutation.type === MutationTypes.POP_PROGRESS
        ) {
            return;
        }

        PersistentStorage.storeCompilation(state.compilation);
        PersistentStorage.storeSelectedCueId(state.selectedCueId);
        PersistentStorage.storeSelectedTrackId(state.selectedTrackId);
        PersistentStorage.storeSettings(state.settings);
    });
};

/** Retrieves the previously persisted state, if available
 */
function retrieveState(store: Store) {
    const settings = PersistentStorage.retrieveSettings();
    //console.debug('store:retrieveSettings', settings);
    store.commit(MutationTypes.UPDATE_SETTINGS, settings);

    store.commit(MutationTypes.PUSH_PROGRESS, 'Retrieving last compilation...');

    PersistentStorage.retrieveCompilation().then((compilation) => {
        PersistentStorage.retrieveSelectedCueId().then((cueId) => {
            PersistentStorage.retrieveSelectedTrackId().then((trackId) => {
                console.debug(
                    `retrieved Selected trackId:${trackId}; selected cueId:${cueId}`,
                );
                //Commit the compilation and selected cue only after both have been retrieved,
                //to make sure, committing one does not overwrite the other
                store.commit(MutationTypes.REPLACE_COMPILATION, compilation);

                console.debug(
                    `replace-retrieved Selected trackId:${trackId}; selected cueId:${cueId}`,
                );

                //retrieve all available blobs into object urls
                //(which should actually be the matching media blobs for the afore-loaded compilation)
                PersistentStorage.retrieveAllMediaBlobs()
                    .then((mediaBlobs) => {
                        //Sort to the most recently used track first, by cue.
                        console.debug(
                            `retrieveAllMediaBlobs Selected trackId:${trackId}; selected cueId:${cueId}`,
                        );

                        let mostRecentTrack = null;
                        if (trackId) {
                            mostRecentTrack = CompilationHandler.getTrackById(
                                compilation.Tracks,
                                trackId,
                            );
                        } else {
                            mostRecentTrack =
                                CompilationHandler.getTrackByCueId(
                                    compilation,
                                    cueId,
                                );
                        }
                        const sortedBlobs =
                            CompilationHandler.sortByFirstFileName(
                                mediaBlobs,
                                mostRecentTrack?.Url,
                            );

                        sortedBlobs.forEach((mediaBlob, index) => {
                            //NOTE: Setting an increasing timeout for each blob retrieval
                            //here makes the loading work properly for more than a few
                            //media blobs on an Android Fairphone 3+. Otherwise most
                            //(not all) the blobs are corrupted and
                            //not playable by the audio element.
                            //The exact reason is unknown, but might be excessive
                            //memory consumption when the object URL's are created
                            //synchronously or too fast in a row.
                            //This problem does only occur on larger compilations.
                            //The current timeout of 150ms has been empirically found to work reliably
                            //on a Fairphone 3+ with the "Family21" test compilation.
                            setTimeout(() => {
                                const objectUrl =
                                    ObjectUrlHandler.createObjectURL(
                                        mediaBlob.blob,
                                        mediaBlob.fileName,
                                    );
                                store.commit(
                                    MutationTypes.ADD_MEDIA_URL,
                                    new MediaUrl(mediaBlob.fileName, objectUrl),
                                );
                            }, (index + 1) * 150);
                        });

                        //Update the selected track/cue now
                        //HINT: This must be done last, otherwise the scrolling feature to the
                        //the active track does not work properly, because the track that would be
                        //scrolled to, would still be in the collapsed state. This would
                        //lead to an undesired offset, when the track is at the end of the visible area.
                        if (trackId) {
                            store.commit(
                                MutationTypes.UPDATE_SELECTED_TRACK_ID,
                                trackId,
                            );
                        }
                        if (cueId) {
                            store.commit(
                                MutationTypes.UPDATE_SELECTED_CUE_ID,
                                cueId,
                            );
                        }
                    })
                    .finally(() => {
                        store.commit(MutationTypes.POP_PROGRESS, undefined);
                    });
            });
        });
    });
}
