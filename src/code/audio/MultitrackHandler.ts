import Track from '@/components/Track.vue';
import { ComponentPublicInstance } from 'vue';

/** @class A Handler for multi-track playback queries and operations.
 * @remarks This handles play/pause/mute operations on instances of Track components.
 * The goal is to free the compilation from multi-track handling.
 */
export default class MultitrackHandler {
    /** @constructor
     * @param {{ [name: string]: Element | ComponentPublicInstance | null }} refs - refs to the instances of components (will be filtered to tracks, each subsequently containing a media element to act upon)
     * @devdoc For the refs, the $refs from the compilation component is used. See https://vuejs.org/api/component-instance.html#refs for more information about the type
     */
    constructor(refs: {
        [name: string]: Element | ComponentPublicInstance | null;
    }) {
        this.refs = refs;
    }

    /** The refs to take the instances of TrackAudioApiPlayer from */
    refs: { [name: string]: Element | ComponentPublicInstance | null };

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

    /** Determines, whether any track in the compilation is currently soloed (used with the mix mode) */
    isAnyTrackSoloed(): boolean {
        const instances = this.getAllTrackInstances();
        if (instances) {
            return !instances.every((i) => !i.isSoloed) ?? false;
        }
        return false;
    }
    /** Determines, whether all tracks in the compilation are currently solo (used with the mix mode) */
    isAllTrackSoloed(): boolean {
        const instances = this.getAllTrackInstances();
        if (instances) {
            return !instances.every((i) => i.isSoloed !== true) ?? true;
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

    /** Determines the duration of all tracks in the compilation, in [seconds] (used with the mix mode).
     * @returns A single representation for the duration, which is taken from the largest duration
     */
    getAllTrackDuration(): number | null {
        const instances = this.getAllTrackInstances();
        if (instances) {
            const durations = instances.map((track) => {
                return track.trackDuration;
            });

            // when all durations are available, take the max duration
            if (
                durations &&
                durations.length > 0 &&
                durations.every((d) => d !== null)
            ) {
                return Math.max(...durations.map((v) => (v === null ? 0 : v)));
            }
        }
        return null;
    }

    /** Determines, whether any track in the compilation is currently fading (used with the mix mode) */
    isAnyFading(): boolean {
        const instances = this.getAllTrackInstances();
        if (instances) {
            return !instances.every((i) => i.isFading !== true) ?? true;
        }
        return false;
    }

    /** Toggles the mute state of all tracks, according to whether all tracks are currently muted */
    toggleMute(): void {
        const allMuted = this.isAllTrackMuted();
        const instances = this.getAllTrackInstances();

        if (instances) {
            instances.forEach((instance) => {
                instance.toggleMute(!allMuted);
            });
        }
    }

    /** Toggles the solo state of all tracks, according to whether all tracks are currently solo */
    toggleSolo(): void {
        const allSoloed = this.isAllTrackSoloed();
        const instances = this.getAllTrackInstances();
        if (instances) {
            instances.forEach((instance) => {
                instance.toggleSolo(!allSoloed);
            });
        }
    }

    /** Toggles the play state of all tracks, according to whether all tracks are currently playing */
    togglePlayPause(): void {
        const instances = this.getAllTrackInstances();

        if (instances) {
            if (this.isAllPlaying()) {
                instances.forEach((instance) => {
                    instance.pause();
                });
            } else {
                // Start playback for all, but only after the current event loop has finished
                // See https://nodejs.dev/en/learn/understanding-processnexttick/
                // Doing it this way makes sure that:
                // a) the preceding synchTracks() operation has finished (inside the VueJs event loop) beforehand
                // b) the play operations themselves take place as synchronously as possible
                // Tests on slower machines and with may tracks have show that this special handling has a huge positive
                // impact on the timeliness the multitrack playback
                process.nextTick(() => {
                    instances.forEach((instance) => {
                        instance.play();
                    });
                });
            }
        }
    }

    /** Stops playback for all tracks */
    stop(): void {
        const instances = this.getAllTrackInstances();
        if (instances) {
            instances.forEach((instance) => {
                instance.stop();
            });
        }
    }

    /** Seeks to the given position for all tracks */
    seekTo(position: number): void {
        const instances = this.getAllTrackInstances();
        if (instances) {
            instances.forEach((instance) => {
                instance.seekToSeconds(position);
            });
        }
    }

    /** Seeks the given amount for all tracks */
    seek(seconds: number): void {
        const currentPosition = this.getAllTrackPosition();
        const instances = this.getAllTrackInstances();
        if (instances) {
            instances.forEach((instance) => {
                instance.seekToSeconds(currentPosition + seconds);
            });
        }
    }

    /** Synchronizes all track positions to the average position of them. */
    synchTracks(): void {
        const currentPosition = this.getAllTrackPosition();
        const instances = this.getAllTrackInstances();
        if (instances) {
            instances.forEach((instance) => {
                instance.seekToSeconds(currentPosition);
            });
        }
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
