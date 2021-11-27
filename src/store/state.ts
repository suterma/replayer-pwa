import { MediaUrl } from './state-types';
import { Compilation, ICompilation } from './compilation-types';

/** Defines the state of this application */
interface IState {
    /** A compilation to work with
     */
    compilation: ICompilation;

    /** A dictionary of media files from a REZ compilation, representing playable buffers
     * @remarks the media file path is used as key, preventing duplicate files for the same content.
     */
    mediaUrls: Map<string, MediaUrl>;

    /** The currently selected cue Id.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     */
    selectedCueId: string;

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
    selectedCueId: '',

    mediaUrls: new Map<string, MediaUrl>(),

    progressMessageStack: new Array<string>(),

    neverShowWelcomeMessageAgain: false,
};

export type State = typeof state;
