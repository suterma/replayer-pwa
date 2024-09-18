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

import { DefaultPitchShift, DefaultPlaybackRate } from '@/store/Track';
import AudioFader from './AudioFader';
import type { IAudioFader } from './IAudioFader';
import type { IMediaHandler } from './IMediaHandler';
import { SubEvent } from 'sub-events';
import type { IPlaybackRateController } from './IPlaybackRateController';
import HtmlMediaPlaybackRateController from './HtmlMediaPlaybackRateController';
import chalk from 'chalk';
import { MediaLooper } from './MediaLooper';
import type { IMediaLooper } from './IMediaLooper';
import type { IPitchShiftController } from './IPitchShiftController';
import HtmlMediaPitchShiftController from './HtmlMediaPitchShiftController';
import type { ShallowRef } from 'vue';

const mediaHandlerDebug = chalk.hex('#62c462'); // Replayer success color (bulma warning)

/** @class Implements a playback handler for a {HTMLMediaElement}.
 * @remarks This handles transport/loop and volume operations for audio sources (HTML media elements).
 * See https://github.com/suterma/replayer-pwa/tree/main/doc/media-handling#readme
 * @devdoc Fading is handeled internally with it's own handler.
 */
export default class HtmlMediaHandler implements IMediaHandler {
    // --- internals ---

    private _fader: IAudioFader;
    private _looper: IMediaLooper;
    private _playbackRateController: IPlaybackRateController;
    private _pitchShiftController: IPitchShiftController;

    /** The {HTMLMediaElement} instance to act upon */
    private _media: HTMLMediaElement;

    /** @constructor
     * @param {HTMLMediaElement} media - The media element to act upon
     * @param {ShallowRef<MediaElementAudioSourceNode | AudioBufferSourceNode | null>} audioSource - A reference to the audio node, if set. Allows finer control over the media.
     * @param {number} masterVolume - The overall volume of the output. Can be used to control the output volume in addition to fadings. (Default: 1, representing 0 dBFS)
     * @param {number} playbackRate - The playback rate. (Default: 1, representing normal speed)
     * @param {string} id - The unique id
     */
    constructor(
        media: HTMLMediaElement,

        audioSource: ShallowRef<
            MediaElementAudioSourceNode | AudioBufferSourceNode | null
        >,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        masterVolume: number = 1,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        playbackRate: number = DefaultPlaybackRate,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        pitchShift: number = DefaultPitchShift,

        id = '',
    ) {
        this._media = media;
        this._id = id ? id : 'handler-' + media.id;
        this._fader = new AudioFader(media, masterVolume);
        this._playbackRateController = new HtmlMediaPlaybackRateController(
            media,
            playbackRate,
        );
        this._pitchShiftController = new HtmlMediaPitchShiftController(
            media,
            audioSource,
            pitchShift,
        );
        this._looper = new MediaLooper(this);

        //Register event handlers first, as per https://github.com/shaka-project/shaka-player/issues/2483#issuecomment-619587797
        media.onloadeddata = () => {
            this.isClickToLoadRequired = false;
            const readyState = media.readyState;
            this.debugLog(`onloadeddata:readyState:${readyState}`);
            this.handleReadyState(readyState);
        };

        media.onloadedmetadata = () => {
            const readyState = media.readyState;
            this.debugLog(`onloadedmetadata:readyState:${readyState}`);
            this.handleReadyState(readyState);
        };

        media.oncanplay = () => {
            this._canPlay = true;
            this.debugLog(`oncanplay`);
            this.onCanPlay.emit();
        };

        media.ondurationchange = () => {
            const duration = media.duration;
            this.debugLog(`ondurationchange:duration:${duration}`);
            this.updateDuration(duration);
        };

        media.onpause = () => {
            this.debugLog(`onpause`);
            this.onPausedChanged.emit(true);
            //Upon reception of this event, playback has already paused.
            //No actual fade-out is required. However, to reset the volume to the minimum, a fast fade-out is still triggered
            this._fader.fadeOut(/*immediate*/ true);
        };

        media.onseeking = () => {
            this.debugLog(`onseeking`);
            this.resetNextFadeInOmission();
            this.onSeekingChanged.emit(true);
        };

        media.onseeked = () => {
            const currentTime = this.currentTime;
            this.debugLog(`onseeked`, currentTime);
            this.onSeekingChanged.emit(false);
            this.onSeeked.emit(currentTime);
        };

        media.onplay = () => {
            this.debugLog(`onplay`);

            //Upon reception of this event, playback has already started.
            //Fade-in is required if not yet ongoing or omitted
            if (!this._fader.fading) {
                this._fader
                    .fadeIn(this._omitNextFadeIn)
                    .catch((message) => console.log(message));
            }
            this.resetNextFadeInOmission();

            this.onPausedChanged.emit(false);
            this.repeatUpdateCurrentTime();
        };

        media.ontimeupdate = () => {
            // NOTE: When playing, the repeated update is running
            if (this.paused) {
                this.singleUpdateCurrentTime();
            }
        };
        media.onended = () => this.handleEnded();
    }

