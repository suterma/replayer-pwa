/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import { Cue } from '../Cue';
import { Track } from '../Track';
import { Compilation } from '../Compilation';
import { type ICue } from '../ICue';
import { type ICompilation } from '../ICompilation';
import { PlaybackMode } from '../PlaybackMode';
import { type ITrack } from '../ITrack';
import CompilationHandler from '../compilation-handler';
import { state } from './state';
import { v4 as uuidv4 } from 'uuid';

import { ObjectUrlHandler } from '@/code/storage/ObjectUrlHandler';
//@ts-ignore (because the file-saver does not provide types)
import FileSaver from 'file-saver';
import PersistentStorage from '../persistent-storage';
import JSZip from 'jszip';
import { MediaBlob, MediaUrl } from '../types';
import FileHandler from '../filehandler';
import CompilationParser from '../../code/xml/XmlCompilationParser';
import { useMessageStore } from '../messages';
import type { IMeter } from '@/code/music/IMeter';
import { getters } from './getters';
import { actions } from './actions';
import type { IMediaHandler } from '@/code/media/IMediaHandler';

/** Playback actions using the the tracks from the application state with their media handlers.
 * @remarks These actions require the presence of an IMediaHandler on
 * the involved tracks.
 * @devdoc The actions in this specific file might later be implemented
 * separately in their own IMediaHandler store.
 */

export const mediaActions = {
    /** Skips to the next media track (from the currently selected track) and plays it.
     * @remarks Depending on the playback mode, loops back to the first of the set of media tracks.
     */
    playNextTrack(): void {
        const nextTrack = CompilationHandler.getNextTrackById(
            getters.mediaTracks.value,
            state.selectedTrackId.value,
            getters.isLoopingPlaybackMode.value,
        );
        if (nextTrack) {
            actions.updateSelectedTrackId(nextTrack.Id);
            nextTrack.MediaHandler?.playFrom(0);
        }
    },
    /** Skips to the previous media track (from the currently selected track) and plays it.
     * @remarks Depending on the playback mode, loops back to the last of the set of media tracks.
     */
    playPreviousTrack(): void {
        const nextTrack = CompilationHandler.getPreviousTrackById(
            getters.mediaTracks.value,
            state.selectedTrackId.value,
            getters.isLoopingPlaybackMode.value,
        );
        if (nextTrack) {
            actions.updateSelectedTrackId(nextTrack.Id);
            nextTrack.MediaHandler?.playFrom(0);
        }
    },

    /** Sets the media handler for an existing track.
     */
    setMediaHandlerForTrack(track: ITrack, handler: IMediaHandler): void {
        track.MediaHandler = handler;
    },
};
