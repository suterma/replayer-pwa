import { type ITrack } from '../ITrack';
import CompilationHandler from '../compilation-handler';
import { state } from './state';
import { getters } from './getters';
import { actions } from './actions';
import { nextTick } from 'vue';
import { useAudioStore } from '../audio';
import { useSettingsStore } from '../settings';
import useLog from '@/composables/LogComposable';

const { log } = useLog();

/** Playback actions using the tracks from the application state with their media handlers.
 * @privateRemarks The actions in this specific file might later be implemented
 * separately in their own IMediaHandler store.
 */
export const mediaActions = {

    /** Skips to the next media track (from the currently selected track) and plays it.
     * @remarks Depending on the playback mode, loops back to the first of the set of media tracks.
     * @remarks Follows the option "AutoSeekToFirstCue", if set and a cue is availabe.
     */
    playNextTrack(): void {
        const nextTrack = mediaActions.getNextTrackById(
            state.selectedTrackId.value,
            getters.isLoopingPlaybackMode.value,
        );
        if (nextTrack) {
            const firstCue = actions.updateSelectedTrackId(nextTrack.Id);
            const handler = useAudioStore().getMediaHandlerByTrackId(nextTrack.Id);

            if (firstCue && firstCue.Time != null && useSettingsStore().autoSeekToFirstCue) {
                log.debug('Auto-Seeking in next track to first cue at: ', firstCue.Time);
                handler?.playFrom(firstCue.Time, firstCue.OmitFadeIn);
            }
            else {
                handler?.playFrom(0, true /* do not by default fade at the beginning of tracks*/ );
            }
        }
    },
    /** Skips to the previous media track (from the currently selected track) and plays it.
     * @remarks Depending on the playback mode, loops back to the last of the set of media tracks.
     * @remarks Follows the option "AutoSeekToFirstCue", if set and a cue is availabe.
     */
    playPreviousTrack(): void {
        const previousTrack = mediaActions.getPreviousTrackById(
            state.selectedTrackId.value,
            getters.isLoopingPlaybackMode.value,
        );
        if (previousTrack) {
            const firstCue = actions.updateSelectedTrackId(previousTrack.Id);
            const handler = useAudioStore().getMediaHandlerByTrackId(previousTrack.Id);

            if (firstCue && firstCue.Time != null && useSettingsStore().autoSeekToFirstCue) {
                log.debug('Auto-Seeking in previous track to first cue at: ', firstCue.Time);
                handler?.playFrom(firstCue.Time, firstCue.OmitFadeIn);
            }
            else {
                handler?.playFrom(0, true /* do not by default fade at the beginning of tracks*/ );
            }
        }
    },

    /** Gets the previous media track, if any, in the compilation, by it's Id.
     * @remarks Optionally supports looping back to the end of the compilation, if the end was reached.
     * @param trackId - The Id of the track to find the previous of
     * @param loop - When true, and the previous track is not defined, the last track is returned.
     * */
    getPreviousTrackById(trackId: string, loop = false): ITrack | undefined {
        const tracks = getters.mediaTracks.value;
        if (tracks) {
            const allTrackIds = tracks?.map((track) => track.Id);
            const indexOfSelected = CompilationHandler.getIndexOfTrackById(tracks, trackId);
            if (allTrackIds && indexOfSelected !== undefined) {
                const prevTrackId = allTrackIds[indexOfSelected - 1];
                if (prevTrackId) {
                    return tracks.find((t) => t.Id === prevTrackId);
                } else if (loop) {
                    const lastTrackId = allTrackIds[allTrackIds.length - 1];
                    if (lastTrackId) {
                        return tracks.find((t) => t.Id === lastTrackId);
                    }
                }
            }
        }
    },

    /** Gets the next media track, if any, in the compilation, by it's Id.
     * @remarks Optionally supports looping back to the beginning of the compilation, if the end was reached.
     * @param trackId - The Id of the track to find the next of
     * @param loop - When true, and the next track is not defined, the first track is returned.
     * */
    getNextTrackById(trackId: string, loop = false): ITrack | undefined {
        const tracks = getters.mediaTracks.value;

        if (tracks) {
            const allTrackIds = tracks?.map((track) => track.Id);
            const indexOfSelected = CompilationHandler.getIndexOfTrackById(tracks, trackId);
            if (allTrackIds && indexOfSelected !== undefined) {
                const nextTrackId = allTrackIds[indexOfSelected + 1];
                if (nextTrackId) {
                    return tracks.find((t) => t.Id === nextTrackId);
                } else if (loop) {
                    const firstTrackId = allTrackIds[0];
                    if (firstTrackId) {
                        return tracks.find((t) => t.Id === firstTrackId);
                    }
                }
            }
        }
    },

    /** Skips to this track (if loaded)
     * @remarks If the track is not loaded, does nothing.
     * If the track is not yet the active track, tries to activate the track and play.
     * If it's the active track, just toggles play/pause
     * @privateRemarks Conditional event registration inside the template did not work.
     */
    skipToPlayPause(trackId: string): void {
        const handler = useAudioStore().getMediaHandlerByTrackId(trackId);

        if (handler) {
            const canPlay = handler.canPlay;

            if (canPlay) {
                if (!(getters.activeTrackId.value === trackId)) {
                    const firstCue = actions.updateSelectedTrackId(trackId);

                    // TODO actually only use the nextTick/Timeout combination code below for videos, and not when the iOS condition is set.
                    // For videos, since the track's viewport might be hidden in the DOM,
                    // let it first become un-hidden.
                    nextTick(() => {
                        // To account for the slide-in transition wait the
                        // complete transition duration
                        // This delay prevents error messages for video tracks, when the video
                        // element hast the native controls enabled,
                        // but is not completely visible yet
                        setTimeout(() => {
                            if (firstCue && firstCue.Time != null && useSettingsStore().autoSeekToFirstCue) {
                                log.debug('Auto-Seeking in skipped-to track to first cue at: ', firstCue.Time);
                                handler?.playFrom(firstCue.Time, firstCue.OmitFadeIn);
                            }
                            else {
                                handler?.playFrom(0, true /* do not by default fade at the beginning of tracks*/ );
                            }
                        }, 300 /*replayer-transition-duration*/);
                    });
                } else {
                    handler?.togglePlayback();
                }
            }
        } else {
            log.warn(`mediaActions::skipToPlayPause:track=${trackId};MediaHandler not available`);
        }
    },
};
