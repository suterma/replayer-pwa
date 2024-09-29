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

import type { PlaybackState } from '@/code/media/PlaybackState';
import type { IMeter } from '@/code/music/IMeter';
import type { InjectionKey, Ref } from 'vue';

/** @file A set of injection keys for providing track state to descendant components of a track,
 * @remarks Implements the app state architecture, for tracks. */

/** A symbol for providing and injecting a @see IMeter */
export const meterInjectionKey = Symbol() as InjectionKey<Ref<IMeter | null>>;

/** A symbol for providing and injecting whether to use measure numbers for cue
 * position handling. This requires a valid @see IMeter */
export const useMeasureNumbersInjectionKey = Symbol() as InjectionKey<
    Ref<boolean | null>
>;

/** A symbol for providing and injecting the pre-roll duration to use for a track
 */
export const trackPreRollDurationInjectionKey = Symbol() as InjectionKey<
    Ref<number>
>;

/** A symbol for providing and injecting the fade-in duration to use for a track
 */
export const trackFadeInDurationInjectionKey = Symbol() as InjectionKey<
    Ref<number>
>;

/** A symbol for providing and injecting the playback state. */
export const playbackStateInjectionKey = Symbol() as InjectionKey<
    Ref<PlaybackState>
>;

/** A symbol for providing and injecting whether the media player will omit
 * the fade-in operation on the next, subsequent play operation */
export const isOmittingNextFadeInInjectionKey = Symbol() as InjectionKey<
    Ref<boolean | null>
>;

/** A symbol for providing and injecting the exact current playhead position in the track.
 * @remarks This is provided readonly, updates must be emitted as events.
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
