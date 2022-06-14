import {
    Cue,
    ICompilation,
    ICue,
    ITrack,
    PlaybackMode,
    Track,
} from './compilation-types';
import FileHandler from './filehandler';
import { MediaBlob, MediaUrl } from './state-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Provides handling methods for compilation manipulation.
 */
export default class CompilationHandler {
    /** Creates a new cue, with default values */
    static createDefaultCue(compilation: ICompilation): ICue {
        const nextShortcut = CompilationHandler.getNextShortcut(compilation);
        const time = 0;
        const firstCueId = uuidv4();
        const cue = new Cue(
            '',
            nextShortcut.toString(),
            time,
            null,
            firstCueId,
        );
        return cue;
    }

    /** Get a new track, with values derived from the media URL properties */
    static createDefaultTrack(mediaUrl: MediaUrl): ITrack {
        console.debug(
            'CompilationHandler::createDefaultTrack:mediaUrl',
            mediaUrl,
        );
        let name = null;
        let artist = '';
        let album = '';
        let trackUrl = mediaUrl.resourceName;

        if (FileHandler.isValidHttpUrl(mediaUrl.url)) {
            trackUrl = mediaUrl.url;
            const url = new URL(mediaUrl.url);
            name = FileHandler.extractTrackNameFromUrl(url);
            artist = FileHandler.extractArtistNameFromUrl(url);
            album = FileHandler.extractAlbumNameFromUrl(url);
        } else {
            name = mediaUrl.resourceName;
        }

        const trackId = uuidv4();
        const newTrack = new Track(
            name,
            artist,
            album,
            0,
            trackUrl,
            trackId,
            new Array<ICue>(),
            null,
            PlaybackMode.PlayTrack /** default */,
        );
        return newTrack;
    }
    /** Return the index of the track in the given compilation */
    static getIndexOfTrackById(
        compilation: ICompilation,
        trackId: string,
    ): number {
        return compilation.Tracks.map((item) => item.Id).indexOf(trackId);
    }
    /** Sorts the cues array in place, by time. This method mutates the array and returns a reference to the same array.
     * @param cues - The array of cues to sort.
     * @returns The mutated array.
     */
    static sort(cues: ICue[]): ICue[] {
        cues.sort((a, b) =>
            (a.Time ?? 0) > (b.Time ?? 0)
                ? 1
                : (b.Time ?? 0) > (a.Time ?? 0)
                ? -1
                : 0,
        );
        return cues;
    }
    /** Guesses the next useful shortcut, based on the previously existing shortcuts.
     * @remarks Simply tries to parse all existing shortcuts, then increases the number by 1.
     * @remarks Cues without shortcut mnemonic are trated as having '0' as their shortcut.
     * @param compilation - The compilation to work on.
     */
    static getNextShortcut(compilation: ICompilation): number {
        const cueShortcuts = compilation.Tracks.flatMap((track) =>
            track.Cues.flatMap((cue) => cue.Shortcut)
                //Skip empty items
                .filter((el) => el !== null && el)
                .map((shortCut) => parseInt(shortCut ?? '0')),
        );
        const lastShortcut = cueShortcuts
            .sort(function (a, b) {
                return a - b;
            })
            .pop();
        if (lastShortcut && lastShortcut != null) {
            return lastShortcut + 1;
        }
        return 1;
    }

    /** Rounds the given time to the Replayer default precision.
     * @remarks The time will be rounded to two decimal digits after the point (1/100th of a second)
     */
    static roundTime(time: number): number {
        return Math.round(time * 100) / 100;
    }

    /** Extracts all online URLs from the compilation's tracks.
     * @remarks An online URL is a valid URL starting with the http|https protocol.
     * @param compilation - The compilation to work on.
     */
    static getOnlineMediaUrls(compilation: ICompilation): MediaUrl[] {
        const mediaUrls = new Array<MediaUrl>();
        if (compilation) {
            const trackUrls = compilation.Tracks.flatMap((track) => track.Url);
            trackUrls.forEach((url) => {
                if (FileHandler.isValidHttpUrl(url)) {
                    mediaUrls.push(MediaUrl.FromOnlineUrl(url));
                }
            });
        }
        return mediaUrls;
    }

