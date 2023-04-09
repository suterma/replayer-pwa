import Track from '@/components/Track.vue';
import { ComponentPublicInstance } from 'vue';

/** @class A Handler for multi-track playback queries and operations.
 * @remarks This handles play/pause/mute operations on instances of Track components.
 * The goal is to free the compilation from multi-track handling.
 * @devdoc The instances are retrieved for each call. Reusing instances has led to undefined states.
 * @devdoc //TODO Later, when using Pinia the getters for these should be reworked, to not use data from the actual track
 * instances but from the Pinia store. I would expect this would ease CPU burden by a quite large factor, omitting the need to get all those track instances each time
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

    /** Determines, whether all tracks in the compilation are currently playing (used with the mix mode)
     */
    isAllPlaying(): boolean {
        const instances = this.getAllTrackInstances();

        if (instances) {
            return instances.every((i) => i.isPlaying) ?? false;
        }
        return false;
    }

    /** Determines, whether all tracks in the compilation are currently paused (used with the mix mode) */
    isAllPaused(): boolean {
        const instances = this.getAllTrackInstances();
        if (instances) {
            return instances.every((i) => !i.isPlaying) ?? false;
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
     * @returns A single representation for the progress. If a single track is active, it's value is used, otherwise some average.
     */
    getAllTrackPosition(): {
        currentSeconds: number;
        range: number;
    } {
        const instances = this.getAllTrackInstances();

        if (instances) {
            const positions = instances.map((track) => {
                return track.currentSeconds;
            });

            const min = Math.min(...positions);
            const max = Math.max(...positions);
            const range = max - min;

            const activeTrack = instances.filter((track) => {
                return track.isActiveTrack;
            })[0];
            if (activeTrack) {
                return {
                    currentSeconds: activeTrack.currentSeconds,
                    range: range,
                };
            } else {
                if (positions && positions.length > 0) {
                    //TODO here, an optimum between unnecessary many events and a reasonable value has to be found.

                    // just take the first
                    return { currentSeconds: positions[0] ?? 0, range: range };

                    // calculate the average
                    //return positions.reduce((p, c) => p + c, 0) / positions.length;
                }
            }
        }
        return { currentSeconds: 0, range: 0 };
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
        if (this.isAllPlaying()) {
            this.pause();
        } else {
            this.play();
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

    /** Pauses playback for all tracks. Only issues a pause command for tracks which are not yet fading
     * @param {InstanceType<typeof Track>[]} instances - When set, the instances to use. Otherwise, all available instances are retrieved and used
     */
    pause(): void {
        const instances = this.getAllTrackInstances();
        if (instances) {
            /** Note: Tests on slower machines have shown that a deferred action (on NextTick) is not beneficial here.
             * However, testing for already ongoing pause/fadeouts prevent double actions and thus unwanted fading aborts.
             */
            if (instances) {
                instances.forEach((instance) => {
                    if (instance.isPlaying && !instance.isFading) {
                        instance.pause();
                    }
                });
            }
        }
    }

    /** Starts playback for all tracks, on next Tick
     * @param {InstanceType<typeof Track>[]} instances - When set, the instances to use. Otherwise, all available instances are retrieved and used
     */
    play(): void {
        const instances = this.getAllTrackInstances();

        // Start playback for all, but only after the current event loop has finished
        // See https://nodejs.dev/en/learn/understanding-processnexttick/
        // Doing it this way makes sure that:
        // a) the preceding synchTracks() operation has finished (inside the VueJs event loop) beforehand
        // b) the play operations themselves take place as synchronously as possible
        // Tests on slower machines and with may tracks have show that this special handling has a huge positive
        // impact on the timeliness the multitrack playback
        process.nextTick(() => {
            if (instances) {
                instances.forEach((instance) => {
                    instance.play();
                });
            }
        });
    }

    /** Seeks to the given position for all tracks
     */
    seekToSeconds(position: number): void {
        const instances = this.getAllTrackInstances();
        if (instances) {
            instances.forEach((instance) => {
                instance.seekToSecondsSilent(position);
            });
        }
    }

    /** Seeks the given amount for all tracks */
    seek(seconds: number): void {
        const instances = this.getAllTrackInstances();
        const position = this.getAllTrackPosition();
        if (instances) {
            instances.forEach((instance) => {
                instance.seekToSecondsSilent(position.currentSeconds + seconds);
            });
        }
    }

    /** Synchronizes all track positions. */
    synchTracks(): void {
        const instances = this.getAllTrackInstances();
        const currentSeconds = this.getAllTrackPosition().currentSeconds;
        if (instances) {
            process.nextTick(() => {
                instances.forEach((instance) => {
                    instance.seekToSecondsSilent(currentSeconds);
                });
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