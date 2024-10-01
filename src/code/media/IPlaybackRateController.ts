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

import type { SubEventImmediate } from './SubEventImmediate';

/** @interface Defines a playback rate controller.
 */
export interface IPlaybackRateController {
    /** Gets or sets the media playback rate, as a factor.
     */
    playbackRate: number;

    /** Emits a changed playback rate.
     * @param {number} rate - the changed rate
     */
    readonly onPlaybackRateChanged: SubEventImmediate<number>;
}
