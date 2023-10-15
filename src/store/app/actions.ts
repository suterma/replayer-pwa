import {
    Compilation,
    Cue,
    ICompilation,
    ICue,
    ITrack,
    PlaybackMode,
    Track,
} from '../compilation-types';
import CompilationHandler from '../compilation-handler';
import { state } from './state';
import { v4 as uuidv4 } from 'uuid';

import { ObjectUrlHandler } from '@/code/storage/ObjectUrlHandler';
import FileSaver from 'file-saver';
import PersistentStorage from '../persistent-storage';
import JSZip from 'jszip';
import { MediaBlob, MediaUrl } from '../types';
import FileHandler from '../filehandler';
import CompilationParser from '../../code/xml/XmlCompilationParser';
import { useMessageStore } from '../messages';
import { IMeter } from '@/code/music/IMeter';
import { Meter } from '@/code/music/Meter';

export const actions = {
    /** Updates the currently selected cue Id, for application-wide handling
     * @remarks This does not control the playback itself. It is intended for display and handling purposes.
     * @remarks Removes any explicit track id selection.
     */
    updateSelectedCueId(cueId: string): void {
        state.selectedCueId.value = cueId;
    },

    /** Updates the currently selected track Id, for application-wide handling
     * @remarks This does not control the playback itself. It is intended for display and handling purposes.
     * @remarks Removes any previous cue id selection, then selects the first cue of this track, if available.
     */
    updateSelectedTrackId(trackId: string): void {
        state.selectedCueId.value = CompilationHandler.EmptyId;
        state.selectedTrackId.value = trackId;

        const track = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
            trackId,
        );
        const firstCue = track?.Cues[0];
        if (firstCue) {
            state.selectedCueId.value = firstCue.Id;
        }
    },

    /** Updates the track volume
     * @remarks Also updates the persistent store of the compilation
     */
    updateTrackVolume(trackId: string, volume: number): void {
        const track = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
            trackId,
        );
        if (track) {
            track.Volume = volume;
        }
    },

    /** Adds a new cue with the given time
         *    @remarks Adds (inserts) the new cue for the given track to the compilation, by inserting it by the order in time.
     
     */
    addCueAtTime(trackId: string, time: number): void {
        const roundedTime = CompilationHandler.roundTime(time);
        const nextShortcut = CompilationHandler.getNextShortcut(
            state.compilation.value,
        );

        const cueId = uuidv4();
        const cue = new Cue(
            '',
            nextShortcut.toString(),
            roundedTime,
            null,
            cueId,
        );

        this.addCue(trackId, cue);
        this.updateSelectedCueId(cueId);
    },

    /** Adds (inserts) the new cue for the given track to the compilation, by inserting it by the order in time.
     */
    addCue(trackId: string, cue: ICue): void {
        const matchingTrack = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
            trackId,
        );
        if (matchingTrack) {
            console.debug('actions::ADD_CUE:matchingTrack', matchingTrack);

            matchingTrack.Cues.push(cue);

            //Sort the resulting set by time
            CompilationHandler.sort(matchingTrack.Cues);

            if (matchingTrack.Duration != null) {
                console.debug(
                    'actions::ADD_CUE:matchingTrack.Duration',
                    matchingTrack.Duration,
                );
                CompilationHandler.updateCueDurations(
                    matchingTrack.Cues,
                    matchingTrack.Duration,
                );
            }
        }
    },

    /** Sets the track duration. Using the track duration and the existing cues,
     * calculates the durations of all cues, including the last one.
     * @remarks No ordering is done with this operation
     * @remarks The calculated durations are only valid as long as the cues, their times, and the track does not change
     * @param {number} trackDurationSeconds - could be NaN or infinity, depending on the source
     */
    updateDurations(trackId: string, trackDurationSeconds: number): void {
        const track = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
            trackId,
        );

        if (track) {
            track.Duration = trackDurationSeconds;
            CompilationHandler.updateCueDurations(
                track.Cues,
                trackDurationSeconds,
            );
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
        const track = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
            trackId,
        );
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
        const track = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
            trackId,
        );
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
        const track = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
            trackId,
        );
        if (track) {
            track.PreRoll = preRoll;
        }
    },

    /** Updates the track meter.
     * @remarks This is only relevant for music tracks
     */
    updateMeter(trackId: string, meter: IMeter): void {
        const track = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
            trackId,
        );
        if (track) {
            track.Meter = meter;
        }
    },
    /** Updates the track origin time.
     * @remarks Creates a new, initial meter, when none is available yet.
     */
    updateTrackOriginTime(trackId: string, originTime: number | null): void {
        const track = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
            trackId,
        );
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
        const track = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
            trackId,
        );
        if (track) {
            track.UseMeasureNumbers = useMeasureNumbers;
        }
    },

    /** Updates the cue data
     * @remarks Also updates the persistent store of the compilation
     */
    updateCueData(
        cueId: string,
        description: string,
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

    /** Deletes the cue
     * @remarks Also updates the persistent store of the compilation
     */
    deleteCue(cueId: string): void {
        console.debug('actions::DELETE_CUE:', cueId);
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

    /** Adds a new default track for the given file name or media URL to the compilation.
     * @remarks Track properties are derived from the given file name or url
     * @remarks The new track is made the selected track
     * @remarks No media data is added, it must get handled elsewhere.
     */
    addDefaultTrack(resourceName: string): void {
        console.debug('actions::ADD_DEFAULT_TRACK:', resourceName);
        const track = CompilationHandler.createDefaultTrack(resourceName);
        state.selectedCueId.value = CompilationHandler.EmptyId;
        state.selectedTrackId.value = track.Id;
        state.compilation.value.Tracks.push(track);
    },

    /** Adds a media blob URL to the store.
     * @remarks A new blob URL replaces any existing with an exact same path.
     * @param url - The MediaUrl to use
     */
    addMediaUrl(mediaUrl: MediaUrl): void {
        //Remove any previously matching media URL, even it was the same object, because
        //the caller has already created a new one for this mediaUrl's blob.
        const matchingFile = state.mediaUrls.value.get(mediaUrl.resourceName);
        if (matchingFile) {
            console.debug(
                `actions::ADD_MEDIA_URL:removing matching item for key:${
                    mediaUrl.resourceName
                }, normalized: ${mediaUrl.resourceName.normalize()}`,
            );
            ObjectUrlHandler.revokeObjectURL(matchingFile.url);
            state.mediaUrls.value.delete(mediaUrl.resourceName);
        }

        //Now add the new media URL as a replacement
        console.debug(
            `actions::ADD_MEDIA_URL:resourceName:${mediaUrl.resourceName},mime-type:${mediaUrl.mediaType}`,
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
     * @remarks If there is only a single track, this track becomes the active track.
     * For single-track compilations this causes the widget player to be shown immediately. Does not set the selected cue.
     * @remarks Removes all data from the previous compilation, including media URL's, by closing/discarding it.
     */
    replaceCompilation(compilation: ICompilation): void {
        this.discardCompilation();

        state.compilation.value = compilation;

        /* Set active track (if just one is available), like in MutationTypes.UPDATE_SELECTED_TRACK_ID */
        state.selectedCueId.value = CompilationHandler.EmptyId;
        state.selectedTrackId.value =
            compilation.Tracks.length == 1
                ? compilation.Tracks[0]?.Id ?? CompilationHandler.EmptyId
                : CompilationHandler.EmptyId;
    },

    /** Adds a blob as a media source, using a name and a blob  */
    addMediaBlob(mediaBlob: MediaBlob): void {
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

    /** Loads a single file or package from an URL
     * @remarks The content might be a package or single file of any supported content.
     * @remarks This method can be called multiple times, each resource gets appropriately added to the current compilation
     * @remarks The resource is expected to support appropriate CORS Headers
     * @param url - The URL to load the file from
     * @return A locally usable name, derived from the URL, which can be used to match the track to the stored media file
     */
    loadFromUrl(url: string): Promise<string> {
        const message = useMessageStore();

        return new Promise((resolve, reject) => {
            if (!FileHandler.isValidHttpUrl(url)) {
                message.popProgress();
                reject(`Provided input is not a valid URL: '${url}'`);
            }

            message.pushProgress(`Loading URL '${url}'...`);
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
                        message.popProgress();
                        reject(
                            `Fetch has failed for URL: '${url}' due to disallowed CORS by the server. Please manually download the resource and load it from the file system.`,
                        );
                    } else if (!response.ok) {
                        message.popProgress();
                        reject(
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
                            message.popProgress();
                            reject(
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
                        this.loadFromFile(file)
                            .then(() => {
                                resolve(localResourceName);
                                //The action is done, so terminate the progress
                                message.popProgress();
                            })
                            .catch((errorMessage: string) => {
                                message.popProgress();
                                reject(
                                    `Loading from the received resource file has failed for URL: '${url}' with the message: '${errorMessage}'`,
                                );
                            });
                    });
                })
                .catch((errorMessage: string) => {
                    message.popProgress();
                    reject(
                        `Fetch has failed for URL: '${url}' with the message: '${errorMessage}'. Maybe the file is too large or the server does not allow CORS. If any of this is the case, manually download the resource and load it from the file system.`,
                    );
                });
        });
    },

    /** Loads a single file or package from the local file system
     * @remarks The item might be a package or single file of any supported content.
     * @remarks This method can be called multiple times, each resource gets appropriately added to the current compilation
     * @param file - The file to use
     */

    loadFromFile(file: File): Promise<void> {
        const message = useMessageStore();

        return new Promise((resolve, reject) => {
            message.pushProgress(
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

                            //Determine whether the ZIP file contains an existing compilation xml file
                            const hasIncludedCompilation = processables.some(
                                (zipFile /*, file*/) => {
                                    return FileHandler.isSupportedCompilationFileName(
                                        zipFile.name,
                                    );
                                },
                            );

                            processables.forEach(
                                (zipEntry: JSZip.JSZipObject): void => {
                                    //Set the progress message, before using any of the async functions
                                    message.pushProgress(
                                        `Processing ZIP entry: ${zipEntry.name}`,
                                    );
                                    zipEntry
                                        .async('nodebuffer')
                                        .then((content: Buffer): void => {
                                            //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
                                            const zipEntryName =
                                                zipEntry.name.normalize();
                                            message.pushProgress(
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
                                                        this.replaceCompilation(
                                                            compilation,
                                                        );
                                                    })
                                                    .finally(() => {
                                                        message.popProgress();
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
                                                this.addMediaBlob(mediaBlob);

                                                if (!hasIncludedCompilation) {
                                                    this.addDefaultTrack(
                                                        mediaBlob.fileName,
                                                    );
                                                }
                                                message.popProgress();
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
                                            message.popProgress();
                                        })
                                        .finally(() => {
                                            message.popProgress();
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
                        message.popProgress();
                        resolve();
                    });
            } else if (FileHandler.isXmlFile(file)) {
                const reader = new FileReader();
                reader.onload = () => {
                    const content = Buffer.from(reader.result as string);
                    CompilationParser.handleAsXmlCompilation(content)
                        .then((compilation) => {
                            compilation.Url = file.name;
                            this.replaceCompilation(compilation);
                        })
                        .finally(() => {
                            message.popProgress();
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
                this.addMediaBlob(new MediaBlob(file.name, file));
                message.popProgress();
                resolve();
            } else {
                message.popProgress();
                reject(
                    `Unsupported content type for file '${file.name}', content was not processed.`,
                );
            }
        });
    },

    /** Discards a media blob URL from the store.
     * @param url - The MediaUrl to use
     */
    discardMediaUrl(mediaUrl: MediaUrl): void {
        console.debug('actions::DISCARD_MEDIA_URL:mediaUrl', mediaUrl);

        const matchingFile = state.mediaUrls.value.get(mediaUrl.resourceName);
        if (matchingFile) {
            console.debug(
                `actions::DISCARD_MEDIA_URL:removing matching item for key:${
                    mediaUrl.resourceName
                }, normalized: ${mediaUrl.resourceName.normalize()}`,
            );
            ObjectUrlHandler.revokeObjectURL(matchingFile.url);

            console.debug(
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
     * @remarks No media data is added, it must get handled elsewhere.
     */
    addTrack(track: ITrack): void {
        console.debug('actions::ADD_TRACK:', track);
        state.compilation.value.Tracks.push(track);
        state.selectedCueId.value = CompilationHandler.EmptyId;
        state.selectedTrackId.value = track.Id;
    },

    /** Uses a single media resource from an URL, by adding the URL to the set of stored media URLs.
     * @remarks The resource must be a single media file.
     * @remarks This method can be called multiple times, each URL gets appropriately added to the current compilation
     * @remarks The resource does not need to support any CORS Headers, because it's only used as-is, as a media source
     * @param url - The URL to use
     * @return A locally usable name, derived from the URL, which can be used to match the track to the stored media URL
     */
    useMediaFromUrl(url: string): Promise<string> {
        const message = useMessageStore();

        return new Promise((resolve, reject) => {
            if (
                !(
                    FileHandler.isValidHttpUrl(url) &&
                    FileHandler.isSupportedMediaFileName(url)
                )
            ) {
                message.popProgress();
                reject(
                    `Provided input is not a valid media URL or is not supported: '${url}'. See the documentation for supported media types.`,
                );
            }

            message.pushProgress(`Using URL '${url}'...`);
            const finalUrl = new URL(url);
            const localResourceName =
                FileHandler.getLocalResourceName(finalUrl);

            this.addMediaUrl(new MediaUrl(localResourceName, url, null, null));
            resolve(localResourceName);

            //The action is done, so terminate the progress
            message.popProgress();
        });
    },

    /** Specifically updates the track media source URL
     * @remarks Also updates the persistent store of the compilation
     */
    updateTrackUrl(trackId: string, url: string): void {
        const track = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
            trackId,
        );
        if (track) {
            track.Url = url;
            //The duration is now stale, since the new track will have it's own duration, so remove it
            track.Duration = null;
        }
    },

    /** Removes an existing track, with it's cues.
     * @remarks Removes the track from the compilation. If the selected cue was one of the track, the selection is cleared.
     */
    removeTrack(trackId: string): void {
        const trackToRemove = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
            trackId,
        );
        const currentlySelectedCueId = state.selectedCueId.value;
        trackToRemove?.Cues.forEach((cue) => {
            if (currentlySelectedCueId === cue.Id) {
                /* unselect cue, this track is no longer the active track */
                state.selectedCueId.value = CompilationHandler.EmptyId;
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
        const sourceTrack = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
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
                state.compilation.value,
            );
            clonedTrack.Id = uuidv4();
            clonedTrack.Name = sourceTrack.Name + ' (cloned)';
            clonedTrack.Cues.forEach((cue) => {
                cue.Id = uuidv4();
                cue.Shortcut = (nextShortcut++).toString();
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
        console.debug('actions::REASSIGN_CUE_SHORTCUTS:trackId', trackId);

        const track = CompilationHandler.getTrackById(
            state.compilation.value.Tracks,
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

    /** Initiates the download of the current compilation as a single XML (.rex) file
     */
    downloadRexFile(): void {
        const message = useMessageStore();

        message.pushProgress(`Downloading REX file...`);

        const xml = CompilationParser.convertToXml(state.compilation.value);
        const blob = new Blob([xml], {
            type: 'text/xml;charset=utf-8',
        });
        FileSaver.saveAs(blob, `${state.compilation.value?.Title}.rex`);

        message.popProgress();
    },

    /** Initiates the download of the current compilation as a ZIP (.rez) package
     */
    downloadRezPackage(): void {
        const message = useMessageStore();

        message.pushProgress(`Downloading REZ file...`);

        //Get the XML first
        const xml = CompilationParser.convertToXml(state.compilation.value);
        const blob = new Blob([xml], {
            type: 'text/xml;charset=utf-8',
        });

        //Then get the blobs from the storage
        //(which should actually be the matching media blobs for the compilation)
        PersistentStorage.retrieveAllMediaBlobs().then((mediaBlobs) => {
            //Pack everything into the ZIP file
            const zip = new JSZip();
            zip.file(`${state.compilation.value?.Title}.rex`, blob);

            mediaBlobs.forEach((mediaBlob) => {
                zip.file(mediaBlob.fileName, mediaBlob.blob);
            });

            //Save as the REZ package
            zip.generateAsync({ type: 'blob' })
                .then(function (content) {
                    FileSaver.saveAs(
                        content,
                        `${state.compilation.value?.Title}.rez`,
                    );
                })
                .finally(() => {
                    message.popProgress();
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

    /** Returns the app state to it's default */
    $reset(): void {
        debugger;
        this.discardCompilation();
        state.compilation.value = Compilation.empty();
        state.selectedCueId.value = CompilationHandler.EmptyId;
        state.selectedTrackId.value = CompilationHandler.EmptyId;
        state.mediaUrls.value = new Map<string, MediaUrl>();
        state.useAppShortcuts.value = true;
        state.acknowledgedVersion.value = null;
        state.playbackMode.value = PlaybackMode.PlayTrack;
        state.isFadingEnabled.value = true;
        state.isPreRollEnabled.value = true;
    },
};
