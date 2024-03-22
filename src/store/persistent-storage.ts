import { MediaBlob } from './types';
import { Store } from '.';
import { useMessageStore } from './messages';
import localForage from 'localforage';

/**
 * Configure the store
 * @devdoc This currently uses localforage for storage and retrieval, but for
 * compatibility with the formerly used idb-keyval, the database name and the
 * store name are configured to match those of idb-keyval */

localForage.config({
    name: 'keyval-store',
    storeName: 'keyval',
    description: 'Replayer media storage',
});

/**
 * Provides simplified access to persistent storage for blobs within the Replayer app. This
 * allows to keep the media files, available over
 * web app restarts.
 * @devdoc Implements a module as described in https://www.typescriptlang.org/docs/handbook/modules.html
 * @devdoc This currently uses localforage for storage and retrieval, but for
 * compatibility with the formerly used idb-keyval, the database name and the
 * store name are configured to match those of idb-keyval */
export default class PersistentStorage {
    /** Persistently stores media blob data for later retrieval
     * @devdoc The indexed db is used for blob data, as recommended for large data.
     */
    static storeMediaBlob(data: { fileName: string; blob: Blob }): void {
        console.debug(
            'PersistentStorage::storeMediaBlob:fileName',
            data.fileName,
        );

        // NOTE: blob storage is not guaranteed to be available
        localForage
            .setItem(Store.MediaBlob + data.fileName, data.blob)
            .catch((errorMessage: string) => {
                useMessageStore().pushError(errorMessage);
            });
    }

    /** Retrieves media blob data from the persistent store
     * @remarks In case of an error, as many blobs as possilbe are returned, but
     * the set might also be empty.
     * @devdoc The indexed db is used for blob data, as recommended.
     */
    static retrieveAllMediaBlobs(): Promise<MediaBlob[]> {
        console.debug('PersistentStorage::retrieveAllMediaBlobs');
        const mediaBlobs = new Array<MediaBlob>();

        return localForage
            .iterate((value, key) => {
                if (key.startsWith(Store.MediaBlob)) {
                    const fileName = key.slice(Store.MediaBlob.length);
                    console.debug(`PersistentStorage::iterate:${fileName}`);
                    mediaBlobs.push(new MediaBlob(fileName, value as Blob));
                }
            })
            .then(() => mediaBlobs);
    }

    /** Removes the given media blob data from the persistent store
     * @devdoc The indexed db is used for blob data, as recommended.
     */
    static removeMediaBlob(fileName: string): Promise<void> {
        console.debug('PersistentStorage::removeMediaBlob');
        return localForage
            .removeItem(Store.MediaBlob + fileName)
            .catch((errorMessage: string) => {
                useMessageStore().pushError(errorMessage);
            });
    }

    /** Removes all media blob data from the persistent store
     * @devdoc The indexed db is used for blob data, as recommended.
     */
    static removeAllMediaBlob(): Promise<void> {
        console.debug('PersistentStorage::removeAllMediaBlob');
        return localForage.clear().catch((errorMessage: string) => {
            useMessageStore().pushError(errorMessage);
        });
    }
}
