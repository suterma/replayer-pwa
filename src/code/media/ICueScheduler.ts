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

import type { ICue } from '@/store/ICue';

/** @interface Defines scheduling cues in a track.
 * @remarks This defines a playlist for cue invocations.
 * Currently only one single next cue is queued.
 * Intentionally, no volume control is defined with regards to scheduling.
 * Implementors are free to apply e.g. fading when invocations take place.
 */
export interface ICueScheduler {
    /** Schedule a cue for later invocation
     * @param {ICue} cue - the cue to schedule
     * @param {number} timeout - the number of seconds to wait until the cue is invoked
     * @return A promise that resolves when the scheduled cue has been invoked,
     * or rejects when the scheduling has been removed.
     */
    ScheduleCue(cue: ICue, timeout: number): Promise<void>;

    /** Removes a set schedule */
    RemoveSchedule(): void;
}
