import { MutationTree } from 'vuex';
import {
    Compilation,
    Cue,
    ICompilation,
    ICue,
    ITrack,
} from './compilation-types';
import { MutationTypes } from './mutation-types';
import { State } from './state';
import { MediaUrl, Settings } from './state-types';
import PersistentStorage from './persistent-storage';
import { ObjectUrlHandler } from '@/code/storage/ObjectUrlHandler';
import CompilationHandler from './compilation-handler';
import { v4 as uuidv4 } from 'uuid';

export type Mutations<S = State> = {
    [MutationTypes.PUSH_PROGRESS_MESSAGE](state: S, payload: string): void;
    [MutationTypes.POP_PROGRESS_MESSAGE](state: S): void;
    [MutationTypes.PUSH_ERROR_MESSAGE](state: S, payload: string): void;
    [MutationTypes.POP_ERROR_MESSAGE](state: S): void;
    [MutationTypes.FINISH_PROGRESS](state: State): void;
    [MutationTypes.ADD_MEDIA_URL](state: S, mediaUrl: MediaUrl): void;
    [MutationTypes.ADD_TRACK](state: S, track: ITrack): void;
    [MutationTypes.ADD_CUE](
        state: State,
        payload: { trackId: string; cue: ICue },
    ): void;

    [MutationTypes.DELETE_CUE](state: State, cueId: string): void;

    [MutationTypes.REPLACE_COMPILATION](
        state: S,
        compilation: ICompilation,
    ): void;
    [MutationTypes.REPLACE_COMPILATION_AND_SELECT_FIRST_CUE](
        state: S,
        compilation: ICompilation,
    ): void;
    [MutationTypes.UPDATE_SELECTED_CUE_ID](state: S, cueId: string): void;
    [MutationTypes.UPDATE_CUE_DURATIONS](
        state: S,
        payload: { trackId: string; trackDurationSeconds: number },
    ): void;
    [MutationTypes.REMOVE_TRACK](state: S, trackId: string): void;
    [MutationTypes.CLOSE_COMPILATION](state: S): void;
    [MutationTypes.REVOKE_ALL_MEDIA_URLS](state: State): void;
    [MutationTypes.UPDATE_SETTINGS](state: S, settings: Settings): void;
    [MutationTypes.RETRIEVE_SETTINGS](state: S): void;
    [MutationTypes.UPDATE_COMPILATION_TITLE](state: State, title: string): void;
    [MutationTypes.UPDATE_TRACK_DATA](
        state: State,
        payload: { trackId: string; name: string },
    ): void;
    [MutationTypes.UPDATE_CUE_DATA](
        state: State,
        payload: {
            cueId: string;
            description: string;
            shortcut: string;
            time: number;
        },
    ): void;
};

