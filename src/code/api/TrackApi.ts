import router, { Route } from '@/router';
import type { ICue } from '@/store/ICue';
import type { ITrack } from '@/store/ITrack';
import { type LocationQuery, type RouteLocationRaw } from 'vue-router';
import { isClient } from '@vueuse/shared';
import { useShare } from '@vueuse/core';
import { ref } from 'vue';
import { shareTrack } from '@/code/ui/dialogs';
import { Cue } from '@/store/Cue';
import { DefaultTrackVolume, Track } from '@/store/Track';
import { v4 as uuidv4 } from 'uuid';

/** @class Static functions for the Track API
 * @remarks Implements the API from
 * https://replayer.app/en/documentation/track-api
 */
export class TrackApi {
    /** Gets the timestamp of a cue as an object key
     * @devdoc Makes sure the numeric keys are not integers, to keep a more suitable order
     * later on when creating the API query parameters
     * Javascript unfortunately orders integer object keys as first
     */
    private static getCueObjectKey(value: ICue): string {
        if (!value.Time) {
            return '0.0';
        }
        return value.Time.toString();
    }

    /** Gets a Track API URL for the given track */
    public static Url(track: ITrack | undefined): string {
        //Prepare track metadata
        let apiQuery = {
            media: track?.Url,
            title: track?.Name,
            album: track?.Album,
            artist: track?.Artist,
            t: track?.PlayheadPosition,
        };

        //Add available cues
        const cues = track?.Cues;
        if (cues) {
            apiQuery = Object.assign(
                apiQuery,
                ...cues.map((cue) => ({
                    [this.getCueObjectKey(cue)]: cue.Description,
                })),
            );
        }
        console.debug('TrackApi::Url:', apiQuery);

        //Build the URL
        const route = {
            name: Route.Play,
            query: apiQuery,
        } as unknown as RouteLocationRaw;
        return (
            window.location.protocol +
            '//' +
            window.location.host +
            window.location.pathname +
            router.resolve(route).href
        );
    }

    /** Gets a descriptive text for the given track */
    public static Descriptor(track: ITrack | undefined): string {
        let descriptor = '';
        if (track) {
            if (track.Name) {
                descriptor = descriptor + track.Name;
            } else {
                descriptor = descriptor + 'Track';
            }
            if (track.Artist || track.Album) {
                descriptor = descriptor + ' — ';
            }

            if (track.Artist) {
                descriptor = descriptor + ' by ' + track.Artist;
            }
            if (track.Album) {
                descriptor = descriptor + ' on ' + track.Album;
            }
        }

        return descriptor;
    }

    /** Initiates sharing of a track
     * @remarks If supported, uses the Web Share API, otherwise an interal fallback
     * dialog is presented to the user
     */
    public static startSharingTrack(track: ITrack) {
        const options = ref({
            title: 'Replayer link to: ' + TrackApi.Descriptor(track),
            text: TrackApi.Descriptor(track),
            url: isClient ? TrackApi.Url(track) : '',
        });

        const { share, isSupported } = useShare(options);

        if (isSupported.value) {
            share().catch((error) =>
                console.error('Error while sharing track: ', error),
            );
        } else {
            shareTrack(track);
        }
    }

    /** Parses a new track from a URL query
     * @remarks Assumes that the query follows the track API definition.
     * See https://replayer.app/en/documentation/track-api
     * @param query {LocationQuery} - The URL query to parse
     * @devdoc Currently does not support shortcuts
     */
    public static parseFromUrlQuery(query: LocationQuery): ITrack | undefined {
        const mediaUrl = TrackApi.getSingle(query.media);
        const time = TrackApi.getSingle(query.t);

        if (mediaUrl) {
            //Get the track metadata
            const title = TrackApi.getSingle(query.title) ?? '';
            const artist = TrackApi.getSingle(query.artist) ?? '';
            const album = TrackApi.getSingle(query.album) ?? '';
            const initialPlayheadPosition = time ? parseFloat(time) : null;

            //Get the cues if available
            let cues = Array<ICue>();
            for (const key in query) {
                const time = parseFloat(key);
                if (!isNaN(time)) {
                    const description = TrackApi.getSingle(
                        query[key],
                    ) as string;
                    const cueId = uuidv4();
                    cues.push(new Cue(description, null, time, null, cueId));
                }
            }

            cues = TrackApi.sortByTime(cues);

            const trackId = uuidv4();
            const newTrack = new Track(
                title,
                album,
                artist,
                null /* pre-roll */,
                initialPlayheadPosition /* initialPlayheadPosition */,
                1 /*playbackRate */,
                null /* meter */,
                null,
                mediaUrl,
                trackId,
                cues,
                null,
                DefaultTrackVolume,
            );
            return newTrack;
        } else {
            return undefined;
        }
    }

    /** Sorts the cues by their time, ascending
     * @param cues - The cues to sort
     * */
    private static sortByTime(cues: ICue[]): ICue[] {
        return cues.sort((a, b) =>
            (a.Time ?? 0) > (b.Time ?? 0)
                ? 1
                : (b.Time ?? 0) > (a.Time ?? 0)
                  ? -1
                  : 0,
        );
    }

    /** Gets a single item from either an array, or just the single value
     * @remarks The items of the array are expected to be all of the same type T.
     */
    public static getSingle<T>(set: T | T[]): T {
        return Array.isArray(set) ? (set[0] as T) : set;
    }
    /** Gets a set of items from either an array, or just the single value
     * @remarks The items of the array are expected to be all of the same type T.
     */
    public static getSet<T>(set: T | T[]): T[] {
        if (Array.isArray(set)) {
            return set;
        }
        const arr = Array<T>();
        arr.push(set);
        return arr;
    }
}
