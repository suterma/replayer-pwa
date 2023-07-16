import { IMeter } from '@/code/music/IMeter';
import { InjectionKey, Ref } from 'vue';

/** @file A set of injection keys for providing track state to descendant components of a track,
 * @remarks Implements the app state architecture, for tracks. */

/** A symbol for providing and injecting a @see IMeter */
export const meterInjectionKey = Symbol() as InjectionKey<Ref<IMeter | null>>;

/** A symbol for providing and injecting whethter to use measure numbers for cue position handling. This requires a valid @see IMeter */
export const useMeasureNumbersInjectionKey = Symbol() as InjectionKey<
    Ref<boolean | null>
>;

/** A symbol for providing and injecting whether the track is playing. */
export const isPlayingInjectionKey = Symbol() as InjectionKey<
    Ref<boolean | null>
>;