export const mutations: MutationTree<State> & Mutations = {
    [MutationTypes.PUSH_PROGRESS_MESSAGE](state: State, message: string) {
        state.progressMessageStack.push(message);
        console.log('PROGRESS: ' + message);
    },
    [MutationTypes.PUSH_ERROR_MESSAGE](state: State, message: string) {
        state.errorMessageStack.push(message);
        console.error('ERROR: ' + message);
    },
    [MutationTypes.POP_PROGRESS_MESSAGE](state: State) {
        const message = state.progressMessageStack.pop();
        console.debug('POP_PROGRESS_MESSAGE: ' + message);
    },
    [MutationTypes.POP_ERROR_MESSAGE](state: State) {
        const message = state.errorMessageStack.pop();
        console.debug('POP_ERROR_MESSAGE: ' + message);
    },
    [MutationTypes.FINISH_PROGRESS](state: State) {
        state.progressMessageStack.length = 0;
        console.debug('FINISH_PROGRESS');
    },

    [MutationTypes.ADD_MEDIA_URL](state: State, mediaUrl: MediaUrl) {
        //Remove any previously matching, even it was the same object, because
        //the caller has already create a new one for this mediaUrl's blob.
        const matchingFile = state.mediaUrls.get(mediaUrl.resourceName);
        if (matchingFile) {
            console.debug(
                'mutations::ADD_MEDIA_URL:removing matching item for key:',
                mediaUrl.resourceName,
            );
            ObjectUrlHandler.revokeObjectURL(matchingFile.url);
            state.mediaUrls.delete(mediaUrl.resourceName);

            //TODO maybe remove the track duration on unload?
        }

        //Keep the others and add the new one
        console.debug('mutations::ADD_MEDIA_URL:', mediaUrl.resourceName);
        state.mediaUrls.set(mediaUrl.resourceName, mediaUrl);
    },

    [MutationTypes.ADD_TRACK](state: State, track: ITrack) {
        console.debug('mutations::ADD_TRACK:', track);

        //Add a first cue first, then select it
        const nextShortcut = CompilationHandler.getNextShortcut(
            state.compilation as ICompilation,
        );

        const time = 0;
        const cueId = uuidv4();
        const cue = new Cue('', nextShortcut, time, null, cueId);

        track.Cues.push(cue);
        state.compilation.Tracks.push(track);
        state.selectedCueId = cueId;

        //Just add the track with no cues
        //state.compilation.Tracks.push(track);

        PersistentStorage.storeCompilation(state.compilation);
    },

    [MutationTypes.ADD_CUE](
        state: State,
        payload: { trackId: string; cue: ICue },
    ) {
        console.debug('mutations::ADD_CUE:', payload.trackId);
        const matchingTrack = CompilationHandler.getTrackById(
            state.compilation,
            payload.trackId,
        );
        if (matchingTrack) {
            console.debug('mutations::ADD_CUE:matchingTrack', matchingTrack);

            matchingTrack.Cues.push(payload.cue);

            //Sort the resulting set by time
            CompilationHandler.sort(matchingTrack.Cues);

            if (matchingTrack.Duration != null) {
                console.debug(
                    'mutations::ADD_CUE:matchingTrack.Duration',
                    matchingTrack.Duration,
                );
                CompilationHandler.updateCueDurations(
                    matchingTrack.Cues,
                    matchingTrack.Duration,
                );
            }

            PersistentStorage.storeCompilation(state.compilation);
        }
    },

    [MutationTypes.DELETE_CUE](state: State, cueId: string) {
        console.debug('mutations::DELETE_CUE:', cueId);
        const matchingTrack = CompilationHandler.getTrackByCueId(
            state.compilation,
            cueId,
        );
        if (matchingTrack) {
            const removeIndex = matchingTrack.Cues.map(
                (item) => item.Id,
            ).indexOf(cueId);

            ~removeIndex && matchingTrack.Cues.splice(removeIndex, 1);

            if (matchingTrack.Duration != null) {
                CompilationHandler.updateCueDurations(
                    matchingTrack.Cues,
                    matchingTrack.Duration,
                );
            }

            PersistentStorage.storeCompilation(state.compilation);
        }
    },

    [MutationTypes.REPLACE_COMPILATION](
        state: State,
        compilation: ICompilation,
    ) {
        console.debug(
            'mutations::REPLACE_COMPILATION:compilation',
            compilation,
        );

        state.compilation = compilation;
        PersistentStorage.storeCompilation(compilation);

        //Add the (non-blob) media URL's from the compilation to the media storage
        const onlineMediaUrls =
            CompilationHandler.getOnlineMediaUrls(compilation);
        onlineMediaUrls.forEach((mediaUrl) => {
            state.mediaUrls.set(mediaUrl.resourceName, mediaUrl);
        });
    },
    [MutationTypes.REPLACE_COMPILATION_AND_SELECT_FIRST_CUE](
        state: State,
        compilation: ICompilation,
    ) {
        console.debug(
            'mutations::REPLACE_COMPILATION_AND_SELECT_FIRST_CUE:compilation',
            compilation,
        );

        //find and commit the first cue
        if (compilation) {
            const tracks = compilation.Tracks;
            const cues = tracks.flatMap((track) => track.Cues);
            const firstCueId = cues[0]?.Id;

            state.selectedCueId = firstCueId;
            PersistentStorage.storeSelectedCueId(firstCueId);
        }

        state.compilation = compilation;
        PersistentStorage.storeCompilation(compilation);

        //Add the (non-blob) media URL's from the compilation to the media storage
        const onlineMediaUrls =
            CompilationHandler.getOnlineMediaUrls(compilation);
        onlineMediaUrls.forEach((mediaUrl) => {
            state.mediaUrls.set(mediaUrl.resourceName, mediaUrl);
        });
    },
    [MutationTypes.UPDATE_SELECTED_CUE_ID](state: State, cueId: string) {
        //Do not update the store, when it's the same value
        if (state.selectedCueId == cueId) {
            return;
        }
        state.selectedCueId = cueId;
        PersistentStorage.storeSelectedCueId(cueId);
    },

    [MutationTypes.UPDATE_CUE_DURATIONS](
        state: State,
        payload: { trackId: string; trackDurationSeconds: number },
    ): void {
        console.debug('mutations::UPDATE_CUE_DURATIONS:payload', payload);
        const trackDuration = payload.trackDurationSeconds;
        const track = CompilationHandler.getTrackById(
            state.compilation,
            payload.trackId,
        );
        console.debug('mutations::UPDATE_CUE_DURATIONS:track', track);

        if (track) {
            track.Duration = trackDuration;
            console.debug(
                'mutations::UPDATE_CUE_DURATIONS: track.Duration',
                track.Duration,
            );
            CompilationHandler.updateCueDurations(track.Cues, trackDuration);
        }
    },

    [MutationTypes.REMOVE_TRACK](state: State, trackId: string) {
        const trackToRemove = CompilationHandler.getTrackById(
            state.compilation,
            trackId,
        );
        trackToRemove?.Cues.forEach((cue) => {
            if (state.selectedCueId === cue.Id) {
                state.selectedCueId =
                    ''; /* unselect cue, this track is no longer the active track */
            }
        });

        state.compilation.Tracks = state.compilation.Tracks.filter(
            (track) => track.Id !== trackId,
        );
    },

    [MutationTypes.CLOSE_COMPILATION](state: State) {
        PersistentStorage.clearCompilation();

        state.selectedCueId = '';
        state.compilation = Compilation.empty();

        state.mediaUrls.forEach((mediaUrl) => {
            ObjectUrlHandler.revokeObjectURL(mediaUrl.url);
        });
        state.mediaUrls.clear();
    },
    [MutationTypes.REVOKE_ALL_MEDIA_URLS](state: State) {
        state.mediaUrls.forEach((mediaUrl) => {
            ObjectUrlHandler.revokeObjectURL(mediaUrl.url);
        });
        state.mediaUrls.clear();

        state.compilation.Tracks.forEach((track) => {
            track.Duration = null;
        });
    },
    /** Updates the application settings
     * @param state - The vuex state
     * @param settings - The application settings
     */
    [MutationTypes.UPDATE_SETTINGS](state: State, settings: Settings) {
        PersistentStorage.storeSettings(settings);
        state.settings = settings;
    },
    [MutationTypes.RETRIEVE_SETTINGS](state: State) {
        state.settings = PersistentStorage.retrieveSettings();
    },
    [MutationTypes.UPDATE_COMPILATION_TITLE](
        state: State,
        title: string,
    ): void {
        state.compilation.Title = title;
        PersistentStorage.storeCompilation(state.compilation);
    },
    [MutationTypes.UPDATE_TRACK_DATA](
        state: State,
        payload: {
            trackId: string;
            name: string;
            artist: string;
            album: string;
        },
    ): void {
        const track = CompilationHandler.getTrackById(
            state.compilation,
            payload.trackId,
        );
        if (track) {
            track.Name = payload.name;
            track.Artist = payload.artist;
            track.Album = payload.album;
            PersistentStorage.storeCompilation(state.compilation);
        }
    },
    [MutationTypes.UPDATE_CUE_DATA](
        state: State,
        payload: {
            cueId: string;
            description: string;
            shortcut: string;
            time: number;
        },
    ): void {
        const cue = CompilationHandler.getCueById(
            state.compilation,
            payload.cueId,
        );
        if (cue) {
            const hasChangedTime = cue.Time !== payload.time;

            cue.Description = payload.description;
            cue.Shortcut = payload.shortcut;
            cue.Time = payload.time;

            if (hasChangedTime) {
                const track = CompilationHandler.getTrackByCueId(
                    state.compilation,
                    payload.cueId,
                );

                if (track) {
                    //Sort by the updated time
                    CompilationHandler.sort(track.Cues);

                    if (track && track.Duration != null) {
                        CompilationHandler.updateCueDurations(
                            track.Cues,
                            track.Duration,
                        );
                    }
                }
            }

            PersistentStorage.storeCompilation(state.compilation);
        }
    },
};
