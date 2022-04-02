import { Store } from '../store';

/** Declares the vuex store */

declare module '@vue/runtime-core' {
    interface ComponentCustomProperties {
        $store: Store;
    }
}
