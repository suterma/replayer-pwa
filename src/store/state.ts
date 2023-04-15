import { MediaUrl } from './state-types';
import { Compilation, ICompilation } from './compilation-types';
import CompilationHandler from './compilation-handler';

/** Defines the state of this application */
interface IState {
    /** A compilation to work with
     */
    compilation: ICompilation;

    /** A dictionary of media URLs, representing playable media content
     * @remarks A name for the resource is used as key, preventing duplicate files for the same content.
     * For online URL's: a simplified resource name, derived from the URL;
     * For files: the full name (including a possible path) of the original media file (from the disk or from within a REZ/ZIP-file) */
    mediaUrls: Map<string, MediaUrl>;

    /** The currently selected cue Id, if any, otherwise CompilationHandler.EmptyId.
     * This is also used to determine the currently active track.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     * @remarks Set to CompilationHandler.EmptyId, when no cue should be considered selected.
     * @remarks To determine which track is active, when a cue is selected, it always takes precedence
     * over a possibly selected track
     * (selectedTrackId should be CompilationHandler.EmptyId in this case anyway.)
     * If no cue is selected, selectedTrackId is used to determine the active track.
     */
    selectedCueId: string;

    /** The currently selected track Id, if any, otherwise CompilationHandler.EmptyId.
     * This is also used to determine the currently active track.
     * This serves as alternative when no selected cue Id is set.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     * @remarks Set to CompilationHandler.EmptyId, when no track should be considered selected.
     */
    selectedTrackId: string;

    /** An application work message stack, used for progress indication
     * @remarks during ongoing work, the stack is non-empty
     */
    progressMessageStack: Array<string>;

    /** An application error message stack, used for error indication
     * @remarks during unacknowledged errors, the stack is non-empty
     */
    errorMessageStack: Array<string>;

    /** Whether to use global app shortcuts
     * @remarks This can be used to temporarily pause global app shortcuts
     * in favor of use within modal or other dialogs.
     */
    useAppShortcuts: boolean;
}

export const state: IState = {
    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    compilation: Compilation.empty(),

    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    selectedCueId: CompilationHandler.EmptyId,

    /** @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */

    selectedTrackId: CompilationHandler.EmptyId,

    mediaUrls: new Map<string, MediaUrl>(),

    progressMessageStack: new Array<string>(),

    errorMessageStack: new Array<string>(),

    useAppShortcuts: true,
};

export type State = typeof state;
