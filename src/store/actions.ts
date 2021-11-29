import { ActionTree, ActionContext } from 'vuex';
import { State } from './state';
import { Mutations } from './mutations';
import { ActionTypes } from './action-types';
import { MutationTypes } from './mutation-types';
import PersistentStorage from './persistent-storage';
import CompilationParser from './compilation-parser';
import { MediaBlob, MediaUrl, RezMimeTypes } from './state-types';
import JSZip from 'jszip';

type AugmentedActionContext = {
    commit<K extends keyof Mutations>(
        key: K,
        payload: Parameters<Mutations[K]>[1],
    ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, 'commit'>;

/** Implements the actions for the store */
export interface Actions {
    // [ActionTypes.PLAY_TRACK](
    //     { commit }: AugmentedActionContext,
    //     payload: string,
    // ): Promise<string>;
    [ActionTypes.SET_COMPILATION_FROM_XML](
        { commit }: AugmentedActionContext,
        payload: string,
    ): void;
    [ActionTypes.SET_COMPILATION_FROM_PLIST](
        { commit }: AugmentedActionContext,
        payload: string,
    ): void;
    [ActionTypes.RETRIEVE_COMPILATION]({
        commit,
    }: AugmentedActionContext): void;
    [ActionTypes.ADD_MEDIA_BLOB](
        { commit }: AugmentedActionContext,
        payload: { fileName: string; blob: Blob },
    ): void;
    [ActionTypes.LOAD_FROM_URL](
        { commit }: AugmentedActionContext,
        url: string,
    ): void;
    [ActionTypes.LOAD_FROM_FILE](
        { commit }: AugmentedActionContext,
        file: File,
    ): void;
}
export const actions: ActionTree<State, State> & Actions = {
    // [ActionTypes.PLAY_TRACK]({ commit }) {
    //     return new Promise((resolve) => {
    //         setTimeout(() => {
    //             const data = 'action return value';
    //             commit(MutationTypes.PUSH_PROGRESS_MESSAGE, 'Playing track...');
    //             resolve(data);
    //         }, 500);
    //     });
    // },
    [ActionTypes.RETRIEVE_COMPILATION]({ commit }) {
        console.debug('RETRIEVE_COMPILATION');
        commit(
            MutationTypes.PUSH_PROGRESS_MESSAGE,
            'Retrieving last compilation...',
        );
        PersistentStorage.retrieveCompilation()
            .then((compilation) => {
                commit(MutationTypes.REPLACE_COMPILATION, compilation);
            })
            .then(() => {
                //retrieve all blobs (which should also include the ones for the afore-loaded compilation)
                PersistentStorage.retrieveAllMediaBlobs()
                    .then((mediaBlobs) => {
                        mediaBlobs.forEach((mediaBlob) => {
                            const objectUrl = URL.createObjectURL(
                                mediaBlob.blob,
                            );
                            commit(
                                MutationTypes.ADD_MEDIA_URL,
                                new MediaUrl(mediaBlob.fileName, objectUrl),
                            );
                        });
                    })
                    .then(() => {
                        //Update the selected cue
                        PersistentStorage.retrieveSelectedCueId()
                            .then((cueId) => {
                                commit(
                                    MutationTypes.UPDATE_SELECTED_CUE_ID,
                                    cueId,
                                );
                            })
                            .finally(() => {
                                commit(
                                    MutationTypes.POP_PROGRESS_MESSAGE,
                                    undefined,
                                );
                            });
                    });
            });
    },
    [ActionTypes.SET_COMPILATION_FROM_XML]({ commit }, payload: any) {
        console.debug('actions::SET_COMPILATION_FROM_XML:payload', payload);

        const compilation = CompilationParser.parseFromXmlCompilation(
            payload.XmlCompilation,
        );
        commit(MutationTypes.REPLACE_COMPILATION, compilation);
        //Store persistently, but after committing, to keep the process faster
        PersistentStorage.storeCompilation(compilation);
    },

    [ActionTypes.SET_COMPILATION_FROM_PLIST]({ commit }, payload: any) {
        console.debug('actions::SET_COMPILATION_FROM_PLIST:payload', payload);

        const compilation =
            CompilationParser.parseFromPListCompilation(payload);
        commit(MutationTypes.REPLACE_COMPILATION, compilation);
        //Store persistently, but after committing, to keep the process faster
        PersistentStorage.storeCompilation(compilation);
    },

    [ActionTypes.ADD_MEDIA_BLOB]({ commit }, payload: MediaBlob) {
        console.debug(
            'actions::ADD_MEDIA_BLOB:payload-filename',
            payload.fileName,
        );

        const objectUrl = URL.createObjectURL(payload.blob);
        commit(
            MutationTypes.ADD_MEDIA_URL,
            new MediaUrl(payload.fileName, objectUrl),
        );
        //Store persistently, but after committing, to keep the process faster
        PersistentStorage.storeMediaBlob(payload);
    },

    .//TODO WIP check whether all these loading function actually work:
    //With xml, rex, bplist, ZIP
    //Then simplify by handling ZIP files separately, unzipping all files and recursively call this method

    [ActionTypes.LOAD_FROM_URL](
        { commit, dispatch }: AugmentedActionContext,
        url: string,
    ): void {
        commit(MutationTypes.PUSH_PROGRESS_MESSAGE, `Loading URL '${url}'...`);
        //TODO make URL to allow any charcter, including slashes etc...
        console.debug('RezLoader::loadUrl:url', url);
        fetch(url)
            .then((res) => res.blob()) // Gets the response and returns it as a blob
            .then((blob) => {
                // Here's where you get access to the blob
                // And you can use it for whatever you want
                const file = new File(
                    [blob],
                    url,
                    //TODO use the mime type from the response to determine the handling
                    // {
                    //     type: 'application/zip',
                    // }
                );
                dispatch(ActionTypes.LOAD_FROM_FILE, file).finally(() => {
                    commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
                });
            });
    },

    [ActionTypes.LOAD_FROM_FILE](
        { commit, dispatch }: AugmentedActionContext,
        file: File,
    ): void {
        commit(
            MutationTypes.PUSH_PROGRESS_MESSAGE,
            `Loading file ${file.name} (${file.size / 1000000}MB)`,
        );

        //Determine the file type
        if (
            file.name.toLowerCase().endsWith('.rez') ||
            file.name.toLowerCase().endsWith('.zip')
        ) {
            /** Loads the given file as a REZ package (Package of a Compilation and included media files)
             */

            commit(
                MutationTypes.PUSH_PROGRESS_MESSAGE,
                `Processing file: ${file.name}`,
            );
            // 1) read the Blob
            JSZip.loadAsync(file)
                .then(
                    (zip: JSZip) => {
                        zip.forEach(
                            (
                                _relativePath: string,
                                zipEntry: JSZip.JSZipObject,
                            ): void => {
                                commit(
                                    //Set the progress message, before using any of the async functions
                                    MutationTypes.PUSH_PROGRESS_MESSAGE,
                                    `Processing content: ${zipEntry.name}`,
                                );
                                zipEntry
                                    .async('nodebuffer')
                                    .then((content: Buffer): void => {
                                        //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
                                        const mediaFileName =
                                            zipEntry.name.normalize();

                                        if (mediaFileName.endsWith('.rex')) {
                                            CompilationParser.handleAsXmlCompilation(
                                                content,
                                            ).then((compilation) => {
                                                dispatch(
                                                    ActionTypes.SET_COMPILATION_FROM_XML,
                                                    compilation,
                                                ).finally(() => {
                                                    commit(
                                                        MutationTypes.POP_PROGRESS_MESSAGE,
                                                        undefined,
                                                    );
                                                });
                                            });
                                        } else if (
                                            mediaFileName.endsWith('.mp3')
                                        ) {
                                            const mediaBlob =
                                                CompilationParser.handleAsMediaFromContent(
                                                    mediaFileName,
                                                    content,
                                                    RezMimeTypes.AUDIO_MP3,
                                                );
                                            dispatch(
                                                ActionTypes.ADD_MEDIA_BLOB,
                                                mediaBlob,
                                            ).finally(() => {
                                                commit(
                                                    MutationTypes.POP_PROGRESS_MESSAGE,
                                                    undefined,
                                                );
                                            });
                                        }
                                        //Is a LivePlayback playlist?
                                        if (
                                            mediaFileName
                                                .toLowerCase()
                                                .endsWith('.bplist') ||
                                            mediaFileName
                                                .toLowerCase()
                                                .endsWith('playlist')
                                        ) {
                                            const unarchivedObject =
                                                CompilationParser.handleAsLivePlaybackPlaylist(
                                                    content,
                                                );

                                            dispatch(
                                                ActionTypes.SET_COMPILATION_FROM_PLIST,
                                                unarchivedObject,
                                            ).finally(() => {
                                                commit(
                                                    MutationTypes.POP_PROGRESS_MESSAGE,
                                                    undefined,
                                                );
                                            });
                                        }
                                    })
                                    .finally(() => {
                                        commit(
                                            MutationTypes.POP_PROGRESS_MESSAGE,
                                            undefined,
                                        );
                                    });
                            },
                        );
                    },
                    function (e) {
                        console.error(
                            `un-ZIP: Error reading ${file.name}: ${e.message}`,
                        );
                    },
                )
                .finally(() => {
                    commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
                });
        } else if (
            file.name.toLowerCase().endsWith('.rex') ||
            file.name.toLowerCase().endsWith('.xml')
        ) {
            /** Loads the given file as a REX compilation (XML metadata only)
             * @remarks Media files could later be retrieved by trying to download with the metadata info or by explicit file selection by the user
             */
            commit(
                MutationTypes.PUSH_PROGRESS_MESSAGE,
                `Loading .rex file '${file.name}'`,
            );

            const reader = new FileReader();
            reader.onload = () => {
                const content = Buffer.from(reader.result as string);
                CompilationParser.handleAsXmlCompilation(content).then(
                    (compilation) => {
                        dispatch(
                            ActionTypes.SET_COMPILATION_FROM_XML,
                            compilation,
                        ).finally(() => {
                            commit(
                                MutationTypes.POP_PROGRESS_MESSAGE,
                                undefined,
                            );
                        });
                    },
                );
            };
            reader.onerror = (): void => {
                console.error(
                    'Failed to read file ' + file.name + ': ' + reader.error,
                );
                reader.abort(); // (...does this do anything useful in an onerror handler?)
            };
            reader.readAsText(file);
        } else if (file.name.toLowerCase().endsWith('.mp3')) {
            dispatch(
                ActionTypes.ADD_MEDIA_BLOB,
                new MediaBlob(file.name, file),
            );
        }
        //Is a LivePlayback playlist?
        else if (
            file.name.toLowerCase().endsWith('.bplist') ||
            file.name.toLowerCase().endsWith('playlist')
        ) {
            /** Loads the given file as a Livelayback playlist (iOS binary property list)
             * @remarks Media files could later be retrieved by trying to download with the metadata info or by explicit file selection by the user
             */
            commit(
                MutationTypes.PUSH_PROGRESS_MESSAGE,
                `Loading LivePlayback file '${file.name}'`,
            );
            const reader = new FileReader();

            reader.onload = () => {
                const content = Buffer.from(reader.result as ArrayBuffer);
                const unarchivedObject =
                    CompilationParser.handleAsLivePlaybackPlaylist(content);

                dispatch(
                    ActionTypes.SET_COMPILATION_FROM_PLIST,
                    unarchivedObject,
                ).finally(() => {
                    commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
                });
            };
            reader.onerror = (): void => {
                console.error(
                    'Failed to read file ' + file.name + ': ' + reader.error,
                );
                reader.abort(); // (...does this do anything useful in an onerror handler?)
            };
            reader.readAsArrayBuffer(file);
        } else {
            console.warn("Unsupported file, not loaded: '" + file.name + "'");
        }
    },
};
