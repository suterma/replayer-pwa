import {
    Compilation,
    Cue,
    DefaultTrackVolume,
    ICompilation,
    ICue,
    ITrack,
    Track,
} from './compilation-types';
import { v4 as uuidv4 } from 'uuid';
import { MediaBlob } from './types';
import xml2js from 'xml2js';
import NSKeyedUnarchiver from '@suterma/nskeyedunarchiver-liveplayback/source';
import bplist from 'bplist-parser';
import { XmlCompilation } from '@/code/xml/XmlCompilation';
import { LocationQuery } from 'vue-router';
import CompilationHandler from './compilation-handler';
import FileHandler from './filehandler';
import { ITimeSignature } from '@/code/compilation/ITimeSignature';
import { TimeSignature } from '@/code/compilation/TimeSignature';

/**
 * Provides helper methods for parsing compilations from and to external storage formats.
 */
export default class CompilationParser {
    /** Parses an XML object into an ICompilation.
     * @param xmlCompilation - An object representing the stored Compilation from an XML import.
     * @devdoc The XML type contains all properties as arrays, even the single item ones. This is a limitation of the used XML-To-JS converter */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static parseFromXmlCompilation(xmlCompilation: any): ICompilation {
        console.debug('Raw xmlCompilation:', xmlCompilation);
        return new Compilation(
            CompilationParser.FirstStringOf(xmlCompilation.MediaPath),
            CompilationParser.FirstStringOf(xmlCompilation.Title),
            CompilationParser.FirstStringOf(xmlCompilation.Artist),
            CompilationParser.FirstStringOf(xmlCompilation.Album),
            '', //NOTE: URL will be set from calling code, with the standalone XML or ZIP file name
            CompilationParser.FirstStringOf(xmlCompilation.Id),
            CompilationParser.parseFromXmlTracks(
                xmlCompilation.Tracks[0].Track,
            ),
        );
    }

    /** Converts a compilation Object into an XML representation */
    public static convertToXml(compilation: ICompilation): string {
        const obj = {
            XmlCompilation: new XmlCompilation(compilation),
        };
        const builder = new xml2js.Builder();
        const xml = builder.buildObject(obj);
        return xml;
    }

