import { ActionTree, ActionContext } from 'vuex';
import { State } from './state';
import { Mutations } from './mutations';
import { ActionTypes } from './action-types';
import { MutationTypes } from './mutation-types';
import PersistentStorage from './persistent-storage';
import CompilationParser from './compilation-parser';
import { MediaBlob, MediaUrl, RezMimeTypes } from './state-types';
import JSZip from 'jszip';
import { ObjectUrlHandler } from '@/code/storage/ObjectUrlHandler';
import CompilationHandler from './compilation-handler';
import FileSaver from 'file-saver';
import FileHandler from './filehandler';

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
    ): Promise<string>;
    [ActionTypes.LOAD_FROM_FILE](
        { commit }: AugmentedActionContext,
        file: File,
    ): Promise<void>;
    [ActionTypes.DOWNLOAD_REX_FILE]({ commit }: AugmentedActionContext): void;
    [ActionTypes.DOWNLOAD_REZ_PACKAGE]({
        commit,
    }: AugmentedActionContext): void;
    [ActionTypes.UPDATE_COMPILATION_TITLE](
        { commit }: AugmentedActionContext,
        title: string,
    ): void;
    [ActionTypes.UPDATE_TRACK_DATA](
        { commit }: AugmentedActionContext,
        payload: { trackId: string; name: string },
    ): void;
    [ActionTypes.UPDATE_CUE_DATA](
        { commit }: AugmentedActionContext,
        payload: {
            cueId: string;
            description: string;
            shortcut: string;
            time: number;
        },
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
        console.debug('actions::RETRIEVE_COMPILATION');
        commit(
            MutationTypes.PUSH_PROGRESS_MESSAGE,
            'Retrieving last compilation...',
        );

        //retrieving the compilation first, to display it to the user ASAP
        PersistentStorage.retrieveCompilation().then((compilation) => {
            commit(MutationTypes.REPLACE_COMPILATION, compilation);

            PersistentStorage.retrieveSelectedCueId().then((cueId) => {
                //retrieve all available blobs into object urls
                //(which should actually be the matching media blobs for the afore-loaded compilation)
                PersistentStorage.retrieveAllMediaBlobs()
                    .then((mediaBlobs) => {
                        //Sort to the active track first (the one, what contains the selected cue)
                        const activeTrack = CompilationHandler.getActiveTrack(
                            compilation,
                            cueId,
                        );
                        const sortedBlobs =
                            CompilationHandler.sortByFirstFileName(
                                mediaBlobs,
                                activeTrack?.Url,
                            );

                        sortedBlobs.forEach((mediaBlob, index) => {
                            //NOTE: Setting an increasing timeout for each blob retrieval
                            //here makes the loading work properly for more than a few
                            //media blobs on an Android Fairphone 3+. Otherwise most
                            //(not all) the blobs are corrupted and
                            //not playable by the audio element.
                            //The exact reasion is unknown, but might be excessive
                            //memory consumption when the object URL's are created
                            //synchronously or too fast in a row.
                            //This problem does only occur on larger compilations.
                            //The current timeout of 150ms has been empirically found to work reliably
                            //on a Fairphone 3+ with the "Family21" test compilation.
                            setTimeout(() => {
                                const objectUrl =
                                    ObjectUrlHandler.createObjectURL(
                                        mediaBlob.blob,
                                        mediaBlob.fileName,
                                    );
                                commit(
                                    MutationTypes.ADD_MEDIA_URL,
                                    new MediaUrl(mediaBlob.fileName, objectUrl),
                                );
                            }, (index + 1) * 150);
                        });

                        //Update the selected cue now
                        //HINT: This must be done last, otherwise the scrolling feature to the
                        //the active track does not work properly, because the track that would be
                        //scrolled to, would still be in the collapsed state. This would
                        //lead to an undesired offset, when the track is at the end of the visible area.
                        commit(MutationTypes.UPDATE_SELECTED_CUE_ID, cueId);
                    })
                    .finally(() => {
                        commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
                    });
            });
        });
    },

    [ActionTypes.ADD_MEDIA_BLOB]({ commit }, mediaBlob: MediaBlob) {
        console.debug(
            'actions::ADD_MEDIA_BLOB:mediaBlob-filename',
            mediaBlob.fileName,
        );

        const objectUrl = ObjectUrlHandler.createObjectURL(
            mediaBlob.blob,
            mediaBlob.fileName,
        );
        commit(
            MutationTypes.ADD_MEDIA_URL,
            new MediaUrl(mediaBlob.fileName, objectUrl),
        );
        //Store persistently, but after committing, to keep the process faster
        PersistentStorage.storeMediaBlob(mediaBlob);
    },
    //TODO WIP check whether all these loading function actually work:
    //With xml, rex, bplist, ZIP
    //Then simplify by handling ZIP files separately, unzipping all files and recursively call this method

    [ActionTypes.LOAD_FROM_URL](
        { commit, dispatch }: AugmentedActionContext,
        url: string,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!FileHandler.isValidHttpUrl(url)) {
                commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
                reject(`Provided input is not a valid URL: '${url}'`);
                return;
            }

            commit(
                MutationTypes.PUSH_PROGRESS_MESSAGE,
                `Loading URL '${url}'...`,
            );
            console.debug('RezLoader::loadUrl:url', url);
            fetch(url).then((response) => {
                if (!response.ok) {
                    commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
                    reject(
                        `Network response while fetching URL '${url}' was not OK`,
                    );
                    return;
                }
                //Use the final (possibly redirected URL for the next time)
                //TODO test on real life URL whether this works reliably...
                const finalUrl = new URL(response.url);
                console.debug('RezLoader::loadUrl:response', response);
                response.blob().then((blob) => {
                    const mimeType = FileHandler.getMimeType(
                        finalUrl,
                        response,
                    );

                    //Check whether MIME Type is supported
                    if (!FileHandler.isSupportedMimeType(mimeType)) {
                        commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
                        reject(
                            `Content MIME type '${mimeType}' is not supported`,
                        );
                        return;
                    }
                    const localResourceName =
                        FileHandler.getLocalResourceName(finalUrl);
                    const file = new File(
                        [blob],
                        localResourceName /* as name */,
                        {
                            type: mimeType ?? undefined,
                        },
                    );

                    dispatch(ActionTypes.LOAD_FROM_FILE, file)
                        .catch((errorMessage: string) => {
                            // commit(
                            //     MutationTypes.PUSH_ERROR_MESSAGE,
                            //     errorMessage,
                            // );
                            reject(errorMessage);
                        })
                        .finally(() => {
                            commit(
                                MutationTypes.POP_PROGRESS_MESSAGE,
                                undefined,
                            );
                            resolve(localResourceName);
                        });
                });
            });
        });
    },

    [ActionTypes.LOAD_FROM_FILE](
        { commit, dispatch }: AugmentedActionContext,
        file: File,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            commit(
                MutationTypes.PUSH_PROGRESS_MESSAGE,
                `Loading file '${file.name}' (${file.size / 1000000}MB)`,
            );

            //TODO handle the file types from buffer, and use the same methods for both from ZIP and from standalone content
            //THis simplifies the code and reduces redundancy
            //TODO then handle the progress messages properly, so that they stay until the very end when all files have properly loaded

            if (FileHandler.isSupportedPackageFile(file)) {
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
                                        `Processing ZIP content: ${zipEntry.name}`,
                                    );
                                    zipEntry
                                        .async('nodebuffer')
                                        .then((content: Buffer): void => {
                                            //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
                                            const zipEntryName =
                                                zipEntry.name.normalize();

                                            if (
                                                FileHandler.isXmlFileName(
                                                    zipEntryName,
                                                )
                                            ) {
                                                CompilationParser.handleAsXmlCompilation(
                                                    content,
                                                )
                                                    .then((compilation) => {
                                                        commit(
                                                            MutationTypes.REPLACE_COMPILATION_AND_SELECT_FIRST_CUE,
                                                            compilation,
                                                        );
                                                    })
                                                    .finally(() => {
                                                        commit(
                                                            MutationTypes.POP_PROGRESS_MESSAGE,
                                                            undefined,
                                                        );
                                                    });
                                            } else if (
                                                FileHandler.isSupportedMediaFileName(
                                                    zipEntryName,
                                                )
                                            ) {
                                                const mediaBlob =
                                                    CompilationParser.handleAsMediaContent(
                                                        zipEntryName,
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
                                            } else if (
                                                FileHandler.isBplistFileName(
                                                    zipEntryName,
                                                )
                                            ) {
                                                CompilationParser.handleAsLivePlaybackPlaylist(
                                                    content,
                                                )
                                                    .then((compilation) => {
                                                        commit(
                                                            MutationTypes.REPLACE_COMPILATION_AND_SELECT_FIRST_CUE,
                                                            compilation,
                                                        );
                                                    })
                                                    .finally(() => {
                                                        commit(
                                                            MutationTypes.POP_PROGRESS_MESSAGE,
                                                            undefined,
                                                        );
                                                    });
                                            } else {
                                                console.warn(
                                                    `un-ZIP: Unknown content type for filename: ${file.name}`,
                                                );
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
                        resolve();
                    });
            } else if (FileHandler.isXmlFile(file)) {
                const reader = new FileReader();
                reader.onload = () => {
                    const content = Buffer.from(reader.result as string);
                    CompilationParser.handleAsXmlCompilation(content)
                        .then((compilation) => {
                            commit(
                                MutationTypes.REPLACE_COMPILATION_AND_SELECT_FIRST_CUE,
                                compilation,
                            );
                        })
                        .finally(() => {
                            commit(
                                MutationTypes.POP_PROGRESS_MESSAGE,
                                undefined,
                            );
                            resolve();
                        });
                };
                reader.onerror = (): void => {
                    console.error(
                        'Failed to read file ' +
                            file.name +
                            ': ' +
                            reader.error,
                    );
                    reader.abort(); // (...does this do anything useful in an onerror handler?)
                };
                reader.readAsText(file);
            } else if (FileHandler.isSupportedMediaFile(file)) {
                dispatch(
                    ActionTypes.ADD_MEDIA_BLOB,
                    new MediaBlob(file.name, file),
                ).finally(() => {
                    commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
                    resolve();
                });
            } else if (FileHandler.isBplistFileName(file.name)) {
                const reader = new FileReader();

                reader.onload = () => {
                    const content = Buffer.from(reader.result as ArrayBuffer);
                    CompilationParser.handleAsLivePlaybackPlaylist(content)
                        .then((compilation) => {
                            commit(
                                MutationTypes.REPLACE_COMPILATION_AND_SELECT_FIRST_CUE,
                                compilation,
                            );
                        })
                        .finally(() => {
                            commit(
                                MutationTypes.POP_PROGRESS_MESSAGE,
                                undefined,
                            );
                            resolve();
                        });
                };
                reader.onerror = (): void => {
                    console.error(
                        'Failed to read file ' +
                            file.name +
                            ': ' +
                            reader.error,
                    );
                    reader.abort(); // (...does this do anything useful in an onerror handler?)
                };
                reader.readAsArrayBuffer(file);
            } else {
                commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
                reject(`Unsupported file, not loaded: '${file.name}'`);
            }
        });
    },
    [ActionTypes.DOWNLOAD_REX_FILE]({
        commit,
        getters,
    }: AugmentedActionContext): void {
        commit(MutationTypes.PUSH_PROGRESS_MESSAGE, `Downloading REX file...`);

        const compilation = getters.compilation;
        const xml = CompilationParser.convertToXml(compilation);
        const blob = new Blob([xml], {
            type: 'text/xml;charset=utf-8',
        });
        FileSaver.saveAs(blob, `${compilation?.Title}.rex`);

        commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
    },
    [ActionTypes.DOWNLOAD_REZ_PACKAGE]({
        commit,
        getters,
    }: AugmentedActionContext): void {
        commit(MutationTypes.PUSH_PROGRESS_MESSAGE, `Downloading REZ file...`);

        //Get the XML first
        const compilation = getters.compilation;
        const xml = CompilationParser.convertToXml(compilation);
        const blob = new Blob([xml], {
            type: 'text/xml;charset=utf-8',
        });

        //Then get the blobs from the storage
        //(which should actually be the matching media blobs for the compilation)
        PersistentStorage.retrieveAllMediaBlobs().then((mediaBlobs) => {
            //Pack everything into the ZIP file
            const zip = new JSZip();
            zip.file(`${compilation?.Title}.rex`, blob);

            mediaBlobs.forEach((mediaBlob) => {
                zip.file(mediaBlob.fileName, mediaBlob.blob);
            });

            //Save as the REZ package
            zip.generateAsync({ type: 'blob' })
                .then(function (content) {
                    FileSaver.saveAs(content, `${compilation?.Title}.rez`);
                })
                .finally(() => {
                    commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
                });
        });
    },
    [ActionTypes.UPDATE_COMPILATION_TITLE](
        { commit }: AugmentedActionContext,
        title: string,
    ): void {
        commit(
            MutationTypes.PUSH_PROGRESS_MESSAGE,
            `Updating compilation title...`,
        );
        commit(MutationTypes.UPDATE_COMPILATION_TITLE, title);
        commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
    },
    [ActionTypes.UPDATE_TRACK_DATA](
        { commit }: AugmentedActionContext,
        payload: {
            trackId: string;
            name: string;
            artist: string;
            album: string;
        },
    ): void {
        commit(MutationTypes.PUSH_PROGRESS_MESSAGE, `Updating track...`);
        commit(MutationTypes.UPDATE_TRACK_DATA, payload);
        commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
    },
    [ActionTypes.UPDATE_CUE_DATA](
        { commit }: AugmentedActionContext,
        payload: {
            cueId: string;
            description: string;
            shortcut: string;
            time: number;
        },
    ): void {
        commit(MutationTypes.PUSH_PROGRESS_MESSAGE, `Updating cue...`);
        commit(MutationTypes.UPDATE_CUE_DATA, payload);
        commit(MutationTypes.POP_PROGRESS_MESSAGE, undefined);
    },
};
