import { MediaFile } from './state-types';
import { Compilation, Cue, ICompilation } from './compilation-types';

/** Defines the state of this application */
interface IState {
    /** A compilation to work with
     */
    compilation: ICompilation;

    /** A dictionary of media files from a REZ compilation, representing playable buffers
     * @remarks the media file path is used as key, preventing duplicate files for the same content.
     */
    fileUrls: Map<string, MediaFile>;

    /** The currently selected cue.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     */
    selectedCue: Cue;

    /** An application work message stack, used for progress indication
     * @remarks during ongoing work, the stack is non-empty
     */
    progressMessageStack: Array<string>;

    /** Whether to never show the welcome overlay at applicaiton start
     */
    neverShowWelcomeMessageAgain: boolean;
}

export const state: IState = {
    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    compilation: new Compilation(),

    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    selectedCue: new Cue(),

    fileUrls: new Map<string, MediaFile>(),

    progressMessageStack: new Array<string>(),

    neverShowWelcomeMessageAgain: false,
};

export type State = typeof state;
