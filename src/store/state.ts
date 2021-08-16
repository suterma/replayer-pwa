export const state = {
    compilation: new Array<string>(),
    /** A set of File URL's from a REZ compilation, representing playable buffers */
    fileUrls: new Array<string>(),

    progressMessage: '',
};

export type State = typeof state;
