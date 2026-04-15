/** @file A set of injection keys for providing app state to descendant components of the app*/
import type { InjectionKey, Ref } from 'vue';

/** A symbol for providing and injecting the nav bar compensation height */
export const navbarCompensationHeightInjectionKey = Symbol() as InjectionKey<
    Ref<number>
>;
