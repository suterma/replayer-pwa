/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import { Store } from '../store';

/** Declares the store
 * @devdoc The reason why this store definition is necessary, is unknown. 
 * However, otherwise store use in options-API-based components does not work.
 */
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
