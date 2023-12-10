/** A playback mode for tracks and cues. */

export enum PlaybackMode {
    /** Play to the end of the track */
    PlayTrack = 'PlayTrack',
    /** Plays the track in a loop */
    LoopTrack = 'LoopTrack',
    /** Plays to the end of the cue */
    PlayCue = 'PlayCue',
    /** Plays the cue in a loop */
    LoopCue = 'LoopCue',
    /** Plays cues in a queue (EXPERIMENTAL)
     * @remarks Currently the queue lenght is only 2 (having current and next)
     */
    QueueCue = 'QueueCue',
    /** Plays all tracks of the compilation in a loop */
    LoopCompilation = 'LoopCompilation',
    /** Plays all tracks of the compilation in random order */
    ShuffleCompilation = 'ShuffleCompilation',
}
