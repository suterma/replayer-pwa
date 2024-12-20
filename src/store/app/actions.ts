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
import { Meter } from '@/code/music/Meter';
import {
    ProgressDisplayKind,
    ProgressMessage,
} from '@/store/messages/ProgressMessage';
import { getters } from './getters';
import useLog from '@/composables/LogComposable';

const { log } = useLog();

export const actions = {
    /** Updates the currently selected cue Id, for application-wide handling
     * @remarks This does not control the playback itself. It is intended for display and handling purposes.
     * Removes any explicit track id selection.
     */
    updateSelectedCueId(cueId: string): void {
        state.selectedCueId.value = cueId;
    },

    /** Updates the scheduled cue Id, for application-wide handling
     * @remarks This does not control the playback itself. It is intended for display and handling purposes.
     */
    updateScheduledCueId(cueId: string): void {
        state.scheduledCueId.value = cueId;
    },

    /** Updates the currently selected track Id, for application-wide handling
     * @remarks This does not control the playback itself. It is intended for display and handling purposes.
     * Removes any previous cue id selection, then selects the first cue of this track, if available.
     * Removes any previous next cue id selection.
     */
    updateSelectedTrackId(trackId: string): void {
        state.selectedCueId.value = CompilationHandler.EmptyId;
        state.scheduledCueId.value = CompilationHandler.EmptyId;
        state.selectedTrackId.value = trackId;

        const track = getters.getTrackById(trackId);
        const firstCue = track?.Cues[0];
        if (firstCue) {
            state.selectedCueId.value = firstCue.Id;
        }
    },

    /** Selects the matching cue, by the given mnemonic, if any. Cues from the active track are considered first. */
    toMnemonicCue(cueShortcut: string) {
        log.debug('Compilation::toMnemonicCue:cueShortcut:', cueShortcut);
        let matchingCue = null;

        // try the active track first
        const activeTrackId = getters.activeTrackId.value;
        if (activeTrackId) {
            const activeTrack = getters.getTrackById(activeTrackId);
            if (activeTrack) {
                const allCues = activeTrack.Cues;
                matchingCue = allCues.find(
                    (cue) => cue.Shortcut == cueShortcut,
                );
            }
        }

        if (!matchingCue) {
            // try any track
            const allCues = getters.getAllCues.value;
            matchingCue = allCues.find((cue) => cue.Shortcut == cueShortcut);
        }

        if (matchingCue) {
            actions.updateSelectedCueId(matchingCue.Id);
        }
    },

    /** Selects the previous cue, if any. Otherwise, loop to the last cue */
    toPreviousCue() {
        log.debug('Compilation::toPreviousCue');
        const allCueIds = getters.getAllCues.value.map((cue) => cue.Id);
        const indexOfSelected = allCueIds.indexOf(state.selectedCueId.value);
        if (indexOfSelected > 0) {
            const prevCueId = allCueIds[indexOfSelected - 1];
            if (prevCueId) {
                actions.updateSelectedCueId(prevCueId);
            }
        } else {
            //loop to last
            const lastCueId = allCueIds.at(-1);
            if (lastCueId) {
                actions.updateSelectedCueId(lastCueId);
            }
        }
    },

    /** Selects the next cue, if any. Otherwise, loop to the first cue */
    toNextCue() {
        log.debug('app::toNextCue');
        const allCueIds = getters.getAllCues.value.map((cue) => cue.Id);
        const indexOfSelected = allCueIds.indexOf(state.selectedCueId.value);
        if (indexOfSelected < allCueIds.length - 1) {
            const nextCueId = allCueIds[indexOfSelected + 1];
            if (nextCueId) {
                actions.updateSelectedCueId(nextCueId);
            }
        } else {
            //loop to first
            const firstCueId = allCueIds.at(0);
            if (firstCueId) {
                actions.updateSelectedCueId(firstCueId);
            }
        }
    },

    /** Adds a new cue with the given time
     * @remarks Adds (inserts) the new cue for the given track to the compilation, by inserting it by the order in time.
     * @return The id of the new cue
     */
    addCueAtTime(trackId: string, time: number): string {
        const roundedTime = CompilationHandler.roundTime(time);
        const nextShortcut = CompilationHandler.getNextShortcut(
            state.compilation.value,
        );

        const cueId = uuidv4();
        const cue = new Cue(
            null,
            null,
            nextShortcut.toString(),
            roundedTime,
            null,
            false,
            false,
            cueId,
        );

        this.addCue(trackId, cue);
        this.updateSelectedCueId(cueId);
        return cueId;
    },

    /** Adds (inserts) the new cue for the given track to the compilation, by inserting it by the order in time.
     */
    addCue(trackId: string, cue: ICue): void {
        const matchingTrack = getters.getTrackById(trackId);
        if (matchingTrack) {
            matchingTrack.Cues.push(cue);

            //Sort the resulting set by time
            CompilationHandler.sort(matchingTrack.Cues);

            if (matchingTrack.Duration != null) {
                CompilationHandler.updateCueDurations(
                    matchingTrack.Cues,
                    matchingTrack.Duration,
                );
            }
        }
    },

    /** Adds (inserts) a new tag for the given track.
     */
    addTag(trackId: string, tag: string): void {
        if (tag) {
            const matchingTrack = getters.getTrackById(trackId);
            if (matchingTrack) {
                matchingTrack.Tags.add(tag);
            }
        }
    },

    /** Removes a tag from the given track.
     */
    removeTag(trackId: string, tag: string): void {
        const matchingTrack = getters.getTrackById(trackId);
        if (matchingTrack) {
            matchingTrack.Tags.delete(tag);
        }
    },

    /** Updates the track data
     * @remarks Also updates the persistent store of the compilation
     */
    updateTrackData(
        trackId: string,
        name: string,
        artist: string,
        album: string,
    ): void {
        const track = getters.getTrackById(trackId);
        if (track) {
            track.Name = name;
            track.Artist = artist;
            track.Album = album;
        }
    },

    /** Updates the track BPM
     * @remarks Also updates the persistent store of the compilation
     */
    updateBeatsPerMinute(trackId: string, beatsPerMinute: number): void {
        const track = getters.getTrackById(trackId);
        if (track) {
            const meter = new Meter(
                track.Meter?.TimeSignature ?? null,
                beatsPerMinute,
                track.Meter?.OriginTime ?? null,
            );
            track.Meter = meter;
        }
    },

    /** Updates the version known as the (previously) acknowledged version
     */
    updateAcknowledgedVersion(version: string): void {
        state.acknowledgedVersion.value = version;
    },

    /** Updates the track pre-roll
     * @remarks Also updates the persistent store of the compilation
     */
    updateTrackPreRoll(trackId: string, preRoll: number | null): void {
        const track = getters.getTrackById(trackId);
        if (track) {
            track.PreRoll = preRoll;
        }
    },

    /** Updates the track meter.
     * @remarks This is only relevant for music tracks
     */
    updateMeter(trackId: string, meter: IMeter): void {
        const track = getters.getTrackById(trackId);
        if (track) {
            track.Meter = meter;
        }
    },
    /** Updates the track origin time.
     * @remarks Creates a new, initial meter, when none is available yet.
     */
    updateTrackOriginTime(trackId: string, originTime: number | null): void {
        const track = getters.getTrackById(trackId);
        if (track) {
            if (!track.Meter) {
                track.Meter = Meter.FromTimeSignature(originTime);
            }

            if (track.Meter) {
                track.Meter.OriginTime = originTime;
            }
        }
    },

    /** Updates whether to use the measure number to set and display the cue positions
     */
    updateUseMeasureNumbers(
        trackId: string,
        useMeasureNumbers: boolean | null,
    ): void {
        const track = getters.getTrackById(trackId);
        if (track) {
            track.UseMeasureNumbers = useMeasureNumbers;
        }
    },

    /** Updates the cue data
     * @remarks Also updates the persistent store of the compilation
     */
    updateCueData(
        cueId: string,
        description: string | null,
        remarks: string | null,
        shortcut: string | null,
        time: number | null,
    ): void {
        const cue = CompilationHandler.getCompilationCueById(
            state.compilation.value,
            cueId,
        );
        if (cue) {
            const hasChangedTime = cue.Time !== time;

            cue.Description = description;
            cue.Remarks = remarks;
            cue.Shortcut = shortcut;
            cue.Time = time;

            if (hasChangedTime) {
                const track = CompilationHandler.getTrackByCueId(
                    state.compilation.value,
                    cueId,
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

    /** Updates whether the cue omits the pre-roll duration
     * @remarks Also updates the persistent store of the compilation
     */
    updateCueOmitPreRoll(cueId: string, omitPreRoll: boolean): void {
        const cue = CompilationHandler.getCompilationCueById(
            state.compilation.value,
            cueId,
        );
        if (cue) {
            cue.OmitPreRoll = omitPreRoll;
        }
    },

    /** Updates whether the cue omits the fade-in duration
     * @remarks Also updates the persistent store of the compilation
     */
    updateCueOmitFadeIn(cueId: string, omitFadeIn: boolean): void {
        const cue = CompilationHandler.getCompilationCueById(
            state.compilation.value,
            cueId,
        );
        if (cue) {
            cue.OmitFadeIn = omitFadeIn;
        }
    },

    /** Deletes the cue
     * @remarks Also updates the persistent store of the compilation
     */
    deleteCue(cueId: string): void {
        log.debug('actions::DELETE_CUE:', cueId);
        const matchingTrack = CompilationHandler.getTrackByCueId(
            state.compilation.value,
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

    /** Deletes all cues of a track
     * @remarks Also updates the persistent store of the compilation
     */
    deleteCues(trackId: string): void {
        log.debug('actions::deleteCues:', trackId);

        const matchingTrack = getters.getTrackById(trackId);
        if (matchingTrack) {
            matchingTrack.Cues = new Array<ICue>();
        }
    },

    /** Adds a new default track for the given file name or media URL to the compilation.
     * @remarks Track properties are derived from the given file name or url
     * The new track is made the selected track
     * No media data is added, it must get handled elsewhere.
     */
    addDefaultTrack(resourceName: string): void {
        log.debug('actions::ADD_DEFAULT_TRACK:', resourceName);
        const track = CompilationHandler.createDefaultTrack(resourceName);
        state.selectedCueId.value = CompilationHandler.EmptyId;
        state.selectedTrackId.value = track.Id;
        state.compilation.value.Tracks.push(track);
    },

    /** Adds a media blob URL to the store.
     * @remarks A new blob URL replaces any existing with an exact same path.
     * @param mediaUrl - The MediaUrl to use
     */
    addMediaUrl(mediaUrl: MediaUrl): void {
        //Remove any previously matching media URL, even it was the same object, because
        //the caller has already created a new one for this mediaUrl's blob.
        const matchingFile = state.mediaUrls.value.get(mediaUrl.resourceName);
        if (matchingFile) {
            log.debug(
                `actions::addMediaUrl:removing matching item for key:${
                    mediaUrl.resourceName
                }, normalized: ${mediaUrl.resourceName.normalize()}`,
            );
            ObjectUrlHandler.revokeObjectURL(matchingFile.url);
            state.mediaUrls.value.delete(mediaUrl.resourceName);
        }

        //Now add the new media URL as a replacement
        log.debug(
            `actions::addMediaUrl:resourceName:${mediaUrl.resourceName},mime-type:${mediaUrl.mediaType}`,
        );
        state.mediaUrls.value.set(mediaUrl.resourceName, mediaUrl);

        //If any track uses this media, remove the now stale duration in this track
        const matchingTrack = state.compilation.value.Tracks.find((t) =>
            CompilationHandler.isLazyMatchingMediaUrl(t.Url, mediaUrl),
        );
        if (matchingTrack) {
            matchingTrack.Duration = null;
        }
    },

    /** Replaces the current compilation with a new one
     * @remarks If there is only a single track  in the new compilation,
     * this track becomes the active track. For single-track compilations
     * this causes the widget player to be shown immediately.
     * Does not set the selected cue.
     * Does not remove any existing media. If required, this must be done separately.
     */
    replaceCompilation(compilation: ICompilation): void {
        state.selectedCueId.value = CompilationHandler.EmptyId;
        state.scheduledCueId.value = CompilationHandler.EmptyId;

        state.compilation.value = compilation;

        /* Set active track (if just one is available), like in MutationTypes.UPDATE_SELECTED_TRACK_ID */
        state.selectedTrackId.value =
            compilation.Tracks.length == 1
                ? (compilation.Tracks[0]?.Id ?? CompilationHandler.EmptyId)
                : CompilationHandler.EmptyId;
    },

    /** Adds a blob as a media source, using a name and a blob  */
    addMediaBlob(mediaBlob: MediaBlob): void {
        log.debug(
            'actions::addMediaBlob::mediaBlob.fileName',
            mediaBlob.fileName,
        );
        const objectUrl = ObjectUrlHandler.createObjectURL(
            mediaBlob.blob,
            mediaBlob.fileName,
        );
        const blobSize = mediaBlob.blob.size;
        const mediaType = mediaBlob.blob.type;
        this.addMediaUrl(
            new MediaUrl(mediaBlob.fileName, objectUrl, blobSize, mediaType),
        );
        //Store persistently, but after committing, to keep the process faster
        PersistentStorage.storeMediaBlob(mediaBlob);
    },

    /** Loads a single file (media or package file) from an URL
     * @remarks The file content might be of any supported content.
     * This method can be called multiple times, each resource gets appropriately added to the current compilation
     * The resource is expected to support appropriate CORS Headers
     * @param url - The URL to load the file from
     * @return A locally usable name, derived from the URL, which can be used to match the track to the stored media file
     */
    loadFromUrl(url: string): Promise<string> {
        log.debug('actions::loadFromUrl::url', url);
        const message = useMessageStore();

        return new Promise((resolve, reject) => {
            if (!FileHandler.isValidHttpUrl(url)) {
                message.popProgress();
                reject(`Provided input is not a valid URL: '${url}'`);
            }

            const connectingUrlMessage = `Connecting to '${url}'...`;
            message
                .pushProgress(connectingUrlMessage)
                .then(() => {
                    // HINT: Replayer expects CORS to be allowed here (no no-cors).
                    // If the origin server doesn’t include the suitable
                    // Access-Control-Allow-Origin response header, the request will fail
                    fetch(url, {
                        method: 'GET',
                    })
                        .then(async (response) => {
                            //Use the final (possibly redirected URL)
                            if (response.redirected) {
                                log.debug(
                                    `The GET request was redirected from fetch URL '${url}' to response URL '${response.url}'`,
                                );
                            }

                            if (
                                response.status ===
                                0 /* opaque response, in case no-cors would have been used */
                            ) {
                                reject(
                                    `Fetch has failed for URL: '${response.url}' due to disallowed CORS by the server. Please manually download the resource and load it from the file system.`,
                                );
                            } else if (!response.ok) {
                                reject(
                                    `Network response while fetching URL '${response.url}' was not 200 OK, but: '${response.status} ${response.statusText}'`,
                                );
                            }

                            // Wait for, then process, the response content
                            const loadingMessage = `Loading from '${response.url}'...`;
                            message.pushProgress(loadingMessage);
                            FileHandler.getFileWithProgress(
                                response,
                                (progress) => {
                                    message.pushProgressWithPercentage(
                                        new ProgressMessage(
                                            loadingMessage,
                                            progress,
                                            ProgressDisplayKind.Linear,
                                        ),
                                    );
                                },
                            )
                                .then((file) => {
                                    this.loadFromFile(file)
                                        .then(() => {
                                            resolve(file.name);
                                        })
                                        .catch((errorMessage: string) =>
                                            reject(
                                                `Loading from the received resource file has failed for URL: '${response.url}' with the message: '${errorMessage}'`,
                                            ),
                                        );
                                })
                                .catch((errorMessage: string) =>
                                    reject(
                                        `Receiving data from URL: '${response.url}' failed with the message: '${errorMessage}'`,
                                    ),
                                )
                                .finally(() =>
                                    message.popProgress(loadingMessage),
                                );
                        })
                        .catch((errorMessage: string) =>
                            reject(
                                `Fetch has failed for URL: '${url}' with the message: '${errorMessage}'. Maybe the file is too large or the server does not allow CORS. If any of this is the case, manually download the resource and load it from the file system.`,
                            ),
                        )
                        .finally(() =>
                            message.popProgress(connectingUrlMessage),
                        );
                })
                .catch((errorMessage: string) => {
                    reject(
                        `Fetching failed for URL: '${url}' with the message: '${errorMessage}'. Maybe the server is offline.`,
                    );
                    // Popped here, not in finally because the successful path leads to popping inside the fetch continuation
                    message.popProgress(connectingUrlMessage);
                });
        });
    },

    /** Loads a single file, of any supported content.
     * @remarks The file might have been downloaded or loaded from the local file
     * system. It might be a package file or a single file of any supported content.
     * This method can be called multiple times, each resource gets appropriately added to the current compilation
     * @param file - The file to use
     */

    loadFromFile(file: File): Promise<void> {
        const message = useMessageStore();

        return new Promise((resolve, reject) => {
            const loadingFileMessage = `Loading file '${file.name}' ${
                file.type
            } (${FileHandler.AsMegabytes(file.size)}MB)`;
            message.pushProgress(loadingFileMessage);
            if (FileHandler.isSupportedPackageFile(file)) {
                log.debug(
                    `Browser supports JSZip arraybuffer: ${JSZip.support.arraybuffer}; uint8array: ${JSZip.support.uint8array}; blob: ${JSZip.support.blob}; nodebuffer: ${JSZip.support.nodebuffer}`,
                );
                // 1) read the Blob
                JSZip.loadAsync(file)
                    .then(
                        (zip: JSZip) => {
                            //For performance reasons, explicitly process only expected files
                            const processables = zip.filter(
                                (relativePath /*, file*/) => {
                                    return FileHandler.isProcessableFileName(
                                        relativePath,
                                    );
                                },
                            );

                            const hasIncludedCompilation = processables.some(
                                (zipFile /*, file*/) => {
                                    return FileHandler.isSupportedCompilationFileName(
                                        zipFile.name,
                                    );
                                },
                            );

                            if (hasIncludedCompilation) {
                                // Make a clean slate for the new compilation
                                this.discardCompilation();
                            }

                            const extractingProgressMessage = 'Loading...';
                            message.pushProgress(extractingProgressMessage);
                            const processableCount = processables.length;
                            let processedCount = 0;
                            processables
                                .sort(FileHandler.compareZipEntries)
                                .forEach(
                                    (zipEntry: JSZip.JSZipObject): void => {
                                        //Set the progress message, before using any of the async functions
                                        const processEntryMessage =
                                            FileHandler.getAllAfterLastSlash(
                                                zipEntry.name,
                                            );
                                        zipEntry
                                            .async(
                                                'blob',
                                                function updateCallback(
                                                    metadata,
                                                ) {
                                                    message.pushProgressWithPercentage(
                                                        new ProgressMessage(
                                                            processEntryMessage,
                                                            metadata.percent,
                                                        ),
                                                    );
                                                },
                                            )
                                            .then((content: Blob): void => {
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
                                                    ).then((compilation) => {
                                                        compilation.Url =
                                                            file.name;
                                                        this.replaceCompilation(
                                                            compilation,
                                                        );
                                                    });
                                                } else if (
                                                    FileHandler.isSupportedMediaFileName(
                                                        zipEntryName,
                                                    )
                                                ) {
                                                    const mediaBlob =
                                                        FileHandler.handleAsMediaContent(
                                                            zipEntryName,
                                                            content,
                                                        );
                                                    this.addMediaBlob(
                                                        mediaBlob,
                                                    );

                                                    if (
                                                        !hasIncludedCompilation
                                                    ) {
                                                        this.addDefaultTrack(
                                                            mediaBlob.fileName,
                                                        );
                                                    }
                                                } else if (
                                                    FileHandler.isSupportedPackageFileName(
                                                        zipEntryName,
                                                    )
                                                ) {
                                                    //We do not handle packages within packages.
                                                    //HINT: Unfortunately JSZip seems to report the currently
                                                    //open package as file within itself. This mitigates that.
                                                    log.debug(
                                                        `ZIP: Not processing package file '${zipEntryName}' within package: '${file.name}'`,
                                                    );
                                                } else if (
                                                    FileHandler.isPath(
                                                        zipEntryName,
                                                    )
                                                ) {
                                                    //We do not handle paths on their own
                                                    log.debug(
                                                        `ZIP: Not processing path '${zipEntryName}' within package: '${file.name}'`,
                                                    );
                                                } else {
                                                    log.warn(
                                                        `ZIP: Unknown content type for file '${zipEntryName}' within package: '${file.name}'`,
                                                    );
                                                }
                                            })
                                            .catch((errorMessage: string) =>
                                                log.error(errorMessage),
                                            )
                                            .finally(() => {
                                                // Remove message for this item
                                                message.popProgress(
                                                    processEntryMessage,
                                                );
                                                // Remove overall message on last item
                                                processedCount++;
                                                if (
                                                    processedCount >=
                                                    processableCount
                                                ) {
                                                    message.popProgress(
                                                        extractingProgressMessage,
                                                    );
                                                }
                                            });
                                    },
                                );
                        },
                        function (e) {
                            log.error(
                                `un-ZIP: Error reading ${file.name}: ${e.message}`,
                            );
                        },
                    )
                    .catch((errorMessage: string) => reject(errorMessage))
                    .finally(() => {
                        message.popProgress(loadingFileMessage);
                        resolve();
                    });
            } else if (FileHandler.isXmlFile(file)) {
                CompilationParser.handleAsXmlCompilation(file)
                    .then((compilation) => {
                        compilation.Url = file.name;
                        this.replaceCompilation(compilation);
                    })
                    .catch((errorMessage: string) => reject(errorMessage))
                    .finally(() => {
                        message.popProgress(loadingFileMessage);
                        resolve();
                    });
            } else if (FileHandler.isSupportedMediaFile(file)) {
                this.addMediaBlob(new MediaBlob(file.name, file));
                message.popProgress(loadingFileMessage);
                resolve();
            } else {
                message.popProgress(loadingFileMessage);
                reject(
                    `Unsupported content type for file '${file.name}', content was not processed.`,
                );
            }
        });
    },

    /** Discards a media blob URL from the store.
     * @param mediaUrl - The MediaUrl to use
     */
    discardMediaUrl(mediaUrl: MediaUrl): void {
        log.debug('actions::DISCARD_MEDIA_URL:mediaUrl', mediaUrl);

        const matchingFile = state.mediaUrls.value.get(mediaUrl.resourceName);
        if (matchingFile) {
            log.debug(
                `actions::DISCARD_MEDIA_URL:removing matching item for key:${
                    mediaUrl.resourceName
                }, normalized: ${mediaUrl.resourceName.normalize()}`,
            );
            ObjectUrlHandler.revokeObjectURL(matchingFile.url);

            log.debug(
                `actions::DISCARD_MEDIA_URL:localResourceName`,
                mediaUrl.resourceName,
            );
            state.mediaUrls.value.delete(mediaUrl.resourceName);

            //Discard the stored blob
            PersistentStorage.removeMediaBlob(mediaUrl.resourceName);
        }

        //If any track used this media, remove the now stale duration in this track
        const matchingTracks = state.compilation.value.Tracks.filter((t) =>
            CompilationHandler.isMatchingResourceName(
                t.Url,
                mediaUrl.resourceName,
            ),
        );
        matchingTracks.forEach((t) => (t.Duration = null));
    },

    /** Adds a provided track to the compilation.
     * @remarks The new track is made the selected track
     * No media data is added, it must get handled elsewhere.
     */
    addTrack(track: ITrack): void {
        state.compilation.value.Tracks.push(track);
        state.selectedCueId.value = CompilationHandler.EmptyId;
        state.scheduledCueId.value = CompilationHandler.EmptyId;
        state.selectedTrackId.value = track.Id;
    },

    /** Uses a single media resource from an URL, by adding the URL to the set of stored media URLs.
     * @remarks The resource is expected to be a single, supported media file.
     * No further assertion about the resource is made within this method, and
     * the resource does not need to support any CORS Headers, because it's only used as-is, as a media source.
     * This method can be called multiple times, each URL gets appropriately added to the current compilation.
     * @param url - The URL to use
     * @return A promise to a locally usable name, derived from the URL, which can be used to match the track to the stored media URL
     */
    useMediaFromUrl(url: string): Promise<string> {
        log.debug('actions::useMediaFromUrl::url', url);
        const message = useMessageStore();
        return new Promise((resolve, reject) => {
            if (!FileHandler.isValidHttpUrl(url)) {
                //message.popProgress();
                reject(
                    `Not a valid media URL: '${url}'. Please select another media resource. See the documentation for supported media types.`,
                );
                // Still let the user to continue with adding the (other) tracks or data
            }

            message.pushProgress(`Using URL '${url}'...`);

            let localResourceName = url;
            try {
                const finalUrl = new URL(url);
                localResourceName = FileHandler.getLocalResourceName(finalUrl);
                this.addMediaUrl(
                    new MediaUrl(localResourceName, url, null, null),
                );
                resolve(localResourceName);
            } finally {
                message.popProgress();
            }
        });
    },

    /** Specifically updates the track media source URL
     * @remarks Also updates the persistent store of the compilation
     */
    updateTrackUrl(trackId: string, url: string): void {
        const track = getters.getTrackById(trackId);
        if (track) {
            track.Url = url;
            //The duration is now stale, since the new track will have it's own duration, so remove it
            track.Duration = null;
        }
    },

    /** Removes an existing track, with it's cues.
     * @remarks Removes the track from the compilation.
     * If the selected or next cue was one of the track, the selection is cleared.
     */
    removeTrack(trackId: string): void {
        const trackToRemove = getters.getTrackById(trackId);
        const currentlySelectedCueId = state.selectedCueId.value;
        const scheduledCueId = state.scheduledCueId.value;
        trackToRemove?.Cues.forEach((cue) => {
            if (currentlySelectedCueId === cue.Id) {
                /* unselect cue, this track is no longer the active track */
                state.selectedCueId.value = CompilationHandler.EmptyId;
            }
            if (scheduledCueId === cue.Id) {
                /* unselect cue, this track is no longer the active track */
                state.scheduledCueId.value = CompilationHandler.EmptyId;
            }
        });

        const currentlySelectedTrackId = state.selectedTrackId.value;
        if (trackToRemove?.Id === currentlySelectedTrackId) {
            /* unselect track, this track is no longer the active track */
            state.selectedTrackId.value = CompilationHandler.EmptyId;
        }

        state.compilation.value.Tracks = state.compilation.value.Tracks.filter(
            (track) => track.Id !== trackId,
        );
    },

    /** Clones an existing track, with it's cues.
     * @remarks Effectively copies the track, and replaces any previous ids.
     */
    cloneTrack(trackId: string): void {
        const sourceTrack = getters.getTrackById(trackId);

        if (sourceTrack) {
            const clonedTrack = Track.fromJson(
                CompilationHandler.stringify(sourceTrack),
            );
            clonedTrack.Cues = clonedTrack.Cues.map((cue) => {
                return new Cue(
                    cue.Description,
                    cue.Remarks,
                    cue.Shortcut,
                    cue.Time,
                    cue.Duration,
                    cue.OmitPreRoll,
                    cue.OmitFadeIn,
                    cue.Id,
                );
            });

            //Now, in the clone, reassign all variable items
            clonedTrack.Id = uuidv4();
            clonedTrack.Name = sourceTrack.Name + ' (cloned)';
            clonedTrack.Cues.forEach((cue) => {
                cue.Id = uuidv4();
            });

            //Insert just after original
            const index = state.compilation.value.Tracks.indexOf(sourceTrack);
            state.compilation.value.Tracks.splice(index + 1, 0, clonedTrack);
        }
    },

    /** Reassigns the cue shortcuts, starting with the first cue's shortcut.
            * @remarks Uses the first shortcut mnemonic as seed, then incrementing the number

        */
    reassignCueShortcuts(trackId: string): void {
        log.debug('actions::REASSIGN_CUE_SHORTCUTS:trackId', trackId);

        const track = getters.getTrackById(trackId);

        if (track) {
            let seed = parseInt(track.Cues[0]?.Shortcut ?? '');
            if (seed) {
                track.Cues.forEach((cue) => {
                    cue.Shortcut = (seed++).toString();
                });
            }
        }
    },

    /** Closes/discards the current compilation
     * @remarks Permanently removes the compilation with all data, including the media files and the object URL references to it from
     * both the persistent storage and the application store. Clears the selected track and cue.
     */
    discardCompilation(): void {
        state.compilation.value = Compilation.empty();

        /* unselect cue/track, none is selected anymore */
        state.selectedCueId.value = CompilationHandler.EmptyId;
        state.selectedTrackId.value = CompilationHandler.EmptyId;

        state.mediaUrls.value.forEach((mediaUrl) => {
            ObjectUrlHandler.revokeObjectURL(mediaUrl.url);
            PersistentStorage.removeMediaBlob(mediaUrl.resourceName);
        });
        state.mediaUrls.value.clear();

        //Additionally also remove all other possibly left over media blobs
        PersistentStorage.removeAllMediaBlob();
    },

    /** Updates the compilation data
     * @remarks Also updates the persistent store of the compilation
     */
    updateCompilationData(title: string, artist: string, album: string): void {
        state.compilation.value.Title = title;
        state.compilation.value.Artist = artist;
        state.compilation.value.Album = album;
    },

    /** Initiates the download of the current compilation as a single XML (.xml) file
     * @remarks Omits media positions in the output
     * @param proposedFileName The proposed file name, without suffix.
     */
    downloadXmlFile(proposedFileName: string): void {
        const message = useMessageStore();

        message.pushProgress(`Downloading XML file...`);

        const xml = CompilationParser.convertToXml(state.compilation.value);
        const blob = new Blob([xml], {
            type: 'text/xml;charset=utf-8',
        });
        FileSaver.saveAs(blob, `${proposedFileName}.xml`);

        message.popProgress();
    },

    /** Initiates the download of the current compilation as a ZIP (.zip) package
     * @param proposedFileName The proposed file name, without suffix.
     */
    downloadZipPackage(proposedFileName: string): void {
        const message = useMessageStore();

        const downloadMessage = `Downloading ZIP file for '${state.compilation.value?.Title}'...`;
        message.pushProgress(downloadMessage).then(() => {
            //Get the blobs from the storage
            //(which should actually be the matching media blobs for the compilation)
            PersistentStorage.retrieveAllMediaBlobs()
                //Pack everything into the ZIP file
                .then((mediaBlobs) => {
                    //Add the XML compilation
                    log.debug('actions::pack-xml');
                    const xml = CompilationParser.convertToXml(
                        state.compilation.value,
                    );
                    const xmlBlob = new Blob([xml], {
                        type: 'text/xml;charset=utf-8',
                    });

                    //Add the blobs (XML and media)
                    const zip = new JSZip();
                    const compilationFileName =
                        CompilationHandler.getCompilationFileName(
                            state.compilation.value,
                        );
                    zip.file(`${compilationFileName}.xml`, xmlBlob);
                    mediaBlobs.forEach((mediaBlob) => {
                        log.debug(
                            `actions::pack-blob for ${mediaBlob.fileName}`,
                        );
                        zip.file(mediaBlob.fileName, mediaBlob.blob);
                    });

                    //Save as the ZIP package
                    zip.generateAsync({ type: 'blob' })
                        .then(function (content) {
                            FileSaver.saveAs(
                                content,
                                `${proposedFileName}.zip`,
                            );
                        })
                        .finally(() => {
                            message.popProgress(downloadMessage);
                        });
                })
                .catch(() => {
                    useMessageStore().pushError(
                        `Some media files are not available from the persistent storage. Alternatively, download an XML compilation (without media files).`,
                    );
                    message.popProgress(downloadMessage);
                });
        });
    },

    /** Revokes all currently known media blob URLs
     * @remarks Use this to avoid memory leaks when abandoning (but not closing) a compilation
     * This is usually the case when the user closes the tab or browser window, without actually closing the compilation.
     */
    revokeAllMediaUrls(): void {
        state.mediaUrls.value.forEach((mediaUrl) => {
            ObjectUrlHandler.revokeObjectURL(mediaUrl.url);
        });
        state.mediaUrls.value.clear();

        state.compilation.value.Tracks.forEach((track) => {
            track.Duration = null;
        });
    },

    updateTrackOrder(orderedTrackIds: string[]): void {
        state.compilation.value.Tracks.sort(
            (a, b) =>
                orderedTrackIds.indexOf(a.Id) - orderedTrackIds.indexOf(b.Id),
        );
    },

    // --- track positioning ---

    /** Whether the track is the first track in the set of media tracks */
    isFirstMediaTrack(track: ITrack): boolean {
        return getters.mediaTracks.value[0]?.Id === track.Id;
    },

    /** Whether the track is the last track in the set of media tracks */
    isLastMediaTrack(track: ITrack): boolean {
        return (
            getters.mediaTracks.value[getters.mediaTracks.value.length - 1]
                ?.Id === track.Id
        );
    },

    /** Returns the app state to it's default */
    $reset(): void {
        this.discardCompilation();
        state.compilation.value = Compilation.empty();
        state.selectedCueId.value = CompilationHandler.EmptyId;
        state.scheduledCueId.value = CompilationHandler.EmptyId;
        state.selectedTrackId.value = CompilationHandler.EmptyId;
        state.mediaUrls.value = new Map<string, MediaUrl>();
        state.useAppShortcuts.value = true;
        state.acknowledgedVersion.value = null;
        state.playbackMode.value = PlaybackMode.PlayTrack;
        state.isPreRollEnabled.value = true;
    },
};
