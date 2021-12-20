import { ICompilation, ITrack } from './compilation-types';
import { MediaBlob } from './state-types';

/**
 * Provides handling methods for compilation manipulation.
 */
export default class CompilationHandler {
    /** Sorts the blobs by whether their fileName property
     * matches the given fileName, returning the matching one first.
     * @remarks This method is useful for delayed loading, to make sure the initially
     * used blob is handeled first
     * @param mediaBlobs - The array of media blobs to sort
     * @param fileName - The file name to sort for. If empty, no sorting does occurr.
     * */
    static sortByFirstFileName(
        mediaBlobs: MediaBlob[],
        fileName: string | undefined,
    ) {
        console.debug(
            'CompilationHandler::sortByFirstFileName:mediaBlobs(unsorted)',
            mediaBlobs,
        );
        if (fileName) {
            //mediaBlobs.sort((a,b) => (a.fileName > b.fileName) ? 1 : ((b.fileName > a.fileName) ? -1 : 0))
            mediaBlobs.sort((a, b) =>
                a.fileName == fileName ? 1 : fileName == b.fileName ? -1 : 0,
            );
            console.debug(
                'CompilationHandler::sortByFirstFileName:mediaBlobs(sorted)',
                mediaBlobs,
            );
        }
    }

    /** Determines the active track, if any, in the compilation.
     * @remarks The active track is the one, that contains the given cue.
     * @param compilation - The compilation, whose tracks are searched
     * @param cueId - The Id of the cue to find
     * */
    public static getActiveTrack(
        compilation: ICompilation,
        cueId: string,
    ): ITrack | undefined {
        return compilation?.Tracks?.find((t) =>
            t.Cues.find((c) => c.Id === cueId),
        );
    }
}
