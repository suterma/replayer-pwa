import { Store } from '../store';

/** Declares the vuex store */

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $store: Store;
    }
}

/** Declares the audio context on the window object
 * @devdoc Currently the audio context is not used
 */
interface Window {
    webkitAudioContext: typeof AudioContext;
}