    /** Updates (recalculates) the durations of the given cues, by using the track duration for the last cue.
     * @remarks Not the following:
     * - the cues with a null time are not used
     * - the track duration is larger than largest cue time
     */
    static updateCueDurations(cues: ICue[], trackDuration: number): void {
        console.debug(
            'CompilationHandler::updateCueDurations:trackDuration',
            trackDuration,
        );

        const originalCues = cues.filter(function (el) {
            return el.Time !== null;
        });
        if (originalCues && originalCues.length > 0) {
            //Create a shallow, backward sorted copy of the cue list, to iterate through, and setting the duration of the cue objects
            const sortedBackwards = CompilationHandler.sort([
                ...originalCues,
            ]).reverse();

            let lastTime: number | null = trackDuration;

            sortedBackwards.forEach((element) => {
                if (lastTime && element.Time !== null) {
                    element.Duration = lastTime - element.Time;
                }
                lastTime = element.Time;
            });
        }
    }
    /** Converts the total seconds into a conveniently displayable hh:mm:ss.zzz format,
     * if a suitable input value is provieded.
     * @remarks Omits the hour part, if not appliccable
     * @param subsecondDigits - The number of digits for the sub-second precision. Should be 1, 2, or 3 (default).
     * @return The display representation or the emtpy string.
     */
    static convertToDisplayTime(
        seconds: number | null,
        subsecondDigits = 3,
    ): string {
        if (seconds != null) {
            //Uses the hour, minute, seconds, and 3 digits of the milliseconds part
            const hhmmss = new Date(seconds * 1000)
                .toISOString()
                .substring(11, 11 + 9 + subsecondDigits);
            //skip the hour part, if not used
            return hhmmss.indexOf('00:') === 0 ? hhmmss.substring(3) : hhmmss;
        }
        return '';
    }

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

    /** Finds the matching media URL (playable data) for a track's file name, from an already loaded package
     * @param fileName - The file name to search for.
     * @param mediaUrlMap - A set of media URL's to search through.
     * @remarks If strict file names do not match, a more lazy approach without case and without non-ascii characters is attempted
     */
    public static getMatchingPackageMediaUrl(
        fileName: string | undefined,
        mediaUrlMap: Map<string, MediaUrl>,
    ): MediaUrl | null {
        if (mediaUrlMap && fileName) {
            //Default: Find by literal partial match of the file name
            let url = null;
            for (const [mediaFileName, mediaUrl] of mediaUrlMap) {
                if (
                    CompilationHandler.isEndingWithOneAnother(
                        fileName,
                        mediaFileName,
                    )
                ) {
                    url = mediaUrl;
                }
            }

            if (!url) {
                //In case of possible weird characters, or case mismatch, try a more lazy match.
                const lazyFileName =
                    CompilationHandler.getLazyFileName(fileName);

                for (const [mediaFileName, mediaUrl] of mediaUrlMap) {
                    const lazyMediaFileName =
                        CompilationHandler.getLazyFileName(mediaFileName);

                    if (
                        CompilationHandler.isEndingWithOneAnother(
                            lazyFileName,
                            lazyMediaFileName,
                        )
                    ) {
                        url = mediaUrl;
                    }
                }
            }
            return url;
        } else {
            return null;
        }
    }

    /** Whether the media URL (playable data) matches the given file name.
     * @param fileName - The file name to search for.
     * @param mediaUrl - A media URL
     * @remarks If strict file names do not match, a more lazy approach without case and without non-ascii characters is attempted
     */
    public static isMatchingMediaUrl(
        fileName: string | undefined,
        mediaUrl: MediaUrl,
    ): boolean {
        if (mediaUrl && fileName) {
            //Default: Find by literal partial match of the file name
            if (
                CompilationHandler.isEndingWithOneAnother(
                    fileName,
                    mediaUrl.resourceName,
                )
            ) {
                return true;
            }

            //In case of possible weird characters, or case mismatch, try a more lazy match.
            const lazyFileName = CompilationHandler.getLazyFileName(fileName);

            const lazyMediaFileName = CompilationHandler.getLazyFileName(
                mediaUrl.resourceName,
            );

            return CompilationHandler.isEndingWithOneAnother(
                lazyFileName,
                lazyMediaFileName,
            );
        }
        return false;
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

    /** Sorts the cues by their time, ascending
     * @param cues - The cues to sort
     * */
    public static sortByTime(cues: ICue[]): ICue[] {
        return cues.sort((a, b) =>
            (a.Time ?? 0) > (b.Time ?? 0)
                ? 1
                : (b.Time ?? 0) > (a.Time ?? 0)
                ? -1
                : 0,
        );
    }

    /** Gets the the track, if any, in the compilation, which contains the
     * cue with the given cue Id.
     * @param compilation - The compilation, whose tracks are searched
     * @param cueId - The Id of the cue to find
     * */
    public static getTrackByCueId(
        compilation: ICompilation,
        cueId: string,
    ): ITrack | undefined {
        return compilation?.Tracks?.find((t) =>
            t.Cues.find((c) => c.Id === cueId),
        );
    }

    /** Gets the the matching track, if any, in the compilation, by it's Id.
     * @param compilation - The compilation, whose tracks are searched
     * @param trackId - The Id of the track to find
     * */
    public static getTrackById(
        compilation: ICompilation,
        trackId: string,
    ): ITrack | undefined {
        return compilation.Tracks.find((t) => t.Id === trackId);
    }

    /** Gets the the matching cue, if any, in the compilation, by it's Id.
     * @param compilation - The compilation, whose (tracks and) cues are searched
     * @param cueId - The Id of the cue to find.
     * @returns The cue; or null, if no cue id is provided or the selected cue is can not be found.
     * */
    public static getCueById(
        compilation: ICompilation,
        cueId: string | null,
    ): ICue | null {
        const cue = compilation.Tracks.flatMap((track) => track.Cues).find(
            (cue) => cue.Id === cueId,
        );

        return cue ?? null;
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
