import type { ICue } from './ICue';

/** Implements a Replayer cue
 *  @inheritdoc */

export class Cue implements ICue {
    /**   @inheritdoc */
    Description = '';
    /**   @inheritdoc */
    Id = '';
    /**   @inheritdoc */
    Shortcut: string | null = null;
    /**   @inheritdoc */
    Time: number | null = null;
    /**   @inheritdoc */
    Duration: number | null = null;

    /** Creates a new cue
     */
    constructor(
        description: string,
        shortcut: string | null,
        time: number | null,
        duration: number | null,
        id: string,
    ) {
        this.Description = description;
        this.Shortcut = shortcut;
        this.Time = time;
        this.Duration = duration;
        this.Id = id;
    }

    /** Returns a new, empty cue
     */
    static empty(): Cue {
        return new Cue('', '', 0, 0, '');
    }
}
