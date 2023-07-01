import { ITimeSignature } from "./ITimeSignature";
import { MetricalPosition } from "./MetricalPosition";

/** @class Static functions for the musical meter
 */
export class Meter {

    /** Converts the total seconds into a displayable measure/beats format,
     * according to the application settings,
     * if a suitable input value is provided.
     * @param seconds - The current playhead position in [seconds]
     * @param origin - The origin of the beat (time of first beat) in [seconds]
     * @param beatsPerMinute - The number of beats per minute (will be converted to beats per seconds internally)
     * @param seconds - The time signature numerator
     * @param numerator - The time signature numerator
     * @param denominator - The time signature denominator
     * @return The measure/beats representation or a placeholder.
     */
    public static convertToMeasureTime(
        seconds: number | null | undefined,
        origin: number,
        beatsPerMinute: number,
        timeSignature: ITimeSignature,
    ): string {
        const metricalPosition = this.convertToMetricalPosition(
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

    /** Converts the total seconds into a metrical position
    * if a suitable input value is provided.
    * @param seconds - The current playhead position in [seconds]
    * @param origin - The origin of the beat (time of first beat) in [seconds]
    * @param beatsPerMinute - The number of beats per minute
    * @param seconds - The time signature numerator
    * @param timeSignature - The time signature
    * @return The metrical position or null
    */
    public static convertToMetricalPosition(
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
            const shiftedTime = seconds - origin;

            const signature =
                timeSignature.Numerator / timeSignature.Denominator;

            const beat = shiftedTime * (beatsPerMinute / 60) * signature;

            const pinnedBeat = (_.floor(beat));

            const measureNumber =
                pinnedBeat / timeSignature.Numerator +
                1; /* Measures are index-one based */

            const beatInMeasureNumber =
                (pinnedBeat % timeSignature.Numerator) +
                1; /* Beats are index-one based */
            console.debug(
                `measureNumber: ${measureNumber};beat:${beatInMeasureNumber}`,
            );

            // Never show measures below index 1, but count the beats nonetheless
            if (shiftedTime < 0) {
                const beatInMeasureNumber =
                    ((pinnedBeat + 1) % timeSignature.Numerator)
                /* Beats are index-one based */
                const pinnedBeatInMeasureNumber = beatInMeasureNumber;

                return new MetricalPosition(
                    null,
                    pinnedBeatInMeasureNumber + (timeSignature.Numerator)
                );
            }

            return new MetricalPosition(
                measureNumber,
                beatInMeasureNumber,
            );
        }

        return null;
    }

    /** Converts a metrical position in a temporal position,
     * if a suitable input value is provided.
     * @param metricalPosition - The metrical position to convert from
     * @param origin - The origin of the beat (time of first beat) in [seconds]
     * @param beatsPerMinute - The number of beats per minute
     * @param seconds - The time signature numerator
     * @param timeSignature - The time signature
     * @return The temporal position or null
     */
    public static convertFromMetricalPosition(
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
            return origin + time + 0.001;
        }
        return null;
    }

}
