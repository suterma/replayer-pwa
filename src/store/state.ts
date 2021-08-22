import { MediaFile } from './state-types';
import { Compilation } from './compilation-types';

export const state = {
    compilation: new Compilation(),
    /** A set of media files from a REZ compilation, representing playable buffers */
    fileUrls: new Array<MediaFile>(),

    progressMessage: '',
};

export type State = typeof state;
