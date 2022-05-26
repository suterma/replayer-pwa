import { MutationTree } from 'vuex';
import {
    Compilation,
    Cue,
    ICompilation,
    ICue,
    ITrack,
    PlaybackMode,
    Track,
} from './compilation-types';
import { MutationTypes } from './mutation-types';
import { State } from './state';
import { MediaUrl, Settings } from './state-types';
import PersistentStorage from './persistent-storage';
import { ObjectUrlHandler } from '@/code/storage/ObjectUrlHandler';
import CompilationHandler from './compilation-handler';
import { v4 as uuidv4 } from 'uuid';

export type Mutations<S = State> = {
    [MutationTypes.PUSH_PROGRESS](state: S, payload: string): void;
    [MutationTypes.POP_PROGRESS](state: S): void;
    [MutationTypes.PUSH_ERROR](state: S, payload: string): void;
    [MutationTypes.POP_ERROR](state: S): void;
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
    [MutationTypes.CLONE_TRACK](state: S, trackId: string): void;
    [MutationTypes.REASSIGN_CUE_SHORTCUTS](state: S, trackId: string): void;
    [MutationTypes.DISCARD_COMPILATION](state: S): void;
    [MutationTypes.REVOKE_ALL_MEDIA_URLS](state: State): void;
    [MutationTypes.UPDATE_SETTINGS](state: S, settings: Settings): void;
    [MutationTypes.UPDATE_COMPILATION_TITLE](state: State, title: string): void;
    [MutationTypes.UPDATE_TRACK_DATA](
        state: State,
        payload: {
            trackId: string;
            name: string;
            artist: string;
            album: string;
        },
    ): void;
    [MutationTypes.UPDATE_TRACK_PLAYBACK_MODE](
        state: State,
        payload: {
            trackId: string;
            playbackMode: PlaybackMode;
        },
    ): void;
    [MutationTypes.UPDATE_TRACK_URL](
        state: State,
        payload: { trackId: string; url: string },
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
    [MutationTypes.PUSH_PROGRESS](state: State, message: string) {
        state.progressMessageStack.push(message);
        console.log('PROGRESS: ' + message);
    },
    [MutationTypes.PUSH_ERROR](state: State, message: string) {
        state.errorMessageStack.push(message);
        console.error('ERROR: ' + message);
    },
    [MutationTypes.POP_PROGRESS](state: State) {
        const message = state.progressMessageStack.pop();
        console.debug('POP_PROGRESS: ' + message);
    },
    [MutationTypes.POP_ERROR](state: State) {
        const message = state.errorMessageStack.pop();
        console.debug('POP_ERROR: ' + message);
    },
    [MutationTypes.FINISH_PROGRESS](state: State) {
        state.progressMessageStack.length = 0;
        console.debug('FINISH_PROGRESS');
    },

    [MutationTypes.ADD_MEDIA_URL](state: State, mediaUrl: MediaUrl): void {
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

            //If any track uses this media, remove the now stale duration
            const compilation = state.compilation;
            const matchingTrack = compilation.Tracks.find(
                (t) => t.Url === mediaUrl.resourceName,
            );
            if (matchingTrack) {
                matchingTrack.Duration = null;
            }
        }

        //Keep the others and add the new one
        console.debug('mutations::ADD_MEDIA_URL:', mediaUrl.resourceName);
        state.mediaUrls.set(mediaUrl.resourceName, mediaUrl);
    },

    [MutationTypes.ADD_TRACK](state: State, track: ITrack) {
        console.debug('mutations::ADD_TRACK:', track);

        //Use the fisrt cue, if it exists (and has an Id)
        let firstCueId = track.Cues[0]?.Id;

        if (!firstCueId) {
            //Add a first cue
            const nextShortcut = CompilationHandler.getNextShortcut(
                state.compilation as ICompilation,
            );

            const time = 0;
            firstCueId = uuidv4();
            const cue = new Cue(
                '',
                nextShortcut.toString(),
                time,
                null,
                firstCueId,
            );
            track.Cues.push(cue);
        }
        //Use the track, plus the cue as the selected cue
        state.compilation.Tracks.push(track);
        state.selectedCueId = firstCueId;
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
            const firstCueId = cues[0]?.Id ?? null;

            state.selectedCueId = firstCueId;
        }

        state.compilation = compilation;

        //Add the (non-blob) media URL's from the compilation to the media storage
        const onlineMediaUrls =
            CompilationHandler.getOnlineMediaUrls(compilation);
        onlineMediaUrls.forEach((mediaUrl) => {
            state.mediaUrls.set(mediaUrl.resourceName, mediaUrl);
        });
    },
    [MutationTypes.UPDATE_SELECTED_CUE_ID](state: State, cueId: string) {
        state.selectedCueId = cueId;
    },

    [MutationTypes.UPDATE_CUE_DURATIONS](
        state: State,
        payload: { trackId: string; trackDurationSeconds: number },
    ): void {
        //console.debug('mutations::UPDATE_CUE_DURATIONS:payload', payload);
        const trackDuration = payload.trackDurationSeconds;
        const track = CompilationHandler.getTrackById(
            state.compilation,
            payload.trackId,
        );
        //console.debug('mutations::UPDATE_CUE_DURATIONS:track', track);

        if (track) {
            track.Duration = trackDuration;
            // console.debug(
            //     'mutations::UPDATE_CUE_DURATIONS: track.Duration',
            //     track.Duration,
            // );
            CompilationHandler.updateCueDurations(track.Cues, trackDuration);
        }
    },

    [MutationTypes.REMOVE_TRACK](state: State, trackId: string) {
        const trackToRemove = CompilationHandler.getTrackById(
            state.compilation,
            trackId,
        );
        const currentlySelectedCueId = state.selectedCueId;
        trackToRemove?.Cues.forEach((cue) => {
            if (currentlySelectedCueId === cue.Id) {
                /* unselect cue, this track is no longer the active track */
                const noSelectedCueId = '';
                state.selectedCueId = noSelectedCueId;
            }
        });

        state.compilation.Tracks = state.compilation.Tracks.filter(
            (track) => track.Id !== trackId,
        );
    },

    [MutationTypes.CLONE_TRACK](state: State, trackId: string) {
        const sourceTrack = CompilationHandler.getTrackById(
            state.compilation,
            trackId,
        );

        if (sourceTrack) {
            const clonedTrack = Track.fromJson(JSON.stringify(sourceTrack));
            clonedTrack.Cues = clonedTrack.Cues.map((cue) => {
                return new Cue(
                    cue.Description,
                    cue.Shortcut,
                    cue.Time,
                    cue.Duration,
                    cue.Id,
                );
            });

            //Now, in the clone, reassign all variable items, like id's and shortcuts
            let nextShortcut = CompilationHandler.getNextShortcut(
                state.compilation,
            );
            clonedTrack.Id = uuidv4();
            clonedTrack.Name = sourceTrack.Name + ' (cloned)';
            clonedTrack.Cues.forEach((cue) => {
                cue.Id = uuidv4();
                cue.Shortcut = (nextShortcut++).toString();
            });

            //Insert just after original
            const index = state.compilation.Tracks.indexOf(sourceTrack);
            state.compilation.Tracks.splice(index + 1, 0, clonedTrack);
        }
    },
    [MutationTypes.REASSIGN_CUE_SHORTCUTS](state: State, trackId: string) {
        console.debug('mutations::REASSIGN_CUE_SHORTCUTS:trackId', trackId);

        const track = CompilationHandler.getTrackById(
            state.compilation,
            trackId,
        );

        if (track) {
            let seed = parseInt(track.Cues[0]?.Shortcut ?? '');
            if (seed) {
                track.Cues.forEach((cue) => {
                    cue.Shortcut = (seed++).toString();
                });
            }
        }
    },
    [MutationTypes.MOVE_TRACK_UP](state: State, trackId: string) {
        const moveIndex = CompilationHandler.getIndexOfTrackById(
            state.compilation,
            trackId,
        );

        //Swap the items
        const targetIndex = moveIndex - 1;
        [
            state.compilation.Tracks[targetIndex],
            state.compilation.Tracks[moveIndex],
        ] = [
            state.compilation.Tracks[moveIndex] as ITrack,
            state.compilation.Tracks[targetIndex] as ITrack,
        ];
    },

    [MutationTypes.MOVE_TRACK_DOWN](state: State, trackId: string) {
        const moveIndex = CompilationHandler.getIndexOfTrackById(
            state.compilation,
            trackId,
        );

        //Swap the items
        const targetIndex = moveIndex + 1;
        [
            state.compilation.Tracks[targetIndex],
            state.compilation.Tracks[moveIndex],
        ] = [
            state.compilation.Tracks[moveIndex] as ITrack,
            state.compilation.Tracks[targetIndex] as ITrack,
        ];
    },

    [MutationTypes.DISCARD_COMPILATION](state: State) {
        PersistentStorage.clearCompilation();
        state.compilation = Compilation.empty();

        /* unselect cue, none is selected anymore */
        const noSelectedCueId = '';
        state.selectedCueId = noSelectedCueId;

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
        state.settings = settings;
    },
    [MutationTypes.UPDATE_COMPILATION_TITLE](
        state: State,
        title: string,
    ): void {
        state.compilation.Title = title;
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
        }
    },
    [MutationTypes.UPDATE_TRACK_PLAYBACK_MODE](
        state: State,
        payload: {
            trackId: string;
            playbackMode: PlaybackMode;
        },
    ): void {
        const track = CompilationHandler.getTrackById(
            state.compilation,
            payload.trackId,
        );
        if (track) {
            track.PlaybackMode = payload.playbackMode;
        }
    },
    [MutationTypes.UPDATE_TRACK_URL](
        state: State,
        payload: {
            trackId: string;
            url: string;
        },
    ): void {
        const track = CompilationHandler.getTrackById(
            state.compilation,
            payload.trackId,
        );
        if (track) {
            track.Url = payload.url;
            //The duration is now stale, since the new track will have it's own duration, so remove it
            track.Duration = null;
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
        }
    },
};
