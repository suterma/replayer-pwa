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

import type { ICue } from './ICue';

/** Implements a Replayer cue*/
export class Cue implements ICue {
    /**   @inheritdoc */
    Description: string | null = null;
    /**   @inheritdoc */
    Remarks: string | null = null;
    /**   @inheritdoc */
    Id = '';
    /**   @inheritdoc */
    Shortcut: string | null = null;
    /**   @inheritdoc */
    Time: number | null = null;
    /**   @inheritdoc */
    Duration: number | null = null;
    /**   @inheritdoc */
    OmitPreRoll: boolean = false;
    /**   @inheritdoc */
    OmitFadeIn: boolean = false;

    /** Creates a new cue
     */
    constructor(
        description: string | null,
        remarks: string | null,
        shortcut: string | null,
        time: number | null,
        duration: number | null,
        omitPreRoll: boolean,
        omitFadeIn: boolean,
        id: string,
    ) {
        this.Description = description;
        this.Remarks = remarks;
        this.Shortcut = shortcut;
        this.Time = time;
        this.Duration = duration;
        this.OmitPreRoll = omitPreRoll;
        this.OmitFadeIn = omitFadeIn;
        this.Id = id;
    }

    /** Returns a new, empty cue
     */
    static empty(): Cue {
        return new Cue(null, null, null, 0, 0, false, false, '');
    }
}
