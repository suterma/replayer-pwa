import { floor } from 'lodash';
import type { ITimeSignature } from './ITimeSignature';
import { MetricalPosition } from './MetricalPosition';
import type { IMeter } from './IMeter';
import { TimeSignature } from './TimeSignature';

/** @class Static functions for the musical meter
 */
export class Meter implements IMeter {
    /** Creates a new meter with only the given origin time
     * @remarks Other properties are left null. This is useful to create an initial instance when only the origin time is yet available.
     */
    static FromTimeSignature(originTime: number | null): IMeter {
        return new Meter(new TimeSignature(null, null), null, originTime);
    }

    TimeSignature: ITimeSignature | null;
    BeatsPerMinute: number | null;
    OriginTime: number | null;

    /** Creates a new meter
     * @param {ITimeSignature | null} timeSignature - The time signature
     * @param {number | null} beatsPerMinute - The tempo in beats per minute
     * @param {number | null} originTime - The temporal position of the origin of the beat (time of first beat) in the track in [seconds]
     */
    constructor(
        timeSignature: ITimeSignature | null,
        beatsPerMinute: number | null,
        originTime: number | null,
    ) {
        this.TimeSignature = timeSignature;
        this.BeatsPerMinute = beatsPerMinute;
        this.OriginTime = originTime;
    }

    /** Determines whether all properties are set to valid data */
    public static isValid(meter: IMeter | null | undefined): boolean {
        return (
            (meter != null &&
                meter != undefined &&
                Number.isFinite(meter.BeatsPerMinute) &&
                Number.isFinite(meter.TimeSignature?.Denominator) &&
                Number.isFinite(meter.TimeSignature?.Numerator) &&
                Number.isFinite(meter.OriginTime)) ??
            false
        );
    }

    /** Converts a temporal position into a displayable measure/beats count format,
     * according to the meter,
     * if a suitable input value is provided.
     * @param time - The temporal position in [seconds]
     * @param meter - The meter to use for the conversion
     * @return The measure/beats representation or a placeholder.
     */
    public static toMeasureDisplay(
        time: number | null | undefined,
        meter: IMeter,
    ): string {
        const metricalPosition = this.fromTime(time, meter);
        if (metricalPosition && metricalPosition.Measure) {
            // set fixed integral digits
            let measureNumberPrefix = '';
            if (metricalPosition.Measure < 100) {
                measureNumberPrefix += ' ';
            }
            if (metricalPosition.Measure < 10) {
                measureNumberPrefix += ' ';
            }

            return `#|${measureNumberPrefix}${metricalPosition.Measure} |.${metricalPosition.Beat}`;
        } else if (metricalPosition && metricalPosition.Beat) {
            return `#|    |.${metricalPosition.Beat}`;
        }

        return '#|    |. ';
    }

    /** Converts a temporal duration into a displayable multimeasure rest format,
     * according to the meter,
     * if a suitable input value is provided.
     * @remarks This is intended to be used to denote durations instead of positions (as with toMeasureDisplay)
     * @param duration - The temporal duration in [seconds]
     * @param meter - The meter to use for the conversion
     * @return The multimeasure rest representation or a placeholder.
     */
    public static toMultiMeasureRestDisplay(
        duration: number | null | undefined,
        meter: IMeter,
    ): string {
        if (
            meter.OriginTime != null &&
            duration != null &&
            Meter.isValid(meter)
        ) {
            const metricalPosition = this.fromTime(
                duration +
                    meter.OriginTime -
                    Meter.TemporalEpsilon /* to make sure, that there is not a beat to much counted*/,
                meter,
            );
            if (metricalPosition && metricalPosition.Measure) {
                // set fixed integral digits
                let measureNumberPrefix = '';
                if (metricalPosition.Measure < 100) {
                    measureNumberPrefix += ' ';
                }
                if (metricalPosition.Measure < 10) {
                    measureNumberPrefix += ' ';
                }

                return `├${measureNumberPrefix}${metricalPosition.Measure} ┤`;
            } else if (metricalPosition && metricalPosition.Beat) {
                return `├    ┤`;
            }
        }
        return '├    ┤';
    }

