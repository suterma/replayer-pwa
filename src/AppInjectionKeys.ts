/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

/** @file A set of injection keys for providing app state to descendant components of the app*/
import type { InjectionKey, Ref } from 'vue';

/** A symbol for providing and injecting the nav bar compensation height */
export const navbarCompensationHeightInjectionKey = Symbol() as InjectionKey<
    Ref<number>
>;
