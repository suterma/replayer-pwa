import { ActionTree, ActionContext } from 'vuex';
import { State } from './state';
import { Mutations } from './mutations';
import { ActionTypes } from './action-types';
import { MutationTypes } from './mutation-types';
import PersistentStorage from './persistent-storage';
import CompilationParser from './compilation-parser';
import { MediaBlob, MediaUrl } from './state-types';
import JSZip from 'jszip';
import { ObjectUrlHandler } from '@/code/storage/ObjectUrlHandler';
import CompilationHandler from './compilation-handler';
import FileSaver from 'file-saver';
import FileHandler from './filehandler';
import { v4 as uuidv4 } from 'uuid';
import { Cue, ICompilation } from './compilation-types';
import { useSettingsStore } from './settings';

type AugmentedActionContext = {
    commit<K extends keyof Mutations>(
        key: K,
        payload: Parameters<Mutations[K]>[1],
    ): ReturnType<Mutations[K]>;
} & Omit<ActionContext<State, State>, 'commit'>;

/** Implements the actions for the store */
export interface Actions {
    [ActionTypes.DISCARD_COMPILATION]({ commit }: AugmentedActionContext): void;
    [ActionTypes.ADD_MEDIA_BLOB](
        { commit }: AugmentedActionContext,
        payload: { fileName: string; blob: Blob },
    ): void;
    [ActionTypes.REMOVE_TRACK](
        { commit }: AugmentedActionContext,
        trackId: string,
    ): void;
    [ActionTypes.CLONE_TRACK](
        { commit, getters }: AugmentedActionContext,
        trackId: string,
    ): void;
    [ActionTypes.LOAD_FROM_URL](
        { commit }: AugmentedActionContext,
        url: string,
    ): Promise<string>;
    [ActionTypes.USE_MEDIA_FROM_URL](
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
            time: number | null;
        },
    ): void;
    [ActionTypes.ADD_CUE](
        { commit }: AugmentedActionContext,
        payload: { trackId: string; time: number },
    ): void;
    [ActionTypes.DELETE_CUE](
        { commit }: AugmentedActionContext,
        cueId: string,
    ): void;
    [ActionTypes.RESET_APPLICATION]({ commit }: AugmentedActionContext): void;
}
export const actions: ActionTree<State, State> & Actions = {
    [ActionTypes.DISCARD_COMPILATION]({ commit }) {
        withProgress(`Discarding the compilation...`, commit, () => {
            commit(MutationTypes.DISCARD_COMPILATION, undefined);
        });
    },
    [ActionTypes.ADD_MEDIA_BLOB]({ commit }, mediaBlob: MediaBlob) {
        const objectUrl = ObjectUrlHandler.createObjectURL(
            mediaBlob.blob,
            mediaBlob.fileName,
        );
        const blobSize = mediaBlob.blob.size;
        const mediaType = mediaBlob.blob.type;
        commit(
            MutationTypes.ADD_MEDIA_URL,
            new MediaUrl(mediaBlob.fileName, objectUrl, blobSize, mediaType),
        );
        //Store persistently, but after committing, to keep the process faster
        PersistentStorage.storeMediaBlob(mediaBlob);
    },
    [ActionTypes.REMOVE_TRACK]({ commit }, trackId: string) {
        withProgress(`Removing track...`, commit, () => {
            commit(MutationTypes.REMOVE_TRACK, trackId);
        });
    },
    [ActionTypes.CLONE_TRACK]({ commit }, trackId: string) {
        withProgress(`Cloning track...`, commit, () => {
            commit(MutationTypes.CLONE_TRACK, trackId);
        });
    },
    [ActionTypes.LOAD_FROM_URL](
        { commit, dispatch }: AugmentedActionContext,
        url: string,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!FileHandler.isValidHttpUrl(url)) {
                return abort(
                    commit,
                    reject,
                    `Provided input is not a valid URL: '${url}'`,
                );
            }

            progress(commit, `Loading URL '${url}'...`);
            // HINT: Replayer expects CORS to be allowed here (no no-cors).
            // If the origin server doesn’t include the suitable
            // Access-Control-Allow-Origin response header, the request will fail
            fetch(url, {
                method: 'GET',
            })
                .then((response) => {
                    //Use the final (possibly redirected URL for the next time)
                    console.debug('LOAD_FROM_URL::response', response);

                    //Get the possibly redirected url
                    let finalUrl: URL;
                    if (response.redirected) {
                        finalUrl = new URL(response.url);
                    } else {
                        finalUrl = new URL(url);
                    }

                    if (
                        response.status ===
                        0 /* opaque response, in case no-cors would have been used */
                    ) {
                        return abort(
                            commit,
                            reject,
                            `Fetch has failed for URL: '${url}' due to disallowed CORS by the server. Please manually download the resource and load it from the file system.`,
                        );
                    } else if (!response.ok) {
                        return abort(
                            commit,
                            reject,
                            `Network response while fetching URL '${url}' was not 200 OK, but: '${response.status} ${response.statusText}'`,
                        );
                    }

                    response.blob().then((blob) => {
                        const mimeType = FileHandler.getResponseMimeType(
                            finalUrl,
                            response,
                        );

                        //Check whether MIME Type is supported
                        if (!FileHandler.isSupportedMimeType(mimeType)) {
                            return abort(
                                commit,
                                reject,
                                `Content MIME type '${mimeType}' is not supported`,
                            );
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
                            .then(() => {
                                resolve(localResourceName);
                                //The action is done, so terminate the progress
                                commit(MutationTypes.POP_PROGRESS, undefined);
                            })
                            .catch((errorMessage: string) => {
                                return abort(
                                    commit,
                                    reject,
                                    `Loading from the received resource file has failed for URL: '${url}' with the message: '${errorMessage}'`,
                                );
                            });
                    });
                })
                .catch((errorMessage: string) => {
                    return abort(
                        commit,
                        reject,
                        `Fetch has failed for URL: '${url}' with the message: '${errorMessage}'. Maybe the file is too large or the server does not allow CORS. If any of this is the case, manually download the resource and load it from the file system.`,
                    );
                });
        });
    },

    [ActionTypes.USE_MEDIA_FROM_URL](
        { commit }: AugmentedActionContext,
        url: string,
    ): Promise<string> {
        return new Promise((resolve, reject) => {
            if (!FileHandler.isValidHttpUrl(url)) {
                return abort(
                    commit,
                    reject,
                    `Provided input is not a valid media URL: '${url}'`,
                );
            }

            progress(commit, `Using URL '${url}'...`);
            const finalUrl = new URL(url);
            const localResourceName =
                FileHandler.getLocalResourceName(finalUrl);

            commit(
                MutationTypes.ADD_MEDIA_URL,
                new MediaUrl(localResourceName, url, null, null),
            );
            resolve(localResourceName);

            //The action is done, so terminate the progress
            commit(MutationTypes.POP_PROGRESS, undefined);
        });
    },

    [ActionTypes.LOAD_FROM_FILE](
        { commit, dispatch }: AugmentedActionContext,

        file: File,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            progress(
                commit,
                `Loading file '${file.name}' '${
                    file.type
                }' (${FileHandler.AsMegabytes(file.size)}MB)`,
            );
            if (FileHandler.isSupportedPackageFile(file)) {
                // 1) read the Blob
                JSZip.loadAsync(file)
                    .then(
                        (zip: JSZip) => {
                            //For performance reasons, explicitly process only expected files
                            const processables = zip.filter(
                                (relativePath /*, file*/) => {
                                    console.debug(
                                        'Filtering relativePath: ',
                                        relativePath,
                                    );
                                    if (
                                        FileHandler.isMacOsxResourceFork(
                                            relativePath,
                                        )
                                    ) {
                                        return false;
                                    }
                                    return (
                                        FileHandler.isSupportedCompilationFileName(
                                            relativePath,
                                        ) ||
                                        FileHandler.isSupportedMediaFileName(
                                            relativePath,
                                        )
                                    );
                                },
                            );

                            const hasCompilation = processables.some(
                                (zipFile /*, file*/) => {
                                    return FileHandler.isSupportedCompilationFileName(
                                        zipFile.name,
                                    );
                                },
                            );

                            processables.forEach(
                                (zipEntry: JSZip.JSZipObject): void => {
                                    //Set the progress message, before using any of the async functions
                                    progress(
                                        commit,
                                        `Processing ZIP entry: ${zipEntry.name}`,
                                    );
                                    zipEntry
                                        .async('nodebuffer')
                                        .then((content: Buffer): void => {
                                            //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
                                            const zipEntryName =
                                                zipEntry.name.normalize();
                                            progress(
                                                commit,
                                                `Processing content for ZIP entry '${zipEntryName}'...`,
                                            );

                                            if (
                                                FileHandler.isXmlFileName(
                                                    zipEntryName,
                                                )
                                            ) {
                                                CompilationParser.handleAsXmlCompilation(
                                                    content,
                                                )
                                                    .then((compilation) => {
                                                        compilation.Url =
                                                            file.name;
                                                        commit(
                                                            MutationTypes.REPLACE_COMPILATION,
                                                            compilation,
                                                        );
                                                    })
                                                    .finally(() => {
                                                        commit(
                                                            MutationTypes.POP_PROGRESS,
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
                                                    );
                                                dispatch(
                                                    ActionTypes.ADD_MEDIA_BLOB,
                                                    mediaBlob,
                                                )
                                                    .then(() => {
                                                        if (!hasCompilation) {
                                                            commit(
                                                                MutationTypes.ADD_DEFAULT_TRACK,
                                                                mediaBlob.fileName,
                                                            );
                                                        }
                                                    })
                                                    .finally(() => {
                                                        commit(
                                                            MutationTypes.POP_PROGRESS,
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
                                                            MutationTypes.REPLACE_COMPILATION,
                                                            compilation,
                                                        );
                                                    })
                                                    .finally(() => {
                                                        commit(
                                                            MutationTypes.POP_PROGRESS,
                                                            undefined,
                                                        );
                                                    });
                                            } else if (
                                                FileHandler.isSupportedPackageFileName(
                                                    zipEntryName,
                                                )
                                            ) {
                                                //We do not handle packages within packages.
                                                //HINT: Unfortunately JSZip seems to report the currently
                                                //open package as file within itself. This mitigates that.
                                                console.debug(
                                                    `ZIP: Not processing package file '${zipEntryName}' within package: '${file.name}'`,
                                                );
                                            } else if (
                                                FileHandler.isPath(zipEntryName)
                                            ) {
                                                //We do not handle paths on their own
                                                console.debug(
                                                    `ZIP: Not processing path '${zipEntryName}' within package: '${file.name}'`,
                                                );
                                            } else {
                                                console.warn(
                                                    `ZIP: Unknown content type for file '${zipEntryName}' within package: '${file.name}'`,
                                                );
                                            }
                                            commit(
                                                MutationTypes.POP_PROGRESS,
                                                undefined,
                                            );
                                        })
                                        .finally(() => {
                                            commit(
                                                MutationTypes.POP_PROGRESS,
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
                        commit(MutationTypes.POP_PROGRESS, undefined);
                        resolve();
                    });
            } else if (FileHandler.isXmlFile(file)) {
                const reader = new FileReader();
                reader.onload = () => {
                    const content = Buffer.from(reader.result as string);
                    CompilationParser.handleAsXmlCompilation(content)
                        .then((compilation) => {
                            compilation.Url = file.name;
                            commit(
                                MutationTypes.REPLACE_COMPILATION,
                                compilation,
                            );
                        })
                        .finally(() => {
                            commit(MutationTypes.POP_PROGRESS, undefined);
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
                    commit(MutationTypes.POP_PROGRESS, undefined);
                    resolve();
                });
            } else if (FileHandler.isBplistFileName(file.name)) {
                const reader = new FileReader();

                reader.onload = () => {
                    const content = Buffer.from(reader.result as ArrayBuffer);
                    CompilationParser.handleAsLivePlaybackPlaylist(content)
                        .then((compilation) => {
                            commit(
                                MutationTypes.REPLACE_COMPILATION,
                                compilation,
                            );
                        })
                        .finally(() => {
                            commit(MutationTypes.POP_PROGRESS, undefined);
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
                return abort(
                    commit,
                    reject,
                    `Unsupported content type for file '${file.name}', content was not processed.`,
                );
            }
        });
    },
    [ActionTypes.DOWNLOAD_REX_FILE]({
        commit,
        getters,
    }: AugmentedActionContext): void {
        progress(commit, `Downloading REX file...`);

        const compilation = getters.compilation;
        const xml = CompilationParser.convertToXml(compilation);
        const blob = new Blob([xml], {
            type: 'text/xml;charset=utf-8',
        });
        FileSaver.saveAs(blob, `${compilation?.Title}.rex`);

        commit(MutationTypes.POP_PROGRESS, undefined);
    },
    [ActionTypes.DOWNLOAD_REZ_PACKAGE]({
        commit,
        getters,
    }: AugmentedActionContext): void {
        progress(commit, `Downloading REZ file...`);

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
                    commit(MutationTypes.POP_PROGRESS, undefined);
                });
        });
    },
    [ActionTypes.UPDATE_COMPILATION_TITLE](
        { commit }: AugmentedActionContext,
        title: string,
    ): void {
        withProgress(`Updating compilation title...`, commit, () => {
            commit(MutationTypes.UPDATE_COMPILATION_TITLE, title);
        });
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
        withProgress(`Updating track...`, commit, () => {
            commit(MutationTypes.UPDATE_TRACK_DATA, payload);
        });
    },
    [ActionTypes.UPDATE_CUE_DATA](
        { commit }: AugmentedActionContext,
        payload: {
            cueId: string;
            description: string;
            shortcut: string;
            time: number | null;
        },
    ): void {
        if (payload.time != null && Number.isFinite(payload.time)) {
            payload.time = CompilationHandler.roundTime(payload.time);
        }
        commit(MutationTypes.UPDATE_CUE_DATA, payload);
    },
    [ActionTypes.ADD_CUE](
        { commit, getters }: AugmentedActionContext,
        payload: { trackId: string; time: number },
    ): void {
        withProgress(`Adding cue...`, commit, () => {
            const trackId = payload.trackId;
            const time = CompilationHandler.roundTime(payload.time);
            const nextShortcut = CompilationHandler.getNextShortcut(
                getters.compilation as ICompilation,
            );

            const cueId = uuidv4();
            const cue = new Cue('', nextShortcut.toString(), time, null, cueId);

            commit(MutationTypes.ADD_CUE, { trackId, cue });
            commit(MutationTypes.UPDATE_SELECTED_CUE_ID, cueId);
        });
    },
    [ActionTypes.DELETE_CUE](
        { commit }: AugmentedActionContext,
        cueId: string,
    ): void {
        withProgress(`Deleting cue...`, commit, () => {
            commit(MutationTypes.DELETE_CUE, cueId);
        });
    },
    [ActionTypes.RESET_APPLICATION]({ commit }: AugmentedActionContext): void {
        withProgress(`Resetting application...`, commit, () => {
            commit(MutationTypes.DISCARD_COMPILATION, undefined);
            useSettingsStore().$reset();
        });
    },
};

function withProgress(
    message: string,
    commit: <K extends keyof Mutations<State>>(
        key: K,
        payload: Parameters<Mutations<State>[K]>[1],
    ) => ReturnType<Mutations<State>[K]>,
    callee: () => void,
) {
    commit(MutationTypes.PUSH_PROGRESS, message);
    callee();
    commit(MutationTypes.POP_PROGRESS, undefined);
}

/** Commits the given progress information
 * @remarks This is a shorthand for not needing to use the push progress key
 */
function progress(
    commit: <K extends keyof Mutations<State>>(
        key: K,
        payload: Parameters<Mutations<State>[K]>[1],
    ) => ReturnType<Mutations<State>[K]>,
    message: string,
) {
    commit(MutationTypes.PUSH_PROGRESS, message);
}

/** Aborts the progress and rejects the promise with the given information
 * @remarks This is a shorthand for not needing to use the pop progress key and
 * rejecting in two distinct statements.
 * @devdoc directly return after this function call to avoid running further code after the promise rejection

 */
function abort(
    commit: <K extends keyof Mutations<State>>(
        key: K,
        payload: Parameters<Mutations<State>[K]>[1],
    ) => ReturnType<Mutations<State>[K]>,
    reject: (reason: string) => void,
    message: string,
): void {
    commit(MutationTypes.POP_PROGRESS, undefined);
    reject(message);
}
