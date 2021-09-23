import { MediaFile } from './state-types';
import { Compilation, ICompilation } from './compilation-types';

/** Defines the state of this application */
interface IState {
    /** A compilation to work with
     */
    compilation: ICompilation;
    /** A set of media files from a REZ compilation, representing playable buffers */
    fileUrls: Array<MediaFile>;

    /** An application work message stack, used for progress indication
     * @remarks during ongoing work, the stack is non-empty
     */
    progressMessageStack: Array<string>;
}

export const state: IState = {
    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    compilation: new Compilation(),

    fileUrls: new Array<MediaFile>(),

    progressMessageStack: new Array<string>(),
};

export type State = typeof state;
