import { MediaUrl, Settings } from './state-types';
import { Compilation, ICompilation } from './compilation-types';

/** Defines the state of this application */
interface IState {
    /** A compilation to work with
     */
    compilation: ICompilation;

    /** A dictionary of media URLs, representing playable media files
     * @remarks the media file path is used as key, preventing duplicate files for the same content.
     */
    mediaUrls: Map<string, MediaUrl>;

    /** The currently selected cue Id, if any. This is also used to determine the currently active track.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     * @remarks Set to null, when no cue should be considered selected.
     * @remarks To determine which track is active, when a cue is selected, it always takes precedence
     * over a possibly selected track
     * (selectedTrackId should be null in this case anyway.)
     * If no cue is selected, selectedTrackId is used to determine the active track.
     */
    selectedCueId: string | null;

    /** The currently selected track Id, if any. This is also used to determine the currently active track.
     * This serves as alternative when no selected cue Id is set.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     * @remarks Set to null, when no track should be considered selected.
     */
    selectedTrackId: string | null;

    /** An application work message stack, used for progress indication
     * @remarks during ongoing work, the stack is non-empty
     */
    progressMessageStack: Array<string>;

    /** An application error message stack, used for error indication
     * @remarks during unacknowledged errors, the stack is non-empty
     */
    errorMessageStack: Array<string>;

    settings: Settings;
}

export const state: IState = {
    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    compilation: Compilation.empty(),

    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    selectedCueId: '',

    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */

    selectedTrackId: '',

    mediaUrls: new Map<string, MediaUrl>(),

    progressMessageStack: new Array<string>(),

    errorMessageStack: new Array<string>(),

    settings: Settings.default(),
};

export type State = typeof state;
