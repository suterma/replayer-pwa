import { Store } from '../store';

/** Declares the vuex store */
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $store: Store;
    }
}

/** Declaring the AudioContext for webkit
 * @devdoc This is required to have a usable audio context on macOS 12 and below
 */
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}
