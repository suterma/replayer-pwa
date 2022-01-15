import { ICompilation, ITrack } from './compilation-types';
import { MediaBlob } from './state-types';

/**
 * Provides handling methods for compilation manipulation.
 */
export default class CompilationHandler {
    /** Gets a lazy variant of the given file name, for better non-literal matching in case of special characters.
     * @remarks This removes non-printable characters (below the space, 32dec, 20hex) and non-ascii characters.
     * See https://stackoverflow.com/a/9364527/79485 and
     * https://stackoverflow.com/questions/20856197/remove-non-ascii-character-in-string
     */
    public static getLazyFileName(fileName: string): string {
        return (
            fileName
                .toLowerCase()
                // eslint-disable-next-line
                .replace(/[^\x20-\x7F]/g, '')
        );
    }
    /** Sorts the blobs by whether their fileName lazily
     * starts or ends with the given fileName, returning the matching one first.
     * @remarks This method is useful to speed up delayed loading, to make sure the initially
     * used blob is handeled first (or among the first)
     * @remarks A lazy matching approach is always used here because an exact single match is not
     * strictly necessary for this kind of sorting.
     * @param mediaBlobs - The array of media blobs to sort
     * @param sortFileName - The file name to sort for. If empty, no sorting does occurr.
     * */
    public static sortByFirstFileName(
        mediaBlobs: MediaBlob[],
        sortFileName: string | undefined,
    ): MediaBlob[] {
        if (sortFileName) {
            const sortedArray = [
                ...mediaBlobs.filter(({ fileName }) =>
                    CompilationHandler.isEndingWithOneAnother(
                        CompilationHandler.getLazyFileName(fileName),
                        CompilationHandler.getLazyFileName(sortFileName),
                    ),
                ),
                ...mediaBlobs.filter(
                    ({ fileName }) =>
                        !CompilationHandler.isEndingWithOneAnother(
                            CompilationHandler.getLazyFileName(fileName),
                            CompilationHandler.getLazyFileName(sortFileName),
                        ),
                ),
            ];

            return sortedArray;
        }
        return mediaBlobs;
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

    /** Determines, whether one of the given string ends with the other
     * @param first - the first string for the comparison
     * @param second - the second string for the comparison
     */
    public static isEndingWithOneAnother(
        first: string,
        second: string,
    ): boolean {
        return first.endsWith(second) || second.endsWith(first);
    }
}
