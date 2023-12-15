import router from '@/router';
import type { ICue } from '@/store/ICue';
import type { ITrack } from '@/store/ITrack';
import { type RouteLocationRaw } from 'vue-router';
import { isClient } from '@vueuse/shared';
import { useShare } from '@vueuse/core';
import { ref } from 'vue';
import { shareTrack } from '@/code/ui/dialogs';

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
        console.debug('TrackSharingDialog::trackUrl:apiQuery:', apiQuery);

        //Build the URL
        const route = {
            name: 'Play',
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
}