    /** Converts a temporal duration (in seconds) into a decimal beat count
     * if a suitable input value is provided.
     * @param duration - The temporal duration in [seconds]
     * @param meter - The meter to use for the conversion
     * @return The decimal beat count or null
     */
    public static beatsFromDuration(
        duration: number | null | undefined,
        meter: IMeter,
    ): number | null {
        if (
            duration != null &&
            Number.isFinite(duration) &&
            meter != null &&
            meter.TimeSignature != null &&
            meter.TimeSignature.Numerator != null &&
            meter.TimeSignature.Denominator != null &&
            meter.BeatsPerMinute != null &&
            Meter.isValid(meter)
        ) {
            const signatureValue =
                meter.TimeSignature.Numerator / meter.TimeSignature.Denominator;

            const beats =
                duration * (meter.BeatsPerMinute / 60) * signatureValue;

            return beats;
        }

        return null;
    }

    /** Converts a temporal position (in total seconds within a track) into a metrical position
     * if a suitable input value is provided.
     * @param time - The temporal position in [seconds]
     * @param meter - The meter to use for the conversion
     * @return The metrical position or null
     */
    public static fromTime(
        seconds: number | null | undefined,
        meter: IMeter,
    ): MetricalPosition | null {
        if (
            seconds != null &&
            Number.isFinite(seconds) &&
            meter != null &&
            meter.OriginTime != null &&
            Number.isFinite(meter.OriginTime) &&
            meter.BeatsPerMinute &&
            meter.TimeSignature &&
            meter.TimeSignature.Numerator &&
            meter.TimeSignature.Denominator
        ) {
            // get the time relative to the teporal position of the declared first beat
            const shiftedTime = seconds - meter.OriginTime;

            const beatsPerSecond = meter.BeatsPerMinute / 60;

            const beat = shiftedTime * beatsPerSecond;

            const beatNumber = floor(beat);

            const measureNumber = floor(
                beatNumber / meter.TimeSignature.Numerator +
                    1 /* Measures are index-one based */,
            );

            const beatInMeasureNumber =
                (beatNumber % meter.TimeSignature.Numerator) +
                1; /* Beats in measures are index-one based */

            // Never show measures below index 1, but count the beats nonetheless
            if (shiftedTime < 0) {
                const beatInMeasureNumber =
                    (beatNumber + 1) % meter.TimeSignature.Numerator;
                /* Beats are index-one based */
                const beatNumberInMeasureNumber = beatInMeasureNumber;

                return new MetricalPosition(
                    null,
                    beatNumberInMeasureNumber + meter.TimeSignature.Numerator,
                );
            }

            return new MetricalPosition(measureNumber, beatInMeasureNumber);
        }

        return null;
    }

    /** Converts a metrical position into a temporal position (within a track),
     * if a suitable input value is provided.
     * @param metricalPosition - The metrical position to convert from
     * @param meter - The musical meter
     * @return The temporal position in seconds or null
     */
    public static toTime(
        metricalPosition: MetricalPosition | null,
        meter: IMeter,
    ): number | null {
        if (
            metricalPosition &&
            metricalPosition.Measure !== null &&
            meter.OriginTime !== null &&
            Number.isFinite(meter.OriginTime) &&
            meter.BeatsPerMinute &&
            Number.isFinite(meter.BeatsPerMinute) &&
            meter.TimeSignature &&
            meter.TimeSignature.Numerator &&
            meter.TimeSignature.Denominator
        ) {
            // the position in beats, into the track
            // NOTE: beats here is zero-based, whereas the metrical position data is one-based
            const beats =
                (metricalPosition.Measure - 1) * meter.TimeSignature.Numerator;
            const time = (beats / meter.BeatsPerMinute) * 60;

            // Use epsilon to make sure the temporal position is never earlier than the calculated position for the beat.
            return meter.OriginTime + time + Meter.TemporalEpsilon;
        }
        return null;
    }

    /** Converts a the duration of a single measure into a temporal duration.
     * if a suitable input value is provided.
     * @param meter - The musical meter
     * @return The measure duration in seconds or null
     */
    public static measureDuration(meter: IMeter): number | null {
        if (
            meter.BeatsPerMinute /*non-zero*/ &&
            Number.isFinite(meter.BeatsPerMinute) &&
            meter.TimeSignature &&
            meter.TimeSignature.Numerator &&
            meter.TimeSignature.Denominator
        ) {
            // The number of beats per measure
            // NOTE: beats here is zero-based
            const beats = meter.TimeSignature.Numerator;
            const time = (beats / meter.BeatsPerMinute) * 60;

            return time;
        }
        return null;
    }
    /** The smallest amount of time that is resolved within Replayer's percision */
    private static TemporalEpsilon = 0.001;
}
