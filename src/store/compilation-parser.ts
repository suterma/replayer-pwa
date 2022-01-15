import {
    Compilation,
    Cue,
    ICompilation,
    ICue,
    ITrack,
    Track,
} from './compilation-types';
import { v4 as uuidv4 } from 'uuid';
import { MediaBlob, RezMimeTypes } from './state-types';
import xml2js from 'xml2js';
import NSKeyedUnarchiver from '@suterma/nskeyedunarchiver-liveplayback/source';
import bplist from 'bplist-parser';
import { XmlCompilation } from '@/code/xml/XmlCompilation';

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
            '', //TODO Use URL from ZIP filename
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

    /** Asserts whether the file name represents an XML compilation file */
    public static isXmlFile(fileName: string): boolean {
        return (
            fileName.toLowerCase().endsWith('.rex') ||
            fileName.toLowerCase().endsWith('.xml')
        );
    }

    /** Asserts whether the file name represents a bplist (Binary Propertylist) compilation file */
    public static isBplistFile(fileName: string): boolean {
        return (
            fileName.toLowerCase().endsWith('.bplist') ||
            fileName.toLowerCase().endsWith('playlist')
        );
    }

    /** Asserts whether the file name represents a media file
     * @remarks Currently, only mp3 is supported
     */
    public static isMediaFile(fileName: string): boolean {
        return fileName.toLowerCase().endsWith('.mp3');
    }

    /** Asserts whether the file name represents a package file
     * @remarks Currently, only mp3 is supported
     */
    public static isPackageFile(fileName: string): boolean {
        return (
            fileName.toLowerCase().endsWith('.rez') ||
            fileName.toLowerCase().endsWith('.zip')
        );
    }

    /** Parses a PLIST object into an ICompilation.
     * @param plistCompilation - An object representing the stored Compilation from a PLIST import.
     *  @devdoc The PList contains an array of all tracks.
     * NOTE: the plist compilation type does not have all data corresponding to a Replayer compilation. Thus some of the information like the GUID, is just made up    .
     */
    private static parseFromPListCompilation(
        plistCompilation: any,
    ): ICompilation {
        //TODO Use URL from ZIP filename
        return new Compilation(
            ''.normalize(), //TODO from ZIP filename
            'Imported from LivePlayback'.normalize(), //TODO from ZIP filename
            ''.normalize(), //TODO from ZIP filename
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
    /** Returns the first item in the array, if defined. Otherwise, the number 0 is returned as a default. */
    private static FirstNumberOf(array: number[]): number {
        if (array) {
            return Number(array[0] === undefined ? 0 : array[0]);
        }
        return 0;
    }

    /** @devdoc The XML type contains all properties as arrays, even the single item ones. This is a limitation of the used XML-To-JS converter */
    private static parseFromXmlTracks(xmlTracks: any): Array<ITrack> {
        const tracks = new Array<ITrack>();

        xmlTracks.forEach((xmlTrack: any) => {
            const track = new Track(
                CompilationParser.FirstStringOf(xmlTrack.Name),
                CompilationParser.FirstStringOf(xmlTrack.Album),
                CompilationParser.FirstStringOf(xmlTrack.Artist),
                CompilationParser.FirstNumberOf(xmlTrack.Measure),
                CompilationParser.FirstStringOf(xmlTrack.Url),
                CompilationParser.FirstStringOf(xmlTrack.Id),
                CompilationParser.parseFromXmlCues(xmlTrack.Cues[0].Cue),
            );
            tracks.push(track);
        });

        return tracks;
    }

    private static parseFromPlistTracks(plistTracks: any[]): Array<ITrack> {
        const tracks = new Array<ITrack>();

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
                    0,
                    decodeURI(plistTrack.Path).normalize(),
                    uuidv4(),
                    CompilationParser.parseFromPlistCues(plistTrack.Markers),
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        xmlCues.forEach((xmlCue: any): void => {
            //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
            const cue = new Cue(
                CompilationParser.FirstStringOf(xmlCue.Description).normalize(),
                CompilationParser.FirstStringOf(xmlCue.Shortcut).normalize(),
                CompilationParser.FirstNumberOf(xmlCue.Time),
                null,
                CompilationParser.FirstStringOf(xmlCue.Id),
            );
            cues.push(cue);
        });
        return cues;
    }

    private static parseFromPlistCues(plistCues: any[]): ICue[] {
        const cues = new Array<ICue>();

        plistCues.forEach((plistCue: any) => {
            //NOTE: the plist compilation type does not have all data corresponding to a Replayer compilation. Thus some of the information like the GUID, is just made up    .
            //TODO Update instead of push, if exists
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
        return xml2js
            .parseStringPromise(content /*, options */)
            .then((result: any) => {
                console.debug('Parsed XML compilation: ', result);
                return CompilationParser.parseFromXmlCompilation(
                    result.XmlCompilation,
                );
            });
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

    /** Handles the given Buffer as having media content and converts it into a MediaBlob
     * @devdoc This is used when a file is read from the ZIP package and not yet available as blob
     */
    public static handleAsMediaContent(
        mediaFileName: string,
        content: Buffer,
        mimeType: RezMimeTypes,
    ): MediaBlob {
        console.debug('CompilationParser::handleAsMediaContent');
        //TODO https://stackoverflow.com/questions/21737224/using-local-file-as-audio-src
        const blob = new Blob([content], {
            type: mimeType,
        });
        return new MediaBlob(mediaFileName, blob);
    }
}
