import { ITrack } from '@/store/compilation-types';
import Track from '@/components/Track.vue';

/** @class A Handler for multi-track playback queries and operations.
 * @remarks This handles play/pause/mute operations on instances of Track components.
 * The goal is to free the compilation from multi-track handling.
 */
export default class MultitrackHandler {
    /** @constructor
     * @param {never} refs - refs with the instances of Track components (each subsequently containing a media element to act upon)
     */
    constructor(refs: never, tracks: ITrack[] | undefined) {
        this.refs = refs;
        this.tracks = tracks;
    }

    /** The refs to take the instances of TrackAudioApiPlayer from */
    refs: never;

    /** The tracks to handle */
    tracks: ITrack[] | undefined;

    /** Determines, whether all tracks in the compilation are currently playing (used with the mix mode) */
    isAllPlaying(): boolean {
        if (this.refs && this.tracks && this.tracks.length > 0) {
            return (
                this.tracks
                    ?.filter((t) => t.Id)
                    .map((track) => {
                        return this.getTrackInstance(track.Id).isPlaying;
                    })
                    .every((v) => v === true) ?? false
            );
        }
        return false;
    }

    /** Determines, whether all tracks in the compilation are currently loaded (used with the mix mode) */
    isAllTrackLoaded(): boolean {
        if (this.refs && this.tracks && this.tracks.length > 0) {
            return (
                this.tracks
                    ?.filter((t) => t.Id)
                    .map((track) => {
                        return this.getTrackInstance(track.Id).isTrackLoaded;
                    })
                    .every((v) => v === true) ?? false
            );
        }
        return false;
    }

    /** Determines, whether all tracks in the compilation are currently muted (used with the mix mode) */
    isAllTrackMuted(): boolean {
        if (this.refs && this.tracks && this.tracks.length > 0) {
            return (
                this.tracks
                    ?.filter((t) => t.Id)
                    .map((track) => {
                        return this.getTrackInstance(track.Id).isMuted;
                    })
                    .every((v) => v === true) ?? false
            );
        }
        return false;
    }

    /** Determines, whether all tracks in the compilation have their media available (used with the mix mode) */
    isAllMediaAvailable(): boolean {
        if (this.refs && this.tracks && this.tracks.length > 0) {
            return (
                this.tracks
                    ?.filter((t) => t.Id)
                    .map((track) => {
                        return this.getTrackInstance(track.Id).isMediaAvailable;
                    })
                    .every((v) => v === true) ?? false
            );
        }
        return false;
    }

    /** Determines playback progress of all tracks in the compilation, in [seconds] (used with the mix mode).
     * @returns A single representation for the progress as an average
     */
    getAllTrackPosition(): number {
        if (this.refs && this.tracks && this.tracks.length > 0) {
            const items = this.tracks
                ?.filter((t) => t.Id)
                .map((track) => {
                    return this.getTrackInstance(track.Id).currentSeconds;
                });

            if (items && items.length > 0) {
                return items.reduce((p, c) => p + c, 0) / items.length;
            }
        }
        return 0;
    }

    /** Determines, whether any track in the compilation is currently fading (used with the mix mode) */
    isAnyFading(): boolean {
        if (this.refs && this.tracks && this.tracks.length > 0) {
            return !(
                this.tracks
                    ?.filter((t) => t.Id)
                    .map((track) => {
                        return this.getTrackInstance(track.Id).isFading;
                    })
                    .every((v) => v !== true) ?? true
            );
        }
        return false;
    }

    /** Gets a reference to the track component instance.
     * @devdoc $ref's are non-reactive, see https://v3.vuejs.org/api/special-attributes.html#ref
     * Thus, referencing an instance after it has been removed from the DOM (e.g. by v-if)
     * does not work, even after it's rendered again later.
     */
    getTrackInstance(trackId: string): InstanceType<typeof Track> {
        const trackRef = 'track-' + trackId;
        const track = (this.refs[trackRef] as never)[0] as InstanceType<
            typeof Track
        >;
        return track;
    }
}
