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

import { MediaUrl } from '../types';
import { Compilation } from '../Compilation';
import { PlaybackMode } from '../PlaybackMode';
import CompilationHandler from '../compilation-handler';
import { useLocalStorage } from '@vueuse/core';
import { ref } from 'vue';
import type { ICompilation } from '../ICompilation';

/** Implements the state of this application */
export const state = {
    /** A compilation to work with
     * @devdoc An initial, non-null value must be available, otherwise the reactive system does not work
     * @devdoc To always provide a typed object as expected, explicitly serialize to and from JSON strings */
    compilation: useLocalStorage<ICompilation>(
        'compilation',
        Compilation.empty(),
        {
            serializer: {
                read: (stringified: any) =>
                    stringified
                        ? Compilation.fromJson(stringified)
                        : Compilation.empty(),
                write: (compilation: ICompilation) =>
                    CompilationHandler.stringify(compilation),
            },
        },
    ),

    /** The currently selected cue Id, if any, otherwise CompilationHandler.EmptyId.
     * This is also used to determine the currently active track.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     * Set to CompilationHandler.EmptyId, when no cue should be considered selected.
     * To determine which track is active, when a cue is selected, it always takes precedence
     * over a possibly selected track
     * (selectedTrackId should be CompilationHandler.EmptyId in this case anyway).
     * If no cue is selected, selectedTrackId is used to determine the active track.
     * @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    selectedCueId: useLocalStorage('selectedCueId', CompilationHandler.EmptyId),

    /** The currently scheduled cue Id, if any, otherwise CompilationHandler.EmptyId.
     * This is NOT used to determine the currently active track.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     * Set to CompilationHandler.EmptyId, when no cue should be considered scheduled.
     * @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    scheduledCueId: useLocalStorage(
        'scheduledCueId',
        CompilationHandler.EmptyId,
    ),

    /** The currently selected track Id, if any, otherwise CompilationHandler.EmptyId.
     * This is also used to determine the currently active track.
     * This serves as alternative when no selected cue Id is set.
     * @remarks This does not control the playback itself. It is intended for display purposes.
     * Set to CompilationHandler.EmptyId, when no track should be considered selected.
     * @devdoc An initial, non-null value must be available, otherwise the reactive system does not work */
    selectedTrackId: useLocalStorage(
        'selectedTrackId',
        CompilationHandler.EmptyId,
    ),

    /** A dictionary of stored media URLs, representing playable media content from local or unzipped resources.
     * @remarks A name for the resource is used as key, preventing duplicate files for the same content.
     * @devdoc This is intentionally not persisted, to avoid using disposed object URL's after an app restart.
     */
    mediaUrls: ref(new Map<string, MediaUrl>()),

    /** Whether to use global app shortcuts
     * @remarks This can be used to temporarily pause global app shortcuts
     * in favor of use within modal or other dialogs.
     * @devdoc This is intentionally not persisted, because it's temporay only.
     */
    useAppShortcuts: ref(true),

    /** The previous acknowledged version.
     * @remarks Used to let the user acknowledge (and internally handle) any new version
     */
    acknowledgedVersion: useLocalStorage(
        'acknowledgedVersion',
        null as string | null,
    ),

    /** The current playback mode.
     * @remarks This can be set by the user, and is persisted.
     */
    playbackMode: useLocalStorage<PlaybackMode>(
        'playbackMode',
        PlaybackMode.PlayTrack as PlaybackMode,
    ),

    /** The pre-roll enabled state.
     * @remarks This can be set by the user, and is persisted.
     */
    isPreRollEnabled: useLocalStorage('isPreRollEnabled', true),

    /** A seed for the deterministic shuffling (until next shuffling is requested)
     * @remarks Reshuffling occurs when the PlaybackMode is toggled to ShuffleCompilation.
     * @devdoc This allows to keep the shuffled order for the duration of the shuffle mode
     */
    shuffleSeed: 1,
};