    // --- configuration and update ---

    /** The uniqe id */
    _id: string;

    /** Gets the id.
     */
    get id(): string {
        return this._id;
    }

    /** Writes a debug log message message for this component */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debugLog(message: string, ...optionalParams: any[]): void {
        console.debug(
            mediaHandlerDebug(
                `HtmlMediaHandler(${this._media.src})::${message}:`,
                optionalParams,
            ),
        );
    }

    public destroy(): void {
        // self
        this.onPausedChanged.cancelAll();
        this.onSeekingChanged.cancelAll();
        this.onSeeked.cancelAll();
        this.onCurrentTimeChanged.cancelAll();
        this.onEnded.cancelAll();
        this.onCanPlay.cancelAll();
        this.onDurationChanged.cancelAll();
        this.onNextFadeInOmissionChanged.cancelAll();

        // fader
        this.fader.destroy();
    }

    /// --- updating time (repeated when playing) ---

    /** Keeper for the last emitted current time, to avoid multiple equal outputs. */
    private lastEmittedCurrentTime: number | null = null;

    /** Emits a one-shot update with the current time
     */
    private singleUpdateCurrentTime(): void {
        const currentTime = this.currentTime;
        if (currentTime !== this.lastEmittedCurrentTime) {
            //this.debugLog(`updateCurrentTime:${currentTime}`);
            this.onCurrentTimeChanged.emit(currentTime);
            this.lastEmittedCurrentTime = currentTime;
        }
    }

    /** Repeatedly emits an update with the current time
     * @remarks This is only repeated during ongoing playback.
     */
    private repeatUpdateCurrentTime(): void {
        this.singleUpdateCurrentTime();
        if (!this.paused) {
            window.requestAnimationFrame(() => this.repeatUpdateCurrentTime());
        }
    }

    // --- fading ---

    /** Gets the audio fading handler
     */
    get fader(): IAudioFader {
        return this._fader;
    }

    /** Whether to omit the fade-in operation on the next, subsequent play operation
     * @remarks This automatically gets reset at next play operation or any seek operation.
     * It can only be set when the media is not currently playing.
     */
    private _omitNextFadeIn = false;

    get omitsNextFadeIn(): boolean {
        return this._omitNextFadeIn;
    }

    /** @inheritdoc */
    omitNextFadeIn(): void {
        if (this._omitNextFadeIn == false) {
            this._omitNextFadeIn = true;
            this.debugLog(`omitNextFadeIn:ON`);
            this.onNextFadeInOmissionChanged.emit(true);
        }
    }

    private resetNextFadeInOmission() {
        if (this._omitNextFadeIn == true) {
            this._omitNextFadeIn = false;
            this.debugLog(`omitNextFadeIn:OFF`);
            this.onNextFadeInOmissionChanged.emit(false);
        }
    }

    onNextFadeInOmissionChanged: SubEvent<boolean> = new SubEvent();

    // --- looping ---

    /** Gets the audio fading handler
     */
    get looper(): IMediaLooper {
        return this._looper;
    }

    // --- transport ---

