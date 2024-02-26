import { SubEvent } from 'sub-events';

/** @interface Defines a playback rate controller.
 */
export interface IPlaybackRateController {
    /** Gets or sets the media playback rate, as a factor.
     */
    playbackRate: number;

    /** Emits a changed playback rate.
     * @param {number} rate - the changed rate
     */
    readonly onPlaybackRateChanged: SubEvent<number>;
}
