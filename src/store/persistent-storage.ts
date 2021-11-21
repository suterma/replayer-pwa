/** The keys to access the used storage */
enum StorageKeys {
    COMPILATION = 'COMPILATION',
    SELECTED_CUE = 'SELECTED_CUE',
}

import { Compilation, Cue, ICompilation, ICue } from './compilation-types';
import { get, set, del } from 'idb-keyval';

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
    /** Persistently stores the compilation for later retrieval
     * @devdoc The local storage is used for compilation for performance reasons here. No need to use the Indexed Db for small data
     */
    static storeCompilation(compilation: ICompilation): void {
        localStorage.setItem(
            StorageKeys.COMPILATION,
            JSON.stringify(compilation),
        );
        //TODO later remove
        //set(StorageKeys.COMPILATION, JSON.stringify(compilation));
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

        //TODO later remove
        // return (get(StorageKeys.COMPILATION) as Promise<string>).then(
        //     (compilation) => {
        //         if (compilation) {
        //             const compilationObject = JSON.parse(
        //                 compilation,
        //             ) as ICompilation;
        //             //console.debug('retrievedCompilation', compilationObject);
        //             return compilationObject;
        //         } else return new Compilation();
        //     },
        // );
    }
    static clearCompilation(): void {
        //TODO later remove
        //del(StorageKeys.COMPILATION);
        localStorage.removeItem(StorageKeys.COMPILATION);
        del(StorageKeys.SELECTED_CUE);
    }
    static storeSelectedCue(cue: ICue): void {
        set(StorageKeys.SELECTED_CUE, JSON.stringify(cue));
    }
    static async retrieveSelectedCue(): Promise<ICue> {
        return (get(StorageKeys.SELECTED_CUE) as Promise<string>).then(
            (cue) => {
                //console.debug('get cue item', cueItem);
                if (cue) {
                    return JSON.parse(cue);
                } else return new Cue();
            },
        );
    }
}
