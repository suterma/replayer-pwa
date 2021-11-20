/** The keys to access the used storage */
enum StorageKeys {
    COMPILATION = 'COMPILATION',
    SELECTED_CUE = 'SELECTED_CUE',
}

import { Compilation, Cue, ICompilation, ICue } from './compilation-types';
import { get, set, del } from 'idb-keyval';

/**
 * Provides simplified access to persistent storage for the Vuex store in the Replayer app. This
 * allows to keep the currently loaded compilation, along with the media files, available over
 * browser restarts.
 * @devdoc Internally decides on optimal storage use for each entity, thus hiding this complexity from the using code.
 * @devdoc implements a module as described in https://www.typescriptlang.org/docs/handbook/modules.html */
export class PersistentStorage /*implements IPersistentStorage*/ {
    static storeCompilation(compilation: ICompilation): void {
        console.debug('storeCompilation', compilation);
        set(StorageKeys.COMPILATION, JSON.stringify(compilation));
    }
    static async retrieveCompilationAsync(): Promise<ICompilation> {
        //console.debug('PersistentStorage::retrieveCompilationAsync');
        return (get(StorageKeys.COMPILATION) as Promise<string>).then(
            (compilation) => {
                if (compilation) {
                    const compilationObject = JSON.parse(
                        compilation,
                    ) as ICompilation;
                    //console.debug('retrievedCompilation', compilationObject);
                    return compilationObject;
                } else return new Compilation();
            },
        );
    }
    static clearCompilation(): void {
        del(StorageKeys.COMPILATION);
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
