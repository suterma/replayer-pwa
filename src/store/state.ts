import { MediaFile } from './state-types';
import { Compilation, ICompilation } from './compilation-types';

/** Defines the state of this application */
interface IState {

    /** A compilation to work with
     */
    compilation: ICompilation,
    /** A set of media files from a REZ compilation, representing playable buffers */
    fileUrls: Array<MediaFile>,

    /** An application progress indicator, or null if currently no action with progress indication is running
     * @remarks A non-null value triggers the display of progress information
     */
    progressMessage: string | null,

  }

export const state : IState = {
    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    compilation: new Compilation(),
    
    fileUrls: new Array<MediaFile>(),

    progressMessage: null,
};

export type State = typeof state;
