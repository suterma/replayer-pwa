/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

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
