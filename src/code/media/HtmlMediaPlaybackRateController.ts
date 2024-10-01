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

import { DefaultPlaybackRate } from '@/store/Track';
import type { IPlaybackRateController } from './IPlaybackRateController';
import { SubEventImmediate } from './SubEventImmediate';

/** @class Implements a playback rate controller for a {HTMLMediaElement}.
 */
export default class HtmlMediaPlaybackRateController
    implements IPlaybackRateController
{
    /** The {HTMLMediaElement} instance to act upon */
    private _media: HTMLMediaElement;

    /** @constructor
     * @param {HTMLMediaElement} media - The media element to act upon
     * @param {number} playbackRate - The playback rate. (Default: 1, representing normal speed)
     */
    constructor(
        media: HTMLMediaElement,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        playbackRate: number = DefaultPlaybackRate,
    ) {
        this._media = media;
        this._media.playbackRate = playbackRate;

        //Register event handlers first, as per https://github.com/shaka-project/shaka-player/issues/2483#issuecomment-619587797
        media.onratechange = () => {
            const rate = media.playbackRate;
            console.debug(`onratechange:rate:${rate}`);
            this.updateRate(rate);
        };
    }

    public destroy(): void {
        this.onPlaybackRateChanged.cancelAll();
    }

    updateRate(rate: number): void {
        this.onPlaybackRateChanged.emit(rate);
    }

    onPlaybackRateChanged: SubEventImmediate<number> = new SubEventImmediate();

    /** Gets the playback rate.
     */
    get playbackRate(): number {
        return this._media.playbackRate;
    }
    /** Sets the playback rate.
     */
    set playbackRate(rate: number) {
        this._media.playbackRate = rate;
    }
}
