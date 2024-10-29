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
import type { PlayerStateChangeCallback, Player } from '@vue-youtube/shared';
import YouTubeFader from './YouTubeFader';
import { PlayerState } from '@vue-youtube/core';
import type { IPlaybackRateController } from './IPlaybackRateController';
import YouTubePlaybackRateController from './YouTubePlaybackRateController';
import { DefaultPlaybackRate, DefaultTrackVolume } from '@/store/Track';
import { nextTick } from 'vue';
import type { IMediaLooper } from './IMediaLooper';
import { MediaLooper } from './MediaLooper';
import YouTubePitchShiftController from './YouTubePitchShiftController';
import type { IPitchShiftController } from './IPitchShiftController';
import Constants from './Constants';
import { PlaybackState } from './PlaybackState';
import { SubEventImmediate } from './SubEventImmediate';
import useLog from '@/composables/LogComposable';
const { log } = useLog();

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
    private _pitchShiftController: IPitchShiftController;

    /** The YouTube player instance to act upon */
    private _player: Player;
    private _videoUrl: string;

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
        this._videoUrl = player.getVideoUrl();
        this._id =
            Constants.HANDLER_ID_PREFIX + (id ? id : player.getVideoUrl());

        this._fader = new YouTubeFader(player, DefaultTrackVolume);
        this._playbackRateController = new YouTubePlaybackRateController(
            player,
            DefaultPlaybackRate,
        );
        this._pitchShiftController = new YouTubePitchShiftController();
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
        log.debug(
            `YouTubeMediaHandler(${this._videoUrl})::${message}:`,
            optionalParams,
        );
    }

    public destroy(): void {
        // self
        this.onPlaybackStateChanged.cancelAll();
        this.onSeekingChanged.cancelAll();
        this.onSeeked.cancelAll();
        this.onCurrentTimeChanged.cancelAll();
        this.onEnded.cancelAll();
        this.onNextFadeInOmissionChanged.cancelAll();

        // fader
        this.fader.destroy();
        this.debugLog('destroyed');
    }

    /// --- updating time (repeated when playing) ---

    /** Keeper for the last emitted current time, to avoid multiple equal outputs. */
    private lastEmittedCurrentTime: number | null = null;

    /** Internally retrieves the current time, and issues an update, if changed.
     * @returns The internally retrieved current time
     */
    updateCurrentTime(): number {
        const currentTime = this.currentTime;
        if (currentTime !== this.lastEmittedCurrentTime) {
            //this.debugLog(`updateCurrentTime:${currentTime}`);
            this.onCurrentTimeChanged.emit(currentTime);
            this.lastEmittedCurrentTime = currentTime;
        }
        if (this._player.getPlayerState() == PlayerState.PLAYING) {
            window.requestAnimationFrame(() => this.updateCurrentTime());
        }
        return currentTime;
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

    onNextFadeInOmissionChanged: SubEventImmediate<boolean> =
        new SubEventImmediate();

    // --- looping ---

    /** Gets the audio fading handler
     */
    get looper(): IMediaLooper {
        return this._looper;
    }

    // --- transport ---

    /** @remarks With the YouTube player, buffering counts as playing, as it's expected to occurr only during actual playback. */
    onPlaybackStateChanged: SubEventImmediate<PlaybackState> =
        new SubEventImmediate();

    /** @remarks Seek events are not supported by the YouTube player. However, this event is emitted on explicit seek operations through this API. */
    onSeekingChanged: SubEventImmediate<boolean> = new SubEventImmediate();

    /** @remarks Seek events are not supported by the YouTube player. However, this event is emitted on explicit seek operations through this API. */
    onSeeked: SubEventImmediate<number> = new SubEventImmediate();

    onCurrentTimeChanged: SubEventImmediate<number> = new SubEventImmediate();

    onEnded: SubEventImmediate<void> = new SubEventImmediate();

    /** @inheritdoc */
    public pause(): Promise<void> {
        this.debugLog(`pause`);
        if (this.paused) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            this._fader
                .fadeOut()
                .catch((message) => log.info(message))
                .finally(() => {
                    // NOTE: This currently throws an error, when the handler
                    // gets destroyed during an ongoing fade operation.
                    // It's currently not addressed as it's not disturbing for the user.
                    this._player.pauseVideo();
                    this.onPlaybackStateChanged.emit(this.playbackState);
                    resolve();
                });
        });
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

    /** Gets the playback state.
     * @remarks During fading, the playback state is not considered as paused.
     */
    get playbackState(): PlaybackState {
        if (!this.mediaSourceUrl) {
            return PlaybackState.Unavailable;
        }
        if (!this.canPlay) {
            return PlaybackState.Unloaded; //but is available
        }
        if (this.paused) {
            return PlaybackState.Ready; // available/can play, but not playing
        }
        return PlaybackState.Playing; // because it's available and not paused, it must be playing
    }

    get duration(): number {
        return this._player.getDuration();
    }

    get currentTime(): number {
        return this._player.getCurrentTime();
    }

    /**
     * @inheritDoc
     * @param {boolean} _waitOnCanPlay - optional, not handled, as the YouTube
     * player does not support seek progress events.
     * @returns {Promise<void>} Promise - always resolved, immediately, or after 300ms,
     * as the YouTube player does not support seek progress events.
     */
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    public seekTo(seconds: number, _waitOnCanPlay = false): Promise<void> {
        this.debugLog(`seekTo`, seconds);
        this.resetNextFadeInOmission();
        if (
            this.hasLoadedMetadata &&
            this.currentTime !== seconds &&
            Number.isFinite(seconds)
        ) {
            return new Promise((resolve) => {
                this._player.seekTo(seconds, true);
                // Handle the seek end at some time after on our own,
                // because there is no seek progress support in YouTube player
                this.onSeekingChanged.emit(true);
                setTimeout(() => {
                    const currentTime = this.updateCurrentTime();
                    this.debugLog(`seeked-to`, currentTime);
                    this.onSeekingChanged.emit(false);
                    this.onSeeked.emit(currentTime);
                    resolve();
                }, 300);
            });
        }
        return Promise.resolve();
    }

    /** Seeks forward or backward, for the given amount of seconds, if the media is loaded and the position is valid.
     * @param {number} seconds - amount of time, in [seconds], to seek
     * @returns {Promise<void>} Promise - always resolved, immediately, or after 300ms,
     * as the YouTube player does not support seek progress events.
     */
    seek(seconds: number): Promise<void> {
        return this.seekTo(this.currentTime + seconds);
    }

    /** @inheritdoc */
    playFrom(position: number, omitNextFadeIn: boolean = false): void {
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

    /** Flag, whether the player is currently playing
     * @remarks When the player was playing, any buffering event still is
     * considered as playing.
     * @devdoc The current time is only updated, when a meaningful position
     * is available.
     */
    private _isPlaying = false;

    handleStateChange(state: PlayerState): void {
        log.debug(
            `YouTubeMediaHandler(${this._id})::onStateChange:${PlayerState[state]}`,
        );

        switch (state) {
            case PlayerState.UNSTARTED:
                this._isPlaying = false;
                this.onPlaybackStateChanged.emit(this.playbackState);
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
                    if (!this._fader.fading) {
                        this._fader
                            .fadeIn(this._omitNextFadeIn)
                            .catch((message) => log.info(message));
                    }
                    this.resetNextFadeInOmission();

                    this.onPlaybackStateChanged.emit(this.playbackState);
                }
                break;
            case PlayerState.PAUSED:
                this.updateCurrentTime();
                this._isPlaying = false;
                this.onPlaybackStateChanged.emit(this.playbackState);
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
                this.onPlaybackStateChanged.emit(this.playbackState);
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

    /** Emits the durationChanged event
     * @param {number} duration - could be NaN or infinity, depending on the source
     */
    updateDuration(duration: number): void {
        log.debug('TrackYoutubeElement::updateDuration:duration', duration);
        this.onDurationChanged.emit(duration);
    }

    onDurationChanged: SubEventImmediate<number> = new SubEventImmediate();

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

    // --- pitch shift ---

    /** Gets the pitch shift controller
     */
    get pitchShiftController(): IPitchShiftController {
        return this._pitchShiftController;
    }
}
