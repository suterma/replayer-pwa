/** Implements a DTO for a progress message
 * @remarks This is used to provide feedback for running processes
 */
export class ProgressMessage {
    Message = '';
    Percentage = 0;

    /** Creates a new progress message.
     * @param [percentage=0] The value is rounded to the nearest integer.
     */
    constructor(message: string, percentage: number = 0) {
        this.Message = message;
        this.Percentage = Math.round(percentage);
    }
}
