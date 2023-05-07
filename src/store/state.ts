import { MediaUrl } from './state-types';
import { Compilation, PlaybackMode } from './compilation-types';
import CompilationHandler from './compilation-handler';
import { useLocalStorage } from '@vueuse/core';

/** Implements the state of this application */
export const state = {
    /** A compilation to work with
     *@devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    compilation: useLocalStorage('compilation', Compilation.empty()),

    /** The currently selected cue Id, if any, otherwise CompilationHandler.EmptyId.
     * This is also used to determine the currently active track.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     * @remarks Set to CompilationHandler.EmptyId, when no cue should be considered selected.
     * @remarks To determine which track is active, when a cue is selected, it always takes precedence
     * over a possibly selected track
     * (selectedTrackId should be CompilationHandler.EmptyId in this case anyway.)
     * If no cue is selected, selectedTrackId is used to determine the active track.
     * @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    selectedCueId: useLocalStorage('selectedCueId', CompilationHandler.EmptyId),

    /** The currently selected track Id, if any, otherwise CompilationHandler.EmptyId.
     * This is also used to determine the currently active track.
     * This serves as alternative when no selected cue Id is set.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     * @remarks Set to CompilationHandler.EmptyId, when no track should be considered selected.
     * @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    selectedTrackId: useLocalStorage(
        'selectedTrackId',
        CompilationHandler.EmptyId,
    ),

    /** A dictionary of media URLs, representing playable media content
     * @remarks A name for the resource is used as key, preventing duplicate files for the same content.
     * For online URL's: a simplified resource name, derived from the URL;
     * For files: the full name (including a possible path) of the original media file (from the disk or from within a REZ/ZIP-file) */
    mediaUrls: useLocalStorage('mediaUrls', new Map<string, MediaUrl>()),

     /** Whether to use global app shortcuts
     * @remarks This can be used to temporarily pause global app shortcuts
     * in favor of use within modal or other dialogs.
     */
    useAppShortcuts: useLocalStorage('useAppShortcuts', true),
    /** The playback mode.
     * @remarks This can be set by the user, and is persisted.
     */
    playbackMode: useLocalStorage('playbackMode', PlaybackMode.PlayTrack),
};
