/** The keys to access the used storage */
enum StorageKeys {
    COMPILATION = 'COMPILATION',
    SELECTED_CUE = 'SELECTED_CUE',
}

// export interface IPersistentStorage {
//     storeCompilation(compilation: ICompilation): void;
//     retrieveCompilation(): ICompilation;
//     clearCompilation(): void;
// }

import { Compilation, Cue, ICompilation, ICue } from './compilation-types';

/**
 * Provides simplified access to persistent storage for the Vuex store in the Replayer app. This
 * allows to keep the currently loaded compilation, along with the media files, available over
 * browser restarts.
 * @devdoc Internally decides on optimal storage use for each entity, thus hiding this complexity from the using code.
 * @devdoc implements a module as described in https://www.typescriptlang.org/docs/handbook/modules.html */
export class PersistentStorage /*implements IPersistentStorage*/ {
    static storeCompilation(compilation: ICompilation): void {
        localStorage.setItem(
            StorageKeys.COMPILATION,
            JSON.stringify(compilation),
        );
    }
    static retrieveCompilation(): ICompilation {
        const compilationItem = localStorage.getItem(StorageKeys.COMPILATION);
        if (compilationItem) {
            const compilation = JSON.parse(compilationItem);

            if (compilation) {
                return compilation;
            }
        }
        return new Compilation();
    }
    static clearCompilation(): void {
        localStorage.removeItem(StorageKeys.COMPILATION);
        localStorage.removeItem(StorageKeys.SELECTED_CUE);
    }
    static storeSelectedCue(cue: ICue): void {
        localStorage.setItem(StorageKeys.SELECTED_CUE, JSON.stringify(cue));
    }
    static retrieveSelectedCue(): ICue {
        const cueItem = localStorage.getItem(StorageKeys.SELECTED_CUE);
        if (cueItem) {
            const cue = JSON.parse(cueItem);

            if (cue) {
                return cue;
            }
        }
        return new Cue();
    }
}

/**
 * Provides simplified access to persistent storage for the Vuex store in the Replayer app.
 * @devdoc Internally decides on optimal storage use for each entity, thus hiding this complexity from the using code.
 */
// export function storeCompilation(compilation: ICompilation) {
//     localStorage.setItem(StorageKeys.COMPILATION, JSON.stringify(compilation));
// }

// export function retrieveCompilation(): ICompilation {
//     const compilationItem = localStorage.getItem(StorageKeys.COMPILATION);
//     if (compilationItem) {
//         const compilation = JSON.parse(compilationItem);

//         if (compilation) {
//             return compilation;
//         }
//     }
//     return new Compilation();
// }

// export function clearCompilation() {
//     localStorage.removeItem(StorageKeys.COMPILATION);
// }
