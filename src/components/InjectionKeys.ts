import { IMeter } from '@/code/music/IMeter';
import { InjectionKey, Ref } from 'vue';

/** @file A set of injection keys, implementing the app architecture. */

/** A symbol for providing and injecting a @see IMeter */
export const meterInjectionKey = Symbol() as InjectionKey<Ref<IMeter | null>>;

/** A symbol for providing and injecting whethter to use measure numbers for cue position handling. This requires a valid @see IMeter */
export const useMeasureNumbersInjectionKey = Symbol() as InjectionKey<
    Ref<boolean | null>
>;
