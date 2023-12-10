import { MediaUrl } from '../types';
import { Compilation } from '../Compilation';
import { PlaybackMode } from '../PlaybackMode';
import CompilationHandler from '../compilation-handler';
import { useLocalStorage } from '@vueuse/core';
import { ref } from 'vue';

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

    /** The currently scheduled cue Id, if any, otherwise CompilationHandler.EmptyId.
     * This is NOT used to determine the currently active track.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     * @remarks Set to CompilationHandler.EmptyId, when no cue should be considered scheduled.
     * @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    scheduledCueId: useLocalStorage(
        'scheduledCueId',
        CompilationHandler.EmptyId,
    ),

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

    /** A dictionary of stored media URLs, representing playable media content from local or unzipped resources.
     * @remarks A name for the resource is used as key, preventing duplicate files for the same content.
     * This is intentionally not persisted, to avoid using disposed object URL's after an app restart.
     */
    mediaUrls: ref(new Map<string, MediaUrl>()),

    /** Whether to use global app shortcuts
     * @remarks This can be used to temporarily pause global app shortcuts
     * in favor of use within modal or other dialogs.
     */
    useAppShortcuts: useLocalStorage('useAppShortcuts', true),

    /** The previous acknowledged version.
     * @remarks Used to let the user acknowledge (and internally handle) any new version
     */
    acknowledgedVersion: useLocalStorage(
        'acknowledgedVersion',
        null as string | null,
    ),

    /** The playback mode.
     * @remarks This can be set by the user, and is persisted.
     */
    playbackMode: useLocalStorage(
        'playbackMode',
        PlaybackMode.PlayTrack as PlaybackMode,
    ),

    /** The fading enabled state.
     * @remarks This can be set by the user, and is persisted.
     */
    isFadingEnabled: useLocalStorage('isFadingEnabled', true),

    /** The pre-roll enabled state.
     * @remarks This can be set by the user, and is persisted.
     */
    isPreRollEnabled: useLocalStorage('isPreRollEnabled', true),
};
