import {
    Compilation,
    CompilationType,
    Cue,
    ICompilation,
    ICue,
    ITrack,
    Track,
} from './compilation-types';
import { v4 as uuidv4 } from 'uuid';

/**
 * Provides helper methods for parsing compilations from external storage formats.
 */
export default class CompilationParser {
    /** Parses an XML object into an ICompilation.
     * @param xmlCompilation - An object representing the stored Compilation from an XML import.
     * @devdoc The XML type contains all properties as arrays, even the single item ones. This is a limitation of the used XML-To-JS converter */
    static parseFromXmlCompilation(xmlCompilation: any): ICompilation {
        const compilation = new Compilation();
        compilation.Type = CompilationType.XML;
        compilation.MediaPath = xmlCompilation.MediaPath;
        compilation.Title = CompilationParser.FirstStringOf(
            xmlCompilation.Title,
        );
        compilation.Url = ''; //TODO from ZIP filename
        compilation.Id = CompilationParser.FirstStringOf(xmlCompilation.Id);
        const xmlTracks = xmlCompilation.Tracks[0].Track;
        compilation.Tracks = CompilationParser.parseFromXmlTracks(xmlTracks);
        return compilation;
    }

    /** Parses a PLIST object into an ICompilation.
     * @param plistCompilation - An object representing the stored Compilation from a PLIST import.
     *  @devdoc The PList contains an array of all tracks.
     * NOTE: the plist compilation type does not have all data corresponding to a Replayer compilation. Thus some of the information like the GUID, is just made up    .
     */
    static parseFromPListCompilation(plistCompilation: any): ICompilation {
        const compilation = new Compilation();
        //NOTE: the plist compilation type does not have all data corresponding to a Replayer compilation. Thus some of the information like the GUID, is just made up    .
        //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
        compilation.Type = CompilationType.XML; //TODO do we need a type here at all?
        compilation.MediaPath = ''.normalize(); //TODO from ZIP filename
        compilation.Title = 'Imported from LivePlayback'.normalize(); //TODO from ZIP filename
        compilation.Url = ''.normalize(); //TODO from ZIP filename
        compilation.Id = uuidv4();
        compilation.Tracks =
            CompilationParser.parseFromPlistTracks(plistCompilation);

        return compilation;
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
            const track = new Track();
            track.Album = CompilationParser.FirstStringOf(xmlTrack.Album);
            track.Artist = CompilationParser.FirstStringOf(xmlTrack.Artist);
            track.Id = CompilationParser.FirstStringOf(xmlTrack.Id);
            track.Measure = CompilationParser.FirstNumberOf(xmlTrack.Measure);
            track.Name = CompilationParser.FirstStringOf(xmlTrack.Name);
            track.Url = CompilationParser.FirstStringOf(xmlTrack.Url);
            tracks.push(track);

            const xmlCues = xmlTrack.Cues[0].Cue;
            track.Cues = CompilationParser.parseFromXmlCues(xmlCues);
        });

        return tracks;
    }

    private static parseFromPlistTracks(plistTracks: any[]): Array<ITrack> {
        const tracks = new Array<ITrack>();

        plistTracks.forEach((plistTrack: any) => {
            //Only for tracks with real data (LivePlayback may have empty slots in the tracks list)
            if (plistTrack.Duration && plistTrack.Name && plistTrack.Path) {
                //NOTE: the plist compilation type does not have all data corresponding to a Replayer compilation. Thus some of the information like the GUID, is just made up    .
                //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
                //TODO Update instead of push, if exists
                const track = new Track();
                track.Album = ''.normalize();
                track.Artist = ''.normalize();
                track.Id = uuidv4();
                track.Measure = 0;
                track.Name = plistTrack.Name.normalize();
                //URL-Decode because LivePlayback stores file names as URIs
                track.Url = decodeURI(plistTrack.Path).normalize();
                tracks.push(track);

                const plistCues = plistTrack.Markers;
                track.Cues = CompilationParser.parseFromPlistCues(plistCues);
            }
        });
        return tracks;
    }

    /** @devdoc The XML type contains all properties as arrays, even the singe item ones. This is a limitation of the used XML-To-JS converter */
    private static parseFromXmlCues(xmlCues: any): ICue[] {
        const cues = new Array<ICue>();

        xmlCues.forEach((xmlCue: any) => {
            //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
            const cue = new Cue();
            cue.Description = CompilationParser.FirstStringOf(
                xmlCue.Description,
            ).normalize();
            cue.Time = CompilationParser.FirstNumberOf(xmlCue.Time);
            cue.Id = CompilationParser.FirstStringOf(xmlCue.Id);
            cue.Shortcut = CompilationParser.FirstStringOf(
                xmlCue.Shortcut,
            ).normalize();
            cues.push(cue);
        });
        return cues;
    }

    private static parseFromPlistCues(plistCues: any[]): ICue[] {
        const cues = new Array<ICue>();

        plistCues.forEach((plistCue: any) => {
            //NOTE: the plist compilation type does not have all data corresponding to a Replayer compilation. Thus some of the information like the GUID, is just made up    .
            //TODO Update instead of push, if exists
            const cue = new Cue();
            cue.Description = plistCue.Name;
            cue.Time = plistCue.Position;
            cue.Id = uuidv4();
            cue.Shortcut = plistCue.ShortCut;
            cues.push(cue);
        });
        return cues;
    }
}