    /** Parses a PLIST object into an ICompilation.
     * @param plistCompilation - An object representing the stored Compilation from a PLIST import.
     * @devdoc The PList contains an array of all tracks.
     * NOTE: the plist compilation type does not have all data corresponding to a Replayer compilation. Thus some of the information like the GUID, is just made up    .
     */
    private static parseFromPListCompilation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plistCompilation: any,
    ): ICompilation {
        return new Compilation(
            ''.normalize(),
            'Imported from LivePlayback'.normalize(),
            ''.normalize(),
            ''.normalize(),
            ''.normalize(),
            uuidv4(),
            CompilationParser.parseFromPlistTracks(plistCompilation),
        );
    }

    /** Returns the first item in the array, if defined. Otherwise, the empty string is returned as a default. */
    private static FirstStringOf(array: string[]): string {
        if (array) {
            return array[0] === undefined ? '' : array[0];
        }
        return '';
    }
    /** Returns the first item in the array as a number, if defined. Otherwise, null is returned as a default. */
    private static FirstNumberOf(array: string[]): number | null {
        if (array) {
            const firstItem = array[0];
            if (firstItem) {
                const firstNumber = Number.parseFloat(firstItem);
                if (Number.isFinite(firstNumber)) {
                    return firstNumber;
                }
            }
        }
        return null;
    }

    /** Returns the first item in the array as a boolean, if defined. Otherwise, null is returned as a default. */
    private static FirstBooleanOf(array: string[]): boolean | null {
        if (array) {
            const firstItem = array[0];
            if (firstItem) {
                const firstBoolean = firstItem == 'true';
                return firstBoolean;
            }
        }
        return null;
    }

    /** @devdoc The XML type contains all properties as arrays, even the single item ones. This is a limitation of the used XML-To-JS converter */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static parseFromXmlTracks(xmlTracks: any): Array<ITrack> {
        const tracks = new Array<ITrack>();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        xmlTracks.forEach((xmlTrack: any) => {
            const track = new Track(
                CompilationParser.FirstStringOf(xmlTrack.Name),
                CompilationParser.FirstStringOf(xmlTrack.Album),
                CompilationParser.FirstStringOf(xmlTrack.Artist),
                /** NOTE: the formerly used measure property is deprecated */
                CompilationParser.FirstNumberOf(xmlTrack.BeatsPerMinute),
                CompilationParser.parseFromXmlTimeSignature(
                    xmlTrack.TimeSignature[0],
                ),
                CompilationParser.FirstNumberOf(xmlTrack.OriginTime),
                CompilationParser.FirstBooleanOf(
                    xmlTrack.useMeasureNumberAsPosition,
                ),
                CompilationParser.FirstStringOf(xmlTrack.Url),
                CompilationParser.FirstStringOf(xmlTrack.Id),
                CompilationParser.parseFromXmlCues(xmlTrack.Cues[0].Cue),
                null,
                CompilationParser.FirstNumberOf(xmlTrack.Volume) ??
                    DefaultTrackVolume,
            );
            tracks.push(track);
        });

        return tracks;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static parseFromPlistTracks(plistTracks: any[]): Array<ITrack> {
        const tracks = new Array<ITrack>();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plistTracks.forEach((plistTrack: any) => {
            //Only for tracks with real data (LivePlayback may have empty slots in the tracks list)
            if (plistTrack.Duration && plistTrack.Name && plistTrack.Path) {
                //NOTE: the plist compilation type does not have all data corresponding to a Replayer compilation.
                //Thus some of the information like the GUID, is just made up.
                //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
                const track = new Track(
                    plistTrack.Name.normalize(),
                    ''.normalize(),
                    ''.normalize(),
                    null /*BPM*/,
                    null,
                    null,
                    null,
                    decodeURI(plistTrack.Path).normalize(),
                    uuidv4(),
                    CompilationParser.parseFromPlistCues(plistTrack.Markers),
                    null,
                    DefaultTrackVolume,
                );
                tracks.push(track);
            }
        });
        return tracks;
    }

    /** @devdoc The XML type contains all properties as arrays, even the single item ones. This is a limitation of the used XML-To-JS converter */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static parseFromXmlCues(xmlCues: any): ICue[] {
        const cues = new Array<ICue>();

        if (xmlCues) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            xmlCues.forEach((xmlCue: any): void => {
                //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
                const cue = new Cue(
                    CompilationParser.FirstStringOf(
                        xmlCue.Description,
                    ).normalize(),
                    CompilationParser.FirstStringOf(
                        xmlCue.Shortcut,
                    ).normalize(),
                    CompilationParser.FirstNumberOf(xmlCue.Time),
                    null,
                    CompilationParser.FirstStringOf(xmlCue.Id),
                );
                cues.push(cue);
            });
        }
        return cues;
    }

    /** Parses an XML representation of a time signature into an object instance. */
    private static parseFromXmlTimeSignature(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        xmlTimeSignature: any,
    ): ITimeSignature | null {
        let timeSignature = null;

        if (
            xmlTimeSignature &&
            xmlTimeSignature.Numerator != null &&
            xmlTimeSignature.Denominator != null
        ) {
            timeSignature = new TimeSignature(
                CompilationParser.FirstNumberOf(xmlTimeSignature.Numerator),
                CompilationParser.FirstNumberOf(xmlTimeSignature.Denominator),
            );
        }

        return timeSignature;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static parseFromPlistCues(plistCues: any[]): ICue[] {
        const cues = new Array<ICue>();

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        plistCues.forEach((plistCue: any) => {
            //NOTE: the plist compilation type does not have all data corresponding to a Replayer compilation. Thus some of the information like the GUID, is just made up    .
            const cue = new Cue(
                plistCue.Name,
                plistCue.ShortCut,
                plistCue.Position,
                null,
                uuidv4(),
            );
            cues.push(cue);
        });
        return cues;
    }

    /** Handles the given Buffer as having XML content and parses it into the compilation meta data
     */
    public static handleAsXmlCompilation(
        content: Buffer,
    ): Promise<ICompilation> {
        console.debug('CompilationParser::handleAsXmlCompilation');
        return (
            xml2js
                .parseStringPromise(content /*, options */)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .then((result: any) => {
                    console.debug('Parsed XML compilation: ', result);
                    return CompilationParser.parseFromXmlCompilation(
                        result.XmlCompilation,
                    );
                })
        );
    }

    /** Handles the given Buffer as having plist content and parses it into the compilation meta data
     */
    public static handleAsLivePlaybackPlaylist(
        content: Buffer,
    ): Promise<ICompilation> {
        console.debug('CompilationParser::handleAsLivePlaybackPlaylist');
        return bplist
            .parseFile(content)
            .then((inputPropertyList: unknown[]) => {
                const unarchivedObject = new NSKeyedUnarchiver().unarchive(
                    inputPropertyList,
                );
                return CompilationParser.parseFromPListCompilation(
                    unarchivedObject,
                );
            });
    }

    /** Handles the given filename and buffer as having media content and converts it into a MediaBlob
     * @remarks Guesses the MIME type from the file name extension
     * @devdoc This is used when a file is read from the ZIP package and not yet available as blob
     */
    public static handleAsMediaContent(
        mediaFileName: string,
        content: Buffer,
    ): MediaBlob {
        console.debug('CompilationParser::handleAsMediaContent');
        const blob = new Blob([content], {
            type: FileHandler.getFileMimeType(mediaFileName),
        });
        return new MediaBlob(mediaFileName, blob);
    }

    /** Parses a new track from a query
     * @remarks Assumes that the query follows the track API definition.
     * See https://replayer.app/en/documentation/track-api
     * @param query {LocationQuery} - The URL query to pars
     * @devdoc Currently does not support shortcuts
     */
    public static parseFromUrlQuery(query: LocationQuery): ITrack | undefined {
        const mediaUrl = CompilationParser.getSingle(query.media);

        if (mediaUrl) {
            //Get the track metadata
            const title = CompilationParser.getSingle(query.title) ?? '';
            const artist = CompilationParser.getSingle(query.artist) ?? '';
            const album = CompilationParser.getSingle(query.album) ?? '';

            //Get the cues if available
            let cues = Array<ICue>();
            for (const key in query) {
                const time = parseFloat(key);
                if (!isNaN(time)) {
                    const description = CompilationParser.getSingle(
                        query[key],
                    ) as string;
                    const cueId = uuidv4();
                    cues.push(new Cue(description, null, time, null, cueId));
                }
            }

            cues = CompilationHandler.sortByTime(cues);

            const trackId = uuidv4();
            const newTrack = new Track(
                title,
                album,
                artist,
                null /*BPM*/,
                null,
                null,
                null,
                mediaUrl,
                trackId,
                cues,
                null,
                DefaultTrackVolume,
            );
            return newTrack;
        } else {
            return undefined;
        }
    }

    /** Gets a single item from either an array, or just the single value
     * @remarks The items of the array are expected to be all of the same type T.
     */
    public static getSingle<T>(set: T | T[]): T {
        return Array.isArray(set) ? (set[0] as T) : set;
    }
    /** Gets a set of items from either an array, or just the single value
     * @remarks The items of the array are expected to be all of the same type T.
     */
    public static getSet<T>(set: T | T[]): T[] {
        if (Array.isArray(set)) {
            return set;
        }
        const arr = Array<T>();
        arr.push(set);
        return arr;
    }
}
