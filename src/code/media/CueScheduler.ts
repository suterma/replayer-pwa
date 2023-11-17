import { IMediaHandler } from './IMediaHandler';
import { ICueScheduler } from './ICueScheduler';
import { ICue } from '@/store/compilation-types';

/** @class Implements scheduling cues in a track.
 */
export class CueScheduler implements ICueScheduler {
    /** @constructor
     * @param {IMediaHandler} media - The media handler to act upon
     */
    constructor(media: IMediaHandler) {
        this._media = media;
    }
    /** @remarks Also removes any possible existing schedule */
    ScheduleCue(targetCue: ICue, timeout: number): Promise<void> {
        //TODO maybe use the cue end directly here, instead of the timeout,
        //with possible rescheduling, like in the looper?
        //Might be more precise
        if (targetCue == null || targetCue.Time == null) {
            return Promise.reject(
                'Cue to schedule has no time set, scheduling has been omitted.',
            );
        }

        const targetTime = targetCue.Time;
        this.RemoveSchedule();
        console.debug(
            `CueScheduler::ScheduleCue:timeout,targetTime:`,
            timeout,
            targetTime,
        );
        return new Promise((resolve, reject) => {
            this.timeoutHandle = setTimeout(() => {
                if (this.timeoutHandle) {
                    console.debug(
                        `CueScheduler::ScheduleCue:invoked:targetTime:`,
                        targetTime,
                    );

                    this._media.seekTo(targetTime);
                    resolve();
                } else {
                    reject(
                        `The current scheduling for cue '${targetCue}' was cancelled.`,
                    );
                }
            }, timeout * 1000);
        });
    }

    RemoveSchedule(): void {
        console.debug(
            `CueScheduler::RemoveSchedule:timeoutHandle:`,
            this.timeoutHandle,
        );
        if (this.timeoutHandle) {
            clearTimeout(this.timeoutHandle);
            this.timeoutHandle = null;
        }
    }

    /** A handle to the current scheduling. Will be set to null when cancelled, to indicate the cancel status. */
    private timeoutHandle: NodeJS.Timeout | null = null;

    /** The media handler to act upon */
    private _media: IMediaHandler;
}