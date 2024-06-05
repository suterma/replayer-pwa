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

import type { IAudioFader } from './IAudioFader';
import type { IMediaHandler } from './IMediaHandler';
import { SubEvent } from 'sub-events';
import type { PlayerStateChangeCallback, Player } from '@vue-youtube/shared';
import YouTubeFader from './YouTubeFader';
import { PlayerState } from '@vue-youtube/core';
import type { IPlaybackRateController } from './IPlaybackRateController';
import YouTubePlaybackRateController from './YouTubePlaybackRateController';
import { DefaultPlaybackRate, DefaultTrackVolume } from '@/store/Track';
import { nextTick } from 'vue';
import chalk from 'chalk';
import type { IMediaLooper } from './IMediaLooper';
import { MediaLooper } from './MediaLooper';

const mediaHandlerDebug = chalk.hex('#62c462'); // Replayer success color (bulma warning)

/** @class Implements a playback handler for a YouTube IFrame player with VueYoutube.
 * @remarks This handles transport/loop and volume operations for the audio.
 * See https://github.com/suterma/replayer-pwa/tree/main/doc/media-handling#readme
 * @devdoc Fading is handeled internally with it's own handler.
 */
export default class YouTubeMediaHandler implements IMediaHandler {
    // --- internals ---

    private _fader: IAudioFader;
    private _looper: IMediaLooper;
    private _playbackRateController: IPlaybackRateController;

    /** The YouTube player instance to act upon */
    private _player: Player;

    /** @constructor
     * @param {Player} player - The YouTube player instance to act upon
     * @param {string} id - The unique id for this handler
     */
    constructor(
        onStateChange: (...cb: PlayerStateChangeCallback[]) => void,
        player: Player,
        id: string,
    ) {
        this._player = player;
        this._id = 'youtube-media-handler-' + (id ? id : player.getVideoUrl());
        this._fader = new YouTubeFader(player, DefaultTrackVolume);
        this._playbackRateController = new YouTubePlaybackRateController(
            player,
            DefaultPlaybackRate,
        );
        this._looper = new MediaLooper(this);

        onStateChange((event) => {
            this.handleStateChange(event.data);
        });

        // report initial state once (after these events were subscribed to by the outside code)
        nextTick(() => {
            this.handleStateChange(player.getPlayerState());

            // The duration is available already, because the player is ready, when this constructor is called
            this.updateDuration(player.getDuration());
            this.updateCurrentTime();
            this.onCanPlay.emit();
        });
        this.debugLog('created');
    }

    // --- configuration and update ---

    /** The uniqe id for this handler */
    _id: string;

    get id(): string {
        return this._id;
    }

