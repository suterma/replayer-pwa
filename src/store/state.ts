import { MediaFile } from './state-types';
import { Compilation, Cue, ICompilation } from './compilation-types';

/** Defines the state of this application */
interface IState {
    /** A compilation to work with
     */
    compilation: ICompilation;

    /** A set of media files from a REZ compilation, representing playable buffers */
    fileUrls: Array<MediaFile>;

    /** The currently selected cue.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     */
    selectedCue: Cue;

    /** An application work message stack, used for progress indication
     * @remarks during ongoing work, the stack is non-empty
     */
    progressMessageStack: Array<string>;
}

export const state: IState = {
    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    compilation: new Compilation(),

    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    selectedCue: new Cue(),

    fileUrls: new Array<MediaFile>(),

    progressMessageStack: new Array<string>(),
};

export type State = typeof state;
