/** Implements a DTO for an input feedback message
 * @remarks This is used to provide user feedback for received control input like
 * cue mnemonic or transport commands
 */
export class InputFeedback {
    /** The input data
     * @remarks Typically a single or multiple letters, representing received keyboard input
     */
    Data = '';
    /** A very short description of the action that the input data represents
     * or what the system expects next, like a terminating key-
     */
    Action = '';

    /** Creates a new input feedback.
     */
    constructor(data: string, action: string) {
        this.Data = data;
        this.Action = action;
    }
}
