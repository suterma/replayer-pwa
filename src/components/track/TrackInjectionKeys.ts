import type { IMeter } from '@/code/music/IMeter';
import type { InjectionKey, Ref } from 'vue';

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

/** A symbol for providing and injecting the exact current playhead position in the track.
 * @remarks This is provided readonly, updates must be emitted as events.
 * @devdoc //TODO later create also a display variant with a ready-made, preformatted and rounded value, to improve performance
 */
export const currentPositionInjectionKey = Symbol() as InjectionKey<
    Ref<number | null>
>;

/** A symbol for providing and injecting a computed, formatted, display-only value for the playhead position.
 * @remarks This is provided readonly, and not updates are supported.
 * @devdoc Use this value for display-only purposes, for optimized performance. Removes the burden of formatting from components, and reduces render actions, when the displayed text not actually changes.
 */
export const currentPositionDisplayInjectionKey = Symbol() as InjectionKey<
    Ref<string>
>;
