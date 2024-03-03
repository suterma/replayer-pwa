import { set, entries, del, clear } from 'idb-keyval';
import { MediaBlob } from './types';
import { Store } from '.';
import { useMessageStore } from './messages';

/**
 * Provides simplified access to persistent storage for blobs within the Replayer app. This
 * allows to keep the media files, available over
 * web app restarts.
 * @devdoc Implements a module as described in https://www.typescriptlang.org/docs/handbook/modules.html */
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
        // Especially on some older iOS devices only some/small files can be stored
        set(Store.MediaBlob + data.fileName, data.blob).catch(
            (errorMessage: string) => {
                useMessageStore().pushError(errorMessage);
            },
        );
    }

    /** Retrieves media blob data from the persistent store
     * @remarks In case of an error, as many blobs as possilbe are returned, but
     * the set might also be empty.
     * @devdoc The indexed db is used for blob data, as recommended.
     */
    static retrieveAllMediaBlobs(): Promise<MediaBlob[]> {
        console.debug('PersistentStorage::retrieveAllMediaBlobs');
        return (entries() as Promise<[IDBValidKey, Blob][]>)
            .then((entries) => {
                const mediaBlobs = new Array<MediaBlob>();
                entries.forEach((item) => {
                    const key = item[0].toString();
                    try {
                        const blob = item[1];
                        if (key.startsWith(Store.MediaBlob)) {
                            const fileName = key.slice(Store.MediaBlob.length);
                            mediaBlobs.push(new MediaBlob(fileName, blob));
                        }
                    } catch (error) {
                        console.warn(
                            `The blob for key '${key}' could not be retrieved from the persistent blob storage. The media must get provided separately by the user.`,
                            error,
                        );
                    }
                });

                return mediaBlobs;
            })
            .catch((errorMessage: string) => {
                useMessageStore().pushError(errorMessage);
                return new Array<MediaBlob>();
            });
    }

    /** Removes the given media blob data from the persistent store
     * @devdoc The indexed db is used for blob data, as recommended.
     */
    static removeMediaBlob(fileName: string): Promise<void> {
        console.debug('PersistentStorage::removeMediaBlob');
        return del(Store.MediaBlob + fileName).catch((errorMessage: string) => {
            useMessageStore().pushError(errorMessage);
        });
    }

    /** Removes all media blob data from the persistent store
     * @devdoc The indexed db is used for blob data, as recommended.
     */
    static removeAllMediaBlob(): Promise<void> {
        console.debug('PersistentStorage::removeAllMediaBlob');
        return clear().catch((errorMessage: string) => {
            useMessageStore().pushError(errorMessage);
        });
    }
}
