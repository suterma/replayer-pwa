import { IMeter } from '@/code/music/IMeter';
import { InjectionKey, Ref } from 'vue';

/** @file A set of injection keys, implementing the store architecture. */

/** A symbol for providing and injecting a @see IMeter */
export const meterInjectionKey = Symbol() as InjectionKey<Ref<IMeter | null>>;
