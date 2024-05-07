/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import type { InjectionKey, Ref } from 'vue';

/** @file A set of injection keys for providing app state to descendant components of the app,

/** A symbol for providing and injecting the nav bar compensation height */
export const navbarCompensationHeightInjectionKey = Symbol() as InjectionKey<
    Ref<number>
>;