    onPausedChanged: SubEvent<boolean> = new SubEvent();
    onSeekingChanged: SubEvent<boolean> = new SubEvent();
    onSeeked: SubEvent<number> = new SubEvent();
    onCurrentTimeChanged: SubEvent<number> = new SubEvent();
    onEnded: SubEvent<void> = new SubEvent();

    /** @inheritdoc */
    public pause(): Promise<void> {
        this.debugLog(`pause`);
        if (this.paused) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this._fader
                .fadeOut()
                .catch((message) => console.log(message))
                .finally(() => {
                    this._media.pause();
                    this.onPausedChanged.emit(true);
                    resolve();
                });
        });
    }

    public stop(): void {
        this.debugLog(`pause`);
        this._media.pause();
        this._fader.cancel();
        this._fader.reset();
    }

    get canPlay(): boolean {
        return this._canPlay;
    }

    /** Whether the media data has loaded enough to start playback.
     */
    _canPlay = false;

    /** Gets the paused state.
     * @remarks During fading, the playback state is not considered as paused.
     */
    get paused(): boolean {
        return this._media.paused;
    }

    get duration(): number {
        return this._media.duration;
    }

    /** Handles the track end event of the audio element, by providing it further as event.
     */
    private handleEnded(): void {
        this.debugLog(`handleEnded`);
        this.onEnded.emit();
    }

    get currentTime(): number {
        return this._media.currentTime;
    }

    /**
     * @inheritDoc
     */
    public seekTo(seconds: number, waitOnCanPlay = false): Promise<void> {
        this.debugLog(`seekTo`, seconds);
        if (
            this.hasLoadedMetadata &&
            this.currentTime !== seconds &&
            Number.isFinite(seconds)
        ) {
            return new Promise((resolve) => {
                this._media.addEventListener(
                    waitOnCanPlay ? 'canplay' : 'seeked',
                    function () {
                        resolve();
                    },
                    { once: true },
                );
                this._media.currentTime = seconds;
            });
        }
        return Promise.resolve();
    }

    /** Seeks forward or backward, for the given amount of seconds, if the media is loaded and the position is valid.
     * @param {number} seconds - amount of time, in [seconds], to seek
     * @returns {Promise<void>} Promise - resolves when the seek operation has finished
     */
    public seek(seconds: number): Promise<void> {
        this.debugLog(`seek`);
        return this.seekTo(this.currentTime + seconds);
    }

    /** @inheritdoc */
    public playFrom(position: number, omitNextFadeIn: boolean = false): void {
        this.debugLog(`playFrom:${position};omitNextFadeIn:${omitNextFadeIn}`);
        this.seekTo(position).then(() => {
            if (omitNextFadeIn) {
                this.omitNextFadeIn();
            } else {
                this.resetNextFadeInOmission();
            }
            this.play();
        });
    }

    public play(): void {
        this.debugLog(`play`);
        this._media.play();
    }

    public togglePlayback(): void {
        this.debugLog(`togglePlayback`);
        if (this.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    public pauseAndSeekTo(
        position: number,
        omitNextFadeIn: boolean = false,
    ): void {
        this.debugLog(
            `pauseAndSeekTo:${position};omitNextFadeIn:${omitNextFadeIn}`,
        );
        this._fader.fadeOut().finally(() => {
            this.pause();
            this.seekTo(position).then(() => {
                if (omitNextFadeIn) {
                    this.omitNextFadeIn();
                }
            });
        });
    }

    // --- media loading ---

    /** Gets the media source URL.
     */
    get mediaSourceUrl(): string {
        return this._media.src;
    }
    /** Sets the media source URL.
     */
    set mediaSourceUrl(url: string) {
        //Only update the media element, when a source is actually available
        //Otherwise the element throws an avoidable error
        if (url) {
            //NOTE: Just changing the .src property does not work when the track is currently playing
            //(observed on Ubuntu Google Chrome)
            //An error is only thrown only after the playback ends.
            //Thus, additional handling is necessary
            const isCurrentlyPlaying = !this.paused;
            const lastPosition = this.currentTime;
            this.pause();

            //Switch the source now, after pause
            this._media.src = url;

            //NOTE: This method assumes, that the new media for this is of (roughly) the same
            //length, just replacing the voice/instrument in the piece.
            //Thus, the playback position is maintained and not reset,
            //and the playing state is set again after the switch.
            //Otherwise the user will need to restart playback from
            //new position anyway
            this._media.currentTime = lastPosition;
            if (isCurrentlyPlaying) {
                this.play();
            }
        }
    }

    /** Emitted when the media data has loaded (at least enough to start playback)
     * @devdoc This is emitted separately from the data loading state and events, since the underlying
     * implementation does handle it separately.
     */
    onCanPlay: SubEvent<void> = new SubEvent();

    /** Whether the media data has loaded (at least enough to start playback)
     * @remarks This implies that metadata also has been loaded already
     * @devdoc see HAVE_CURRENT_DATA at https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState#examples
     */
    hasLoadedData = false;

    /** Whether the media metadata has loaded. Duration is available now.
     * @devdoc see HAVE_METADATA at https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/readyState#examples
     */
    hasLoadedMetadata = false;

    /** Flags, whether deferred loading (until a user play click event is handled)
     * is required to further load the track media file data. The flag may be set once after the metadata was successfully loaded.
     * @remarks When true, handling of a subsequent play action must first invoke a user-triggered load operation.
     * This specific handling is currently required on (some?) iOS devices,
     * because they only load data upon explicit user interaction.
     */
    isClickToLoadRequired = false;

    /** Emits the durationChanged event
     * @param {number} duration - could be NaN or infinity, depending on the source
     */
    private updateDuration(duration: number): void {
        this.debugLog('updateDuration:duration', duration);
        this.onDurationChanged.emit(duration);
    }

    /** Handles the current ready state of the {HTMLMediaElement}'s media, with regard to playability
     * @remarks Decides, whether deferred loading is required.
     */
    private handleReadyState(readyState: number): void {
        //Enough of the media resource has been retrieved that the metadata attributes are initialized?
        if (readyState >= HTMLMediaElement.HAVE_METADATA) {
            if (!this.hasLoadedMetadata && !this.hasLoadedData) {
                this.hasLoadedMetadata = true;
                this.hasLoadedData = true;
                this.updateDuration(this._media.duration);
            }
        }

        this.debugLog(
            `handleReadyState:readyState;${readyState};buffered:${this._media.buffered};buffered.length:${this._media.buffered.length};networkState:${this._media.networkState}`,
        );

        // When having metadata, while network is idle, but nothing is buffered at this moment,
        // we can assume that the phone is not currently trying to load further data,
        // most probably due to load restriction on an iOS device using Safari.
        // This is condition applies to
        // - iPhone 13/Safari
        // - iPad Pro 12.9 2021/Safari (with audio from URL)
        // NOTE: This solution however seems not to work on:
        // - iPad 9th/Safari, because the buffered length is 1, but the sound will only play on 2nd click.
        if (
            readyState === HTMLMediaElement.HAVE_METADATA &&
            this._media.networkState === HTMLMediaElement.NETWORK_IDLE &&
            this._media.buffered.length === 0
        ) {
            this.isClickToLoadRequired = true;
            console.warn(
                'User gesture required (iOS-Condition) for further loading...',
            );
            // In this specific case, prematurely emit the onCanPlay event,
            // to initiate enabling of the play and cue buttons.
            // Clicking any of these buttons while the isClickToLoadRequired flag is set,
            // should then issue a user-triggered play command.
            // Finally, this will then further load and play the track media
            this.onCanPlay.emit();
        }
    }

    onDurationChanged: SubEvent<number> = new SubEvent();

    // --- track looping ---

    get loop(): boolean {
        return this._media.loop;
    }
    set loop(value: boolean) {
        this._media.loop = value;
    }

    // --- rate changing ---

    /** Gets the playback rate controller
     */
    get playbackRateController(): IPlaybackRateController {
        return this._playbackRateController;
    }

    // --- pitch shift ---

    /** Gets the pitch shift controller
     */
    get pitchShiftController(): IPitchShiftController {
        return this._pitchShiftController;
    }
}
