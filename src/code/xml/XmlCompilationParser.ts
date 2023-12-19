import { Cue } from '@/store/Cue';
import { DefaultTrackVolume, Track } from '@/store/Track';
import { Compilation } from '@/store/Compilation';
import { type ICue } from '@/store/ICue';
import { type ICompilation } from '@/store/ICompilation';
import { type ITrack } from '@/store/ITrack';
import xml2js from 'xml2js';
import { XmlCompilation } from '@/code/xml/XmlCompilation';
import { TimeSignature } from '../music/TimeSignature';
import type { ITimeSignature } from '../music/ITimeSignature';
import { Meter } from '../music/Meter';
import type { IMeter } from '../music/IMeter';

/**
 * Provides static helper methods for parsing compilations from and to XML.
 * @devdoc Code is written to work with the xml2js module specifically
 */
export default abstract class XmlCompilationParser {
    /** Parses an XML object into an ICompilation.
     * @param xmlCompilation - An object representing the stored Compilation from an XML import.
     * @devdoc The XML type contains all properties as arrays, even the single item ones. This is a limitation of the used XML-To-JS converter */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static parseFromXmlCompilation(xmlCompilation: any): ICompilation {
        console.debug('Raw xmlCompilation:', xmlCompilation);
        return new Compilation(
            XmlCompilationParser.FirstStringOf(xmlCompilation.MediaPath),
            XmlCompilationParser.FirstStringOf(xmlCompilation.Title),
            XmlCompilationParser.FirstStringOf(xmlCompilation.Artist),
            XmlCompilationParser.FirstStringOf(xmlCompilation.Album),
            '', //NOTE: URL will be set from calling code, with the standalone XML or ZIP file name
            XmlCompilationParser.FirstStringOf(xmlCompilation.Id),
            XmlCompilationParser.parseFromXmlTracks(
                xmlCompilation.Tracks[0].Track,
            ),
        );
    }

    /** Converts a compilation instance into its XML representation */
    public static convertToXml(compilation: ICompilation): string {
        const obj = {
            XmlCompilation: new XmlCompilation(compilation),
        };
        const builder = new xml2js.Builder();
        const xml = builder.buildObject(obj);
        return xml;
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
                XmlCompilationParser.FirstStringOf(xmlTrack.Name),
                XmlCompilationParser.FirstStringOf(xmlTrack.Album),
                XmlCompilationParser.FirstStringOf(xmlTrack.Artist),
                XmlCompilationParser.FirstNumberOf(xmlTrack.PreRoll) ??
                    null /** NOTE: the formerly used measure property is deprecated */,
                XmlCompilationParser.parseFromXmlMeter(
                    xmlTrack.Meter ? xmlTrack.Meter[0] : null,
                ),
                XmlCompilationParser.FirstBooleanOf(xmlTrack.useMeasureNumbers),
                XmlCompilationParser.FirstStringOf(xmlTrack.Url),
                XmlCompilationParser.FirstStringOf(xmlTrack.Id),
                XmlCompilationParser.parseFromXmlCues(
                    xmlTrack.Cues ? xmlTrack.Cues[0].Cue : null,
                ),
                null,
                XmlCompilationParser.FirstNumberOf(xmlTrack.Volume) ??
                    DefaultTrackVolume,
            );
            tracks.push(track);
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
                    XmlCompilationParser.FirstStringOf(
                        xmlCue.Description,
                    ).normalize(),
                    XmlCompilationParser.FirstStringOf(
                        xmlCue.Shortcut,
                    ).normalize(),
                    XmlCompilationParser.FirstNumberOf(xmlCue.Time),
                    null,
                    XmlCompilationParser.FirstStringOf(xmlCue.Id),
                );
                cues.push(cue);
            });
        }
        return cues;
    }

    /** Parses an XML representation of a meter into an object instance. */
    private static parseFromXmlMeter(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        xmlMeter: any,
    ): IMeter | null {
        let meter = null;
        if (xmlMeter && xmlMeter.TimeSignature) {
            meter = new Meter(
                XmlCompilationParser.parseFromXmlTimeSignature(
                    xmlMeter.TimeSignature[0],
                ),
                XmlCompilationParser.FirstNumberOf(xmlMeter.BeatsPerMinute),
                XmlCompilationParser.FirstNumberOf(xmlMeter.OriginTime),
            );
        }

        return meter;
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
                XmlCompilationParser.FirstNumberOf(xmlTimeSignature.Numerator),
                XmlCompilationParser.FirstNumberOf(
                    xmlTimeSignature.Denominator,
                ),
            );
        }

        return timeSignature;
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
                    return XmlCompilationParser.parseFromXmlCompilation(
                        result.XmlCompilation,
                    );
                })
        );
    }
}