    /** Writes a debug log message message for this component */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    debugLog(message: string, ...optionalParams: any[]): void {
        console.debug(
            mediaHandlerDebug(
                `YouTubeMediaHandler(${this._id})::${message}:`,
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
        this.onNextFadingOmissionChanged.cancelAll();

        // fader
        this.fader.destroy();
        this.debugLog('destroyed');
    }

    /// --- updating time (repeated when playing) ---

    /** Keeper for the last emitted current time, to avoid multiple equal outputs. */
    private lastEmittedCurrentTime: number | null = null;
    updateCurrentTime(): void {
        const currentTime = this.currentTime;
        if (currentTime !== this.lastEmittedCurrentTime) {
            //this.debugLog(`updateCurrentTime:${currentTime}`);
            this.onCurrentTimeChanged.emit(currentTime);
            this.lastEmittedCurrentTime = currentTime;
        }
        if (this._player.getPlayerState() == PlayerState.PLAYING) {
            window.requestAnimationFrame(() => this.updateCurrentTime());
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
    private _omitNextFadeIn: boolean = false;

    /** Flags to omit the fade-in operation on the next, subsequent play operation
     * @remarks The flag automatically gets reset after next play operation or at any seek operation.
     * It can only be set when the media is not currently playing.
     */
    omitNextFadeIn(): void {
        if (this.paused && this._omitNextFadeIn == false) {
            this._omitNextFadeIn = true;
            this.onNextFadingOmissionChanged.emit(true);
        }
    }

    private resetNextFadeInOmission() {
        if (this._omitNextFadeIn == true) {
            this._omitNextFadeIn = false;
            this.onNextFadingOmissionChanged.emit(false);
        }
    }

    onNextFadingOmissionChanged: SubEvent<boolean> = new SubEvent();

    // --- looping ---

    /** Gets the audio fading handler
     */
    get looper(): IMediaLooper {
        return this._looper;
    }

    // --- transport ---

    /** @remarks With the YouTube player, buffering counts as playing, as it's expected to occurr only during actual playback. */
    onPausedChanged: SubEvent<boolean> = new SubEvent();
    /** @remarks Seek events are not supported by the YouTube player. However, this event is emitted on explicit seek operations through this API. */
    onSeekingChanged: SubEvent<boolean> = new SubEvent();
    /** @remarks Seek events are not supported by the YouTube player. However, this event is emitted on explicit seek operations through this API. */
    onSeeked: SubEvent<number> = new SubEvent();
    onCurrentTimeChanged: SubEvent<number> = new SubEvent();
    onEnded: SubEvent<void> = new SubEvent();

    /** Pauses playback, with fading if configured. */
    pause(): void {
        this.debugLog(`pause`);
        if (!this.paused) {
            this._fader
                .fadeOut()
                .catch((message) => console.log(message))
                .finally(() => {
                    // NOTE: This currently throws an error, when the handler
                    // gets destroyed during an ongoing fade operation.
                    // It's currently not addressed as it's not disturbing for the user.
                    this._player.pauseVideo();
                    this.onPausedChanged.emit(true);
                });
        }
    }

    stop(): void {
        this._player.pauseVideo(); //NOTE: stopVideo is discouraged by the API docs
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
     * @remarks Paused is anything except playing or buffering.
     * During fading, the playback state is not considered as paused.
     */
    get paused(): boolean {
        return !this._isPlaying;
    }

    get duration(): number {
        return this._player.getDuration();
    }

    get currentTime(): number {
        return this._player.getCurrentTime();
    }

    /**
     * @inheritDoc
     * @param {boolean} _waitOnCanPlay - optional, not handled, as the YouTube player does not support seek events.
     * @returns {Promise<void>} Promise - always resolved, immediately, or after 300ms, as the YouTube player does not support seek events.
     */
    seekTo(seconds: number, _waitOnCanPlay = false): Promise<void> {
        if (!this.hasLoadedMetadata) return Promise.resolve();
        if (this.currentTime === seconds) {
            return Promise.resolve();
        }
        if (Number.isFinite(seconds)) {
            console.debug(
                `YouTubeMediaHandler(${this._id})::seekTo:seconds:${seconds}:`,
            );

            this.onSeekingChanged.emit(true);
            this._player.seekTo(seconds, true);
            this.onSeekingChanged.emit(false);
            this.onSeeked.emit(seconds);
            return new Promise((resolve) => setTimeout(resolve, 300));
        } else {
            return Promise.resolve();
        }
    }

    /** Seeks forward or backward, for the given amount of seconds, if the media is loaded and the position is valid.
     * @param {number} seconds - amount of time, in [seconds], to seek
     * @returns {Promise<void>} Promise - always resolved immediately, or after 300ms, as the YouTube player does not support seek events.
     */
    seek(seconds: number): Promise<void> {
        return this.seekTo(this.currentTime + seconds);
    }

    playFrom(position: number, omitNextFadeIn: boolean = false): void {
        this.seekTo(position);
        if (omitNextFadeIn) {
            this.omitNextFadeIn();
        }
        this.play();
    }

    play(): void {
        this._player.playVideo();
    }

    togglePlayback(): void {
        if (this.paused) {
            this.play();
        } else {
            this.pause();
        }
    }

    pauseAndSeekTo(position: number): void {
        this._fader.fadeOut().finally(() => {
            this.pause();
            this.seekTo(position);
        });
    }

    // --- media loading ---

    /** Flag, whether the player is currently playing
     * @remarks When the player was playing, any buffering event still is
     * considered as playing.
     * @devdoc The current time is only updated, when a meaningful position
     * is available.
     */
    private _isPlaying = false;

    handleStateChange(state: PlayerState): void {
        console.debug(
            `YouTubeMediaHandler(${this._id})::onStateChange:${PlayerState[state]}`,
        );

        switch (state) {
            case PlayerState.UNSTARTED:
                this._isPlaying = false;
                this.onPausedChanged.emit(true);
                break;
            case PlayerState.ENDED:
                /* occurs when the video has ended */
                this.updateCurrentTime();
                this._isPlaying = false;
                this.onEnded.emit();
                break;
            case PlayerState.PLAYING:
                this.updateCurrentTime();
                if (!this._isPlaying) {
                    this._isPlaying = true;

                    //Upon reception of this event, playback has already started.
                    //Fade-in is required if not yet ongoing or omitted
                    if (!this._fader.fading && !this._omitNextFadeIn) {
                        this._fader
                            .fadeIn()
                            .catch((message) => console.log(message));
                    }
                    this.resetNextFadeInOmission();

                    this.onPausedChanged.emit(false);
                }
                break;
            case PlayerState.PAUSED:
                this.updateCurrentTime();
                this._isPlaying = false;
                this.onPausedChanged.emit(true);
                //Upon reception of this event, playback has already paused.
                //No actual fade-out is required. However, to reset the volume to the minimum, a fast fade-out is still triggered
                this._fader.fadeOut(/*immediate*/ true);
                break;
            case PlayerState.BUFFERING:
                // NOTE: Buffering does not affect the reported playback state
                break;
            case PlayerState.VIDEO_CUED:
                this.updateCurrentTime();
                this._isPlaying = false;
                this._canPlay = true;
                this.onPausedChanged.emit(true);
                this.onCanPlay.emit();
                break;

            default:
                throw new Error(`State ${state} is not supported.`);
        }
    }

    /** @devdoc Metadata already has loaded when this handler is created
     */
    hasLoadedMetadata = true;

    /** Gets the media source URL.
     */
    get mediaSourceUrl(): string {
        return this._player.getVideoUrl();
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
            this._player.loadVideoByUrl(url);

            //NOTE: This method assumes, that the new media for this is of (roughly) the same
            //length, just replacing the voice/instrument in the piece.
            //Thus, the playback position is maintained and not reset,
            //and the playing state is set again after the switch.
            //Otherwise the user will need to restart playback from
            //new position anyway
            this._player.seekTo(lastPosition, true);
            if (isCurrentlyPlaying) {
                this.play();
            }
        }
    }

    /** Emitted when the media data has loaded (at least enough to start playback)
     */
    onCanPlay: SubEvent<void> = new SubEvent();

    /** Emits the durationChanged event
     * @param {number} duration - could be NaN or infinity, depending on the source
     */
    updateDuration(duration: number): void {
        console.debug('TrackYoutubeElement::updateDuration:duration', duration);
        this.onDurationChanged.emit(duration);
    }

    onDurationChanged: SubEvent<number> = new SubEvent();

    // --- track looping ---

    /** Whether the player does loop
     */
    _isLooping = false;

    get loop(): boolean {
        return this._isLooping;
    }
    set loop(value: boolean) {
        this._isLooping = value;
        // NOTE: This handler maintains a playlist of one, so looping executes always on it's own track
        this._player.setLoop(value);
    }

    // --- rate changing ---

    /** Gets the playback rate controller
     */
    get playbackRateController(): IPlaybackRateController {
        return this._playbackRateController;
    }
}
