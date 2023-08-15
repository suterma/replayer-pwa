import { IAudioFader } from './IAudioFader';
import { IMediaHandler } from './IMediaHandler';
import { SubEvent } from 'sub-events';
import type {
    // PlaybackQualityChangeCallback,
    // PlaybackRateChangeCallback,
    PlayerStateChangeCallback,
    // APIChangeCallback,
    // MaybeElementRef,
    // ErrorCallback,
    // ReadyCallback,
    // PlayerVars,
    // MaybeRef,
    Player,
} from '@vue-youtube/shared';
import YouTubeFader from './YouTubeFader';
import { PlayerState } from '@vue-youtube/core';

/** @class Implements a playback handler for a YouTube IFrame player with VueYoutube.
 * @remarks This handles transport/loop and volume operations for the audio.
 * See https://github.com/suterma/replayer-pwa/tree/main/doc/media-handling#readme
 * @devdoc Fading is handeled internally with it's own handler.
 */
export default class YouTubeMediaHandler implements IMediaHandler {
    // --- internals ---

    private _fader: IAudioFader;

    /** The YouTube player instance to act upon */
    private _player: Player;

    /** @constructor
     * @param {Player} player - The YouTube player instance to act upon
     * @param {number} masterVolume - The overall volume of the output. Can be used to control the output volume in addition to fadings. (Default: 1, representing full scale)
     * @param {string} id - The unique id
     */
    constructor(
        onStateChange: (...cb: PlayerStateChangeCallback[]) => void,
        player: Player,
        // eslint-disable-next-line @typescript-eslint/no-inferrable-types
        masterVolume: number = 1,

        id = '',
    ) {
        this._player = player;
        this._id = id ? id : 'handler-' + player.getVideoUrl();
        this._fader = new YouTubeFader(player, masterVolume);

        // Watch the player state with one-time initial reporting
        onStateChange((event) => {
            this.handleStateChange(event.data);
        });
        this.handleStateChange(player.getPlayerState());

        // The duration is available already, because the player is ready, when this constructor is called
        this.updateDuration(player.getDuration());
        this.onCanPlay.emit();

        // player.onloadeddata = () => {
        //     this.isClickToLoadRequired = false;
        //     const readyState = player.readyState;
        //     this.debugLog(`onloadeddata:readyState:${readyState}`);
        //     this.handleReadyState(readyState);
        // };

        // player.onloadedmetadata = () => {
        //     const readyState = player.readyState;
        //     this.debugLog(`onloadedmetadata:readyState:${readyState}`);
        //     this.handleReadyState(readyState);
        // };

        // player.oncanplay = () => {
        //     this.debugLog(`oncanplay`);
        //     this.onCanPlay.emit();
        // };

        // player.ondurationchange = () => {
        //     const duration = player.duration;
        //     this.debugLog(`ondurationchange:duration:${duration}`);
        //     this.updateDuration(duration);
        // };

        // player.onpause = () => {
        //     this.debugLog(`onpause`);
        //     this.onPausedChanged.emit(true);
        //     //Upon reception of this event, playback has already paused.
        //     //No actual fade-out is required. However, to reset the volume to the minimum, a fast fade-out is still triggered
        //     this._fader.fadeOut(/*immediate*/ true);
        // };

        // player.onseeking = () => {
        //     this.debugLog(`onseeking`);
        //     this.onSeekingChanged.emit(true);
        // };

        // player.onseeked = () => {
        //     this.debugLog(`onseeked`);
        //     this.onSeekingChanged.emit(false);
        //     this.onSeeked.emit(this.currentTime);
        // };

        // player.onplay = () => {
        //     this.debugLog(`onplay`);

        //     //Upon reception of this event, playback has already started. Fade-in is required if not yet ongoing.
        //     if (!this._fader.fading) {
        //         this._fader.fadeIn().catch((message) => console.log(message));
        //     }

        //     this.onPausedChanged.emit(false);
        // };

        // player.ontimeupdate = () => this.handleTimeUpdate();
        // player.onended = () => this.handleEnded();
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
            `YouTubeMediaHandler(${this._id})::${message}:`,
            optionalParams,
        );
    }

    /// --- updating time (repeated when playing) ---

    updateCurrentTime() {
        const currentTime = this._player.getCurrentTime();
        console.debug(
            'YouTubeMediaHandler::updateCurrentTime:currentTime: ',
            currentTime,
        );

        this.onCurrentTimeChanged.emit(currentTime);
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

    // --- transport ---

    onPausedChanged: SubEvent<boolean> = new SubEvent();
    onSeekingChanged: SubEvent<boolean> = new SubEvent();
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
                    this._player.pauseVideo();
                    this.onPausedChanged.emit(true);
                });
        }
    }

    stop(): void {
        this._player.pauseVideo();
        this._fader.cancel();
        this._fader.reset();
    }

    /** Gets the paused state.
     * @remarks During fading, the playback state is not considered as paused.
     */
    get paused(): boolean {
        return this._player.getPlayerState() == PlayerState.PAUSED;
    }

    get duration(): number {
        return this._player.getDuration();
    }

    /** Handles the time update event of the audio element
     */
    // private handleTimeUpdate(/*event: Event*/): void {
    //     this.onCurrentTimeChanged.emit(this.currentTime);
    // }
    /** Handles the track end event of the audio element, by providing it further as event.
     */
    handleEnded(): void {
        this.onEnded.emit();
    }

    get currentTime(): number {
        return this._player.getCurrentTime();
    }

    seekTo(seconds: number): void {
        if (!this.hasLoadedMetadata) return;
        if (this.currentTime === seconds) {
            return;
        }
        if (Number.isFinite(seconds)) {
            this._player.seekTo(seconds, true);
        }
    }

    seek(seconds: number): void {
        this.seekTo(this.currentTime + seconds);
    }

    playFrom(position: number): void {
        this.seekTo(position);
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

    handleStateChange(state: PlayerState) {
        this.updateCurrentTime();

        if (state == PlayerState.UNSTARTED) {
            console.debug('YouTubeMediaHandler::onStateChange:UNSTARTED');
        }
        if (state == PlayerState.ENDED) {
            /* occurs when the video has ended */
            console.debug('YouTubeMediaHandler::onStateChange:ENDED');
        }
        if (state == PlayerState.PLAYING) {
            console.debug('YouTubeMediaHandler::onStateChange:PLAYING');
        }
        if (state == PlayerState.PAUSED) {
            console.debug('YouTubeMediaHandler::onStateChange:PAUSED');
        }
        if (state == PlayerState.BUFFERING) {
            console.debug('YouTubeMediaHandler::onStateChange:BUFFERING');
        }
        if (state == PlayerState.VIDEO_CUED) {
            console.debug('YouTubeMediaHandler::onStateChange:VIDEO_CUED');
        }
    }

    /** Click to load is never required with the YouTube IFrame player.
     */
    isClickToLoadRequired = false;

    /** @devdoc Metadata already has loaded when this handler is created
     */
    hasLoadedMetadata = false;

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

    /** The duration of the track
     * @remarks Is only available after the video has been initially loaded
     */
    _durationSeconds: number | null = null;

    /** If changed, updates the internal duration and emits the durationChanged event
     * @param {number} duration - could be NaN or infinity, depending on the source
     */
    updateDuration(duration: number): void {
        console.debug('TrackYoutubeElement::updateDuration:duration', duration);

        if (this._durationSeconds !== duration) {
            this._durationSeconds = duration;
            this.onDurationChanged.emit(duration);
        }
    }

    /** Gets the duration of the track
     * @remarks Is only available after loading of the track's media source
     */
    get durationSeconds(): number | null {
        return this._durationSeconds;
    }

    //TODO Apply the currently known position to the player. It could be non-zero already.

    onDurationChanged: SubEvent<number> = new SubEvent();

    // --- track looping ---

    get loop(): boolean {
        return false; //TODO this._player.loop;
    }
    set loop(value: boolean) {
        this._player.setLoop(value);
    }
}
