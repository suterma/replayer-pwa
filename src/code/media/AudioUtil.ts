/** @class Utility functions for audio handling
 */
export default class AudioUtil {
    /** Get a displayable text message from a MediaError
     * @remarks A null error returns the empty string
     */
    public static getDisplayText(error: MediaError | null): string {
        switch (error?.code) {
            case MediaError.MEDIA_ERR_ABORTED: {
                return 'MEDIA_ERR_ABORTED';
            }
            case MediaError.MEDIA_ERR_NETWORK: {
                return 'MEDIA_ERR_NETWORK';
            }
            case MediaError.MEDIA_ERR_DECODE: {
                return 'MEDIA_ERR_DECODE';
            }

            case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED: {
                return 'MEDIA_ERR_SRC_NOT_SUPPORTED';
            }
            case null: {
                return '';
            }
            default: {
                return 'Unknown media error';
            }
        }
    }

    /** Get a representation of the input value as dBFS, where
     * full scale is the value 1.
     */
    public static getDeciBelFullScale(value: number): number {
        const deciBels = 20 * Math.log10(value);
        return deciBels;
    }
}
