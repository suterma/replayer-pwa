import { ITrack } from '@/store/compilation-types';
import Track from '@/components/Track.vue';
import { ComponentPublicInstance } from 'vue';

/** @class A Handler for multi-track playback queries and operations.
 * @remarks This handles play/pause/mute operations on instances of Track components.
 * The goal is to free the compilation from multi-track handling.
 */
export default class MultitrackHandler {
    /** @constructor
     * @param {{ [name: string]: Element | ComponentPublicInstance | null }} refs - refs to the instances of Track components (each subsequently containing a media element to act upon)
     * @devdoc For the refs, the $refs from the compilation component is used. See https://vuejs.org/api/component-instance.html#refs for more information about the type
     */
    constructor(
        refs: { [name: string]: Element | ComponentPublicInstance | null },
        tracks: ITrack[] | undefined,
    ) {
        this.refs = refs;
        this.tracks = tracks;
    }

    /** The refs to take the instances of TrackAudioApiPlayer from */
    refs: { [name: string]: Element | ComponentPublicInstance | null };

    /** The tracks to handle */
    tracks: ITrack[] | undefined;

    /** Determines, whether all tracks in the compilation are currently playing (used with the mix mode) */
    isAllPlaying(): boolean {
        const instances = this.getAllTrackInstances();
        if (instances) {
            return instances.every((i) => i.isPlaying) ?? false;
        }
        return false;
    }

    /** Determines, whether all tracks in the compilation are currently loaded (used with the mix mode) */
    isAllTrackLoaded(): boolean {
        const instances = this.getAllTrackInstances();
        if (instances) {
            return instances.every((i) => i.isTrackLoaded) ?? false;
        }
        return false;
    }

    /** Determines, whether all tracks in the compilation are currently muted (used with the mix mode) */
    isAllTrackMuted(): boolean {
        const instances = this.getAllTrackInstances();
        if (instances) {
            return instances.every((i) => i.isMuted) ?? false;
        }
        return false;
    }

    /** Determines, whether all tracks in the compilation have their media available (used with the mix mode) */
    isAllMediaAvailable(): boolean {
        const instances = this.getAllTrackInstances();
        if (instances) {
            return instances.every((i) => i.isMediaAvailable) ?? false;
        }
        return false;
    }

    /** Determines playback progress of all tracks in the compilation, in [seconds] (used with the mix mode).
     * @returns A single representation for the progress as an average
     */
    getAllTrackPosition(): number {
        const instances = this.getAllTrackInstances();
        if (instances) {
            const positions = instances.map((track) => {
                return track.currentSeconds;
            });

            if (positions && positions.length > 0) {
                return positions.reduce((p, c) => p + c, 0) / positions.length;
            }
        }
        return 0;
    }

    /** Determines, whether any track in the compilation is currently fading (used with the mix mode) */
    isAnyFading(): boolean {
        const instances = this.getAllTrackInstances();
        if (instances) {
            return !instances.every((i) => i.isFading !== true) ?? true;
        }
        return false;
    }

    /** Gets the references to all track component instances.
     * @remarks Expects the track refs to start with a "track-" prefix.
     * @devdoc $ref's are non-reactive, see https://v3.vuejs.org/api/special-attributes.html#ref
     * Thus, referencing an instance after it has been removed from the DOM (e.g. by v-if)
     * does not work, even after it's rendered again later.
     */
    private getAllTrackInstances(): InstanceType<typeof Track>[] | undefined {
        if (this.refs) {
            const filteredRefs = Object.keys(this.refs)
                .filter((ref) => {
                    if (ref.includes('track-')) {
                        return true;
                    }
                    return false;
                })
                .map((val) => {
                    return (this.refs[val] as never)[0] as InstanceType<
                        typeof Track
                    >;
                });
            return filteredRefs;
        }
        return undefined;
    }
}
