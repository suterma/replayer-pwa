import { Store } from '../store';

/** Declares the vuex store */
declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $store: Store;
    }
}

/** Declaring the AudioContext for webkit
 * @devdoc This is required to have a usable audio context on macOS 12 and below
 * See https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Migrating_from_webkitAudioContext
 * See also https://caniuse.com/?search=%20AudioContext for general support
 */
declare global {
    interface Window {
        webkitAudioContext: typeof AudioContext;
    }
}
