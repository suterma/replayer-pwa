/** The keys to access the used storage */
export enum StorageKeys {
    COMPILATION = 'COMPILATION',
    SELECTED_CUE_ID = 'SELECTED_CUE_ID',
    SELECTED_TRACK_ID = 'SELECTED_TRACK_ID',
    MEDIA_BLOB = 'MEDIA_BLOB',
    SETTINGS = 'SETTINGS',
}

import { Compilation, ICompilation } from './compilation-types';
import { get, set, clear, entries, del } from 'idb-keyval';
import { MediaBlob } from './state-types';

/** @devdoc Taken from
 * async-local-storage
 * https://github.com/createnextapp/async-local-storage/blob/master/src/index.ts
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const createPromise = (getValue: any, callback: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            const value = getValue();

            if (callback) {
                callback(null, value);
            }
            resolve(value);
        } catch (err) {
            console.debug('PersistentStorage::catch:err', err);
            if (callback) {
                callback(err);
            }
            reject(err);
        }
    });
};

/**
 * Provides simplified access to persistent storage for the Vuex store in the Replayer app. This
 * allows to keep the currently loaded compilation, along with the media files, available over
 * web app restarts.
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
    /** Persistently stores the compilation for later retrieval
     * @devdoc The local storage is used for performance reasons here. No need to use the Indexed Db for small data
     */
    static storeCompilation(compilation: ICompilation): void {
        localStorage.setItem(
            StorageKeys.COMPILATION,
            JSON.stringify(compilation),
        );
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

    /** Retrieves the compilation from the persistent store
     * @returns a properly typed Compilation object
     * */
    static async retrieveCompilation(): Promise<ICompilation> {
        return createPromise(() => {
            const compilation = localStorage.getItem(StorageKeys.COMPILATION);
            if (compilation) {
                return Compilation.fromJson(compilation);
            }
            return Compilation.empty();
        }, null);
    }

    /** Determines whether there is a (non-empty) compilation to retrieve from the persistent store
     * @returns true, when a complilation is availabe to retrieve
     * */
    static hasRetrievableCompilation(): boolean {
        const compilation = localStorage.getItem(StorageKeys.COMPILATION);
        if (compilation) {
            if (Compilation.fromJson(compilation).Id) {
                //An id is available, making the compilation to be considered as non-empty
                return true;
            }
        }

        return false;
    }
    static clearCompilation(): void {
        localStorage.removeItem(StorageKeys.COMPILATION);
        localStorage.removeItem(StorageKeys.SELECTED_CUE_ID);
        localStorage.removeItem(StorageKeys.SELECTED_TRACK_ID);
        clear(); // the media blobs
    }
    /** Persistently stores the selected cue Id for later retrieval
     * @devdoc The local storage is used for performance reasons here. No need to use the Indexed Db for small data
     * @param cueId - The cue's identifier. Set to null, when no cue should be considered selected.
     * @devdoc null values are simply stored as empty string, since null values are considered as not existing. Removing the key entirely
     * would not improve the meaning in the context of the cue storage.
     */
    static storeSelectedCueId(cueId: string | null): void {
        localStorage.setItem(StorageKeys.SELECTED_CUE_ID, cueId ?? '');
    }
    /** Persistently stores the selected track Id for later retrieval
     * @devdoc The local storage is used for performance reasons here. No need to use the Indexed Db for small data
     * @param trackId - The track's identifier. Set to null, when no track should be considered selected.
     * @devdoc null values are simply stored as empty string, since null values are considered as not existing. Removing the key entirely
     * would not improve the meaning in the context of the cue storage.
     */
    static storeSelectedTrackId(trackId: string | null): void {
        localStorage.setItem(StorageKeys.SELECTED_TRACK_ID, trackId ?? '');
    }
    /** Retrieves the selected cue Id from the persistent store.
     * @devdoc null values are simply stored as empty string, since null values are considered as not existing. Removing the key entirely
     * would not improve the meaning in the context of the cue storage.
     * @remarks Returns the identifier or null if there was none or an empty one.
     * */
    static async retrieveSelectedCueId(): Promise<string> {
        return createPromise(() => {
            const cueId = localStorage.getItem(StorageKeys.SELECTED_CUE_ID);
            if (cueId) {
                return cueId;
            }
            return null;
        }, null);
    }

    /** Retrieves the selected track Id from the persistent store.
     * @devdoc null values are simply stored as empty string, since null values are considered as not existing. Removing the key entirely
     * would not improve the meaning in the context of the cue storage.
     * @remarks Returns the identifier or null if there was none or an empty one.
     * */
    static async retrieveSelectedTrackId(): Promise<string> {
        return createPromise(() => {
            const trackId = localStorage.getItem(StorageKeys.SELECTED_TRACK_ID);
            if (trackId) {
                return trackId;
            }
            return null;
        }, null);
    }
}
