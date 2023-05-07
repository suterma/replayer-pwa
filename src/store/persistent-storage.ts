import { get, set, entries, del, clear } from 'idb-keyval';
import { MediaBlob } from './state-types';
import { StorageKeys } from '.';

/**
 * Provides simplified access to persistent storage for the Replayer app. This
 * allows to keep the media files, available over
 * web app restarts.
 * //TODO later with pinia, use it directly from the pinia app store (or maybe make a specific store?)
 * @devdoc Internally decides on optimal storage type use for each entity, thus hiding this complexity from the using code.
 * @devdoc Implements a module as described in https://www.typescriptlang.org/docs/handbook/modules.html */
export default class PersistentStorage /*implements IPersistentStorage*/ {
    /** Persistently stores media blob data for later retrieval
     * @devdoc The indexed db is used for blob data, as recommended for large data.
     */
    static storeMediaBlob(data: { fileName: string; blob: Blob }): void {
        console.debug(
            'PersistentStorage::storeMediaBlob:fileName',
            data.fileName,
        );
        set(StorageKeys.MEDIA_BLOB + data.fileName, data.blob);
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
                if (key.startsWith(StorageKeys.MEDIA_BLOB)) {
                    const fileName = key.slice(StorageKeys.MEDIA_BLOB.length);
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
        return (get(StorageKeys.MEDIA_BLOB + fileName) as Promise<Blob>).then(
            (blob) => {
                return new MediaBlob(fileName, blob);
            },
        );
    }

    /** Removes the given media blob data from the persistent store
     * @devdoc The indexed db is used for blob data, as recommended.
     */
    static removeMediaBlob(fileName: string): Promise<void> {
        return del(StorageKeys.MEDIA_BLOB + fileName);
    }

    /** Removes all media blob data from the persistent store
     * @devdoc The indexed db is used for blob data, as recommended.
     */
    static removeAllMediaBlob(): Promise<void> {
        return clear();
    }
}
