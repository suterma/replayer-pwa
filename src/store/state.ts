import { MediaUrl, Settings } from './state-types';
import { Compilation, ICompilation } from './compilation-types';

/** Defines the state of this application */
interface IState {
    /** A compilation to work with
     */
    compilation: ICompilation;

    /** A dictionary of media URLs, representing playable media files
     * @remarks the media file path is used as key, preventing duplicate files for the same content.
     */
    mediaUrls: Map<string, MediaUrl>;

    /** The currently selected cue Id.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     * @remarks Set to null, when no cue should be considered selected.
     */
    selectedCueId: string | null;

    /** An application work message stack, used for progress indication
     * @remarks during ongoing work, the stack is non-empty
     */
    progressMessageStack: Array<string>;

    /** An application error message stack, used for error indication
     * @remarks during unacknowledged errors, the stack is non-empty
     */
    errorMessageStack: Array<string>;

    settings: Settings;
}

export const state: IState = {
    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    compilation: Compilation.empty(),

    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    selectedCueId: '',

    mediaUrls: new Map<string, MediaUrl>(),

    progressMessageStack: new Array<string>(),

    errorMessageStack: new Array<string>(),

    settings: Settings.default(),
};

export type State = typeof state;
