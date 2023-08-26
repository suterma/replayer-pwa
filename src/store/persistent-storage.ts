import { get, set, entries, del, clear } from 'idb-keyval';
import { MediaBlob } from './types';
import { Store } from '.';

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
        set(Store.MediaBlob + data.fileName, data.blob);
    }

    /** Retrieves media blob data from the persistent store
     * @devdoc The indexed db is used for blob data, as recommended.
     */
    static retrieveAllMediaBlobs(): Promise<MediaBlob[]> {
        return (entries() as Promise<[IDBValidKey, Blob][]>).then((entries) => {
            const mediaBlobs = new Array<MediaBlob>();

            entries.forEach((item) => {
                const key = item[0].toString();
                const blob = item[1];
                if (key.startsWith(Store.MediaBlob)) {
                    const fileName = key.slice(Store.MediaBlob.length);
                    mediaBlobs.push(new MediaBlob(fileName, blob));
                }
            });

            return mediaBlobs;
        });
    }
    /** Retrieves the given media blob data from the persistent store
     * @devdoc The indexed db is used for blob data, as recommended.
     */
    static retrieveMediaBlob(fileName: string): Promise<MediaBlob> {
        return (get(Store.MediaBlob + fileName) as Promise<Blob>).then(
            (blob) => {
                return new MediaBlob(fileName, blob);
            },
        );
    }

    /** Removes the given media blob data from the persistent store
     * @devdoc The indexed db is used for blob data, as recommended.
     */
    static removeMediaBlob(fileName: string): Promise<void> {
        return del(Store.MediaBlob + fileName);
    }

    /** Removes all media blob data from the persistent store
     * @devdoc The indexed db is used for blob data, as recommended.
     */
    static removeAllMediaBlob(): Promise<void> {
        return clear();
    }
}
