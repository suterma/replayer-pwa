
import _ from 'lodash';
import { ITimeSignature } from "./ITimeSignature";
import { MetricalPosition } from "./MetricalPosition";

/** @class Static functions for the musical meter
 */
export class Meter {

    /** Converts the time (in total seconds) into a displayable measure/beats format,
     * according to the meter,
     * if a suitable input value is provided.
     * @param seconds - The temporal position in [seconds]
     * @param origin - The origin of the beat (time of first beat) in [seconds]
     * @param beatsPerMinute - The number of beats per minute (will be converted to beats per seconds internally)
     * @param seconds - The time signature numerator
     * @param numerator - The time signature numerator
     * @param denominator - The time signature denominator
     * @return The measure/beats representation or a placeholder.
     */
    public static toMeasureDisplay(
        seconds: number | null | undefined,
        origin: number,
        beatsPerMinute: number,
        timeSignature: ITimeSignature,
    ): string {
        const metricalPosition = this.fromTime(
            seconds,
            origin,
            beatsPerMinute,
            timeSignature,
        );
        if (metricalPosition && metricalPosition.Measure) {
            // set fixed integral digits
            let measureNumberPrefix = '';
            if (metricalPosition.Measure < 100) {
                measureNumberPrefix += '0';
            }
            if (metricalPosition.Measure < 10) {
                measureNumberPrefix += '0';
            }

            return `${measureNumberPrefix}${metricalPosition.Measure}|${metricalPosition.Beat}`;
        } else if (metricalPosition && metricalPosition.Beat) {
            return `---|${metricalPosition.Beat}`;
        }

        return '---|-';
    }

    /** Converts a temporal position (in total seconds within a track) into a metrical position
    * if a suitable input value is provided.
    * @param seconds - The temporal position to convert in [seconds]
    * @param origin - The temporal position of the (declared) first beat in [seconds]
    * @param beatsPerMinute - The number of beats per minute
    * @param timeSignature - The time signature
    * @return The metrical position or null
    */
    public static fromTime(
        seconds: number | null | undefined,
        origin: number,
        beatsPerMinute: number,
        timeSignature: ITimeSignature,
    ): MetricalPosition | null {
        if (
            seconds != null &&
            Number.isFinite(seconds) &&
            Number.isFinite(origin) &&
            timeSignature &&
            timeSignature.Numerator &&
            timeSignature.Denominator
        ) {

            // get the time relative to the teporal position of the declared first beat
            const shiftedTime = seconds - origin;

            const signatureValue =
                timeSignature.Numerator / timeSignature.Denominator;

            const beat = shiftedTime * (beatsPerMinute / 60) * signatureValue;

            const beatNumber = _.floor(
                beat);

            const measureNumber = _.floor(
                beatNumber / timeSignature.Numerator +
                1 /* Measures are index-one based */);

            const beatInMeasureNumber =
                (beatNumber % timeSignature.Numerator) +
                1; /* Beats in measures are index-one based */

            // Never show measures below index 1, but count the beats nonetheless
            if (shiftedTime < 0) {
                const beatInMeasureNumber =
                    ((beatNumber + 1) % timeSignature.Numerator)
                /* Beats are index-one based */
                const beatNumberInMeasureNumber = beatInMeasureNumber;

                return new MetricalPosition(
                    null,
                    beatNumberInMeasureNumber + (timeSignature.Numerator)
                );
            }

            return new MetricalPosition(
                measureNumber,
                beatInMeasureNumber,
            );
        }

        return null;
    }

    /** Converts a metrical position into a temporal position (within a track),
     * if a suitable input value is provided.
     * @param metricalPosition - The metrical position to convert from
     * @param origin - The temporal position of the (declared) first beat in [seconds]
     * @param beatsPerMinute - The number of beats per minute
     * @param timeSignature - The time signature
     * @return The temporal position in seconds or null
     */
    public static toTime(
        metricalPosition: MetricalPosition | null,
        origin: number,
        beatsPerMinute: number,
        timeSignature: ITimeSignature,
    ): number | null {
        if (
            metricalPosition &&
            metricalPosition.Measure &&
            Number.isFinite(origin) &&
            timeSignature &&
            timeSignature.Numerator &&
            timeSignature.Denominator
        ) {
            // the position in beats, into the track
            // NOTE: beats here is zero-based, whereas the metrical position data is one-based
            const beats =
                (metricalPosition.Measure - 1) * timeSignature.Numerator;
            const time = (beats / beatsPerMinute) * 60;

            // Use epsilon to make sure the temporal position is never earlier than the calculated position for the beat.
            return origin + time + Meter.TemporalEpsilon;
        }
        return null;
    }
    /** The smallest amount of time that is resolved within Replayer's percision */
    private static TemporalEpsilon = 0.001;
}
