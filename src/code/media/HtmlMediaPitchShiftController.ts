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

import { DefaultPitchShift } from '@/store/Track';
import { SubEvent } from 'sub-events';
import type { IPitchShiftController } from './IPitchShiftController';
import type { ShallowRef } from 'vue';

/** @class Implements a pitch shift controller for a {HTMLMediaElement}.
 * @devdoc //NOTE This is currently only a skeleton without functionality
 */
export default class HtmlMediaPitchShiftController
    implements IPitchShiftController
{
    /** The {HTMLMediaElement} instance to act upon */
    private _media: HTMLMediaElement;
    private _audioSource: ShallowRef<
        MediaElementAudioSourceNode | AudioBufferSourceNode | null
    >;

    /** @constructor
     * @param {HTMLMediaElement} media - The media element to act upon
     * @param {ShallowRef<MediaElementAudioSourceNode | AudioBufferSourceNode | null>} audioSource - A reference to the audio node, if set. Allows finer control over the media.
     * @param {number} pitchShift - The pitch shift. (Default: 0, representing no shift)
     */
    constructor(
        media: HTMLMediaElement,

        audioSource: ShallowRef<
            MediaElementAudioSourceNode | AudioBufferSourceNode | null
        >,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        pitchShift: number = DefaultPitchShift,
    ) {
        this._media = media;
        this._audioSource = audioSource;

        // if (audioSource.value instanceof AudioBufferSourceNode) {
        //     //TODO Maybes we should solve detune. with the new audiobuffersource node completely in this controller
        //     const buffer = (audioSource.value as AudioBufferSourceNode).buffer;
        //     audioSource.value  = new AudioBufferSourceNode()
        // }

        // //Register event handlers first, as per https://github.com/shaka-project/shaka-player/issues/2483#issuecomment-619587797
        // media.onshiftchange = () => {
        //     const shift = 0; //TODOmedia.playbackRate;
        //     console.debug(`onshiftchange:shift:${shift}`);
        //     this.updateShift(shift);
        // };
    }

    public destroy(): void {
        this.onPitchShiftChanged.cancelAll();
    }

    updateShift(shift: number): void {
        this.onPitchShiftChanged.emit(shift);
    }

    onPitchShiftChanged: SubEvent<number> = new SubEvent();

    /** Gets the pitch shift.
     */
    get pitchShift(): number {
        return 0; //TODO this._media.playbackRate;
    }
    /** Sets the pitch shift.
     */
    set pitchShift(shift: number) {
        //TODO this._media.playbackRate = rate;
    }
}
