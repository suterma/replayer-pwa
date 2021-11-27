/** The keys to access the used storage */
enum StorageKeys {
    COMPILATION = 'COMPILATION',
    SELECTED_CUE_ID = 'SELECTED_CUE_ID',
    MEDIA_BLOB = 'MEDIA_BLOB',
}

import { Compilation, ICompilation } from './compilation-types';
import { get, set, clear, entries } from 'idb-keyval';
import { MediaBlob } from './state-types';

/** @devdoc Taken from
 * async-local-storage
 * https://github.com/createnextapp/async-local-storage/blob/master/src/index.ts
 * //TODO maybe include this lib?
 */
const createPromise = (getValue: any, callback: any): Promise<any> => {
    return new Promise((resolve, reject) => {
        try {
            const value = getValue();
            if (callback) {
                callback(null, value);
            }
            resolve(value);
        } catch (err) {
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
    /** Retrieves the compilation from the persistent store
     * @devdoc This returns a Compilation-like object, which does not acutally have Compilation and related prototypes.
     * This leads to warnings in Vue's property type check for non-production builds.
     * Assignment via Object.assign might overcome this issue, but I refrain from that since it is actually unnecessary.
     * See  https://stackoverflow.com/a/43977474/79485
     * Also, using https://www.npmjs.com/package/ts-serializable might be a solution, but requires annotation.
     * */
    static async retrieveCompilation(): Promise<ICompilation> {
        return createPromise(() => {
            const compilation = localStorage.getItem(StorageKeys.COMPILATION);
            if (compilation) {
                return JSON.parse(compilation);
            }
            return new Compilation();
        }, null);
    }
    static clearCompilation(): void {
        localStorage.removeItem(StorageKeys.COMPILATION);
        localStorage.removeItem(StorageKeys.SELECTED_CUE_ID);
        clear(); // the media blobs
    }
    /** Persistently stores the selected cue Id for later retrieval
     * @devdoc The local storage is used for performance reasons here. No need to use the Indexed Db for small data
     */
    static storeSelectedCueId(cueId: string): void {
        localStorage.setItem(StorageKeys.SELECTED_CUE_ID, cueId);
    }
    /** Retrieves the selected cue Id from the persistent store
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
}
