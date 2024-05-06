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
import { nextTick } from 'vue';

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

    /** Skips to this track (if loaded)
     * @remarks If the track is not loaded, does nothing.
     * If the track is not yet the active track, tries to activate the track and play.
     * If it's the active track, just toggles play/pause
     * @devdoc Conditional event registration inside the template did not work.
     */
    skipToPlayPause(track: ITrack): void {
        if (track.MediaHandler?.canPlay) {
            getters.activeTrackId;
            if (!(getters.activeTrackId.value === track.Id)) {
                actions.updateSelectedTrackId(track.Id);

                // Since the track's viewport might be hidden in the DOM,
                // let it first become un-hidden.
                nextTick(() => {
                    // To account for the slide-in transition wait the
                    // complete transition duration
                    // This delay prevents error messages for video tracks, when the video
                    // element hast the native controls enabled,
                    // but is not completely visible yet
                    setTimeout(
                        () => track.MediaHandler?.play(),
                        300 /*replayer-transition-duration*/,
                    );
                });
            } else {
                track.MediaHandler?.togglePlayback();
            }
        }
    },
};
