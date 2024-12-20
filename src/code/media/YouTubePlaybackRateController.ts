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
import { type Player } from '@vue-youtube/core';
import { SubEventImmediate } from './SubEventImmediate';

/** @class Implements a playback rate controller for a YouTube player instance.
 */
export default class YouTubePlaybackRateController
    implements IPlaybackRateController
{
    /** The YouTube player instance to act upon */
    _player: Player;

    /** @constructor
     * @param {Player} player - The YouTube player instance to act upon
     * @param {number} playbackRate - The playback rate. (Default: 1, representing normal speed)
     */
    constructor(
        player: Player,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        playbackRate: number = DefaultPlaybackRate,
    ) {
        this._player = player;
        this.playbackRate = playbackRate;

        player.addEventListener('onPlaybackRateChange', () => {
            this.updateRate();
        });
    }

    public destroy(): void {
        this.onPlaybackRateChanged.cancelAll();
    }

    updateRate(): void {
        this.onPlaybackRateChanged.emit(this._player.getPlaybackRate());
    }

    onPlaybackRateChanged: SubEventImmediate<number> = new SubEventImmediate();

    /** Gets the playback rate.
     */
    get playbackRate(): number {
        return this._player.getPlaybackRate();
    }
    /** Sets the playback rate.
     */
    set playbackRate(rate: number) {
        this._player.setPlaybackRate(rate);
    }
}
