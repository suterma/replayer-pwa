<template>
    <div class="has-navbar-fixed-bottom">
        <CompilationHeader :compilation="compilation" />

        <PlayPauseButton
            class="is-success"
            :isPlaying="isPlaying"
            :isLoading="isFading"
            @click="togglePlayPause()"
        >
        </PlayPauseButton>

        <template v-for="track in tracks" :key="track.Id">
            <TrackHeader
                :track="track"
                :isCollapsible="false"
                :isPlaying="isTrackPlaying(track)"
                :isTrackLoaded="true"
                :isActive="isActiveTrack(track)"
            >
                <template v-slot:left-start>
                    <div class="level-item is-narrow">
                        <PlayPauseButton
                            :isPlaying="isTrackPlaying(track)"
                            :isLoading="isTrackFading(track)"
                            @click="skipToPlayPause(track)"
                            title="play"
                        />
                    </div>
                </template>
                <template v-slot:left-end>
                    <TimeDisplay
                        class="level-item is-narrow is-hidden-mobile"
                        :modelValue="track?.Duration"
                        :hidePlaceholder="true"
                    ></TimeDisplay>
                </template>
            </TrackHeader>
        </template>

        <nav
            class="navbar is-fixed-bottom is-spaced"
            role="form"
            aria-label="media player"
        >
            <div class="navbar-item is-expanded">
                <nav class="level">
                    <div class="level-item has-text-centered">
                        <div>
                            <p class="heading">Track</p>
                            <div class="buttons has-addons is-centered">
                                <button
                                    class="button"
                                    :disabled="!hasPreviousTrack"
                                    @click="toPreviousTrack()"
                                    title="skip to previous track"
                                >
                                    <BaseIcon name="skip-previous-outline" />
                                </button>

                                <button class="button is-indicator">
                                    {{ activeTrack?.Name }}
                                </button>

                                <button
                                    class="button"
                                    :disabled="!hasNextTrack"
                                    @click="toNextTrack()"
                                    title="skip to next track"
                                >
                                    <BaseIcon name="skip-next-outline" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="level-item has-text-centered">
                        <div>
                            <p class="heading">Cue</p>
                            <div class="buttons has-addons is-centered">
                                <button
                                    class="button"
                                    :disabled="!hasPreviousCue"
                                    @click="toPreviousCue()"
                                    title="skip to previous cue"
                                >
                                    <BaseIcon name="skip-previous-outline" />
                                </button>
                                <button class="button is-indicator">
                                    {{ playingCue?.Description }}
                                </button>
                                <button
                                    class="button"
                                    :disabled="!hasNextCue"
                                    @click="toNextCue()"
                                    title="skip to next cue"
                                >
                                    <BaseIcon name="skip-next-outline" />
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="level-item has-text-centered">
                        <div>
                            <p class="heading">Play</p>
                            <div class="buttons has-addons is-centered">
                                <!-- Stop (do not show on small devices, user still can use play/pause) -->
                                <button
                                    class="button is-hidden-mobile"
                                    @click.prevent="stop()"
                                    title="Stop"
                                >
                                    <BaseIcon name="stop" />
                                </button>
                                <PlayPauseButton
                                    :isPlaying="isPlaying"
                                    v-model:isLoading.boolean="isFading"
                                    @click="togglePlayPause()"
                                >
                                </PlayPauseButton>
                            </div>
                        </div>
                    </div>
                </nav>
            </div>

            <!-- The player  -->
            <div class="navbar-item is-expanded">
                <TrackAudioApiPlayer
                    ref="playerReference"
                    :title="activeTrack?.Name"
                    :mediaUrl="mediaUrl"
                    :sourceDescription="activeTrack?.Url"
                    :playbackMode="playbackMode"
                    v-model:volume.number="volume"
                    v-model:isPlaying="isPlaying"
                    @durationChanged="calculateCueDurations"
                    @ended="trackEnded()"
                    v-model:isFading.boolean="isFading"
                    :autoplay="true"
                    :showTransportControls="false"
                >
                    <!-- Stop (do not show on small devices, user still can use play/pause)
          <button class="button is-hidden-mobile" @click.prevent="stop()" title="Stop">
            <BaseIcon name="stop" />
          </button>

          <button class="button" :disabled="!hasPrevious" @click="toPreviousTrack()" title="skip to previous track">
            <BaseIcon name="skip-previous-outline" />
          </button>
          <PlayPauseButton :isPlaying="isPlaying" v-model:isLoading.boolean="isFading" @click="togglePlayPause()">
          </PlayPauseButton>
          <button :class="{
              button: true,
          }" :disabled="!hasNext" @click="toNextTrack()" title="skip to next track">
            <BaseIcon name="skip-next-outline" />
          </button> -->
                </TrackAudioApiPlayer>
            </div>
            <!-- The cue buttons -->
            <!-- <div class="navbar-item is-expanded">
                <div class="buttons">
                    <template v-for="cue in activeTrack?.Cues" :key="cue.Id">
                        <CueButton
                            :disabled="!mediaUrl || cue.Duration == null"
                            :cue="cue"
                            :isTrackPlaying="isPlaying"
                            :currentSeconds="currentSeconds"
                       
                        
                            @click="cueClick(cue)"   />
                    </template>
                </div>
            </div> -->
            <!-- The current cue -->
            <!-- Current Cue:
            <div class="navbar-item is-expanded">
                <div class="buttons">
                    <template v-for="cue in activeTrack?.Cues" :key="cue.Id">
                        <CueButton
                            v-show="
                                cue.Time !== null &&
                                currentSeconds >= cue.Time &&
                                currentSeconds < cue.Time + (cue.Duration ?? 0)
                            "
                            :disabled="!mediaUrl || cue.Duration == null"
                            :cue="cue"
                            :isTrackPlaying="isPlaying"
                            :currentSeconds="currentSeconds"
                       
                       
                            @click="cueClick(cue)"  />
                    </template>
                </div>
            </div> -->
        </nav>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    DefaultTrackVolume,
    ICompilation,
    ICue,
    ITrack,
    PlaybackMode,
    TrackDisplayMode,
} from '@/store/compilation-types';
import TrackAudioApiPlayer from '@/components/TrackAudioApiPlayer.vue';
import CompilationHeader from '@/components/CompilationHeader.vue';
import { MediaUrl } from '@/store/state-types';
import CompilationHandler from '@/store/compilation-handler';
import TrackHeader from '../components/TrackHeader.vue';
import PlayPauseButton from '@/components/buttons/PlayPauseButton.vue';
import TimeDisplay from '@/components/TimeDisplay.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import VueScrollTo from 'vue-scrollto';
import { MutationTypes } from '@/store/mutation-types';

/** A Display of a complete compilation, with a simple track listing */
export default defineComponent({
    name: 'List',
    components: {
        CompilationHeader,
        TrackAudioApiPlayer,
        TrackHeader,
        PlayPauseButton,
        TimeDisplay,
        BaseIcon,
    },
    data() {
        return {
            tracksDisplayMode: TrackDisplayMode.Play,
            playbackMode: PlaybackMode.PlayTrack,
            activeTrack: null as ITrack | null,
            /** Flag to indicate whether the player is currently playing
             */
            isPlaying: false,
            /** Readonly flag to indicate whether the player is currently fading */
            isFading: false,

            volume: DefaultTrackVolume,
        };
    },
    computed: {
        compilation(): ICompilation {
            return this.$store.getters.compilation;
        },

        currentSeconds(): number {
            return this.trackPlayerInstance?.currentSeconds;
        },

        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },
        tracks(): Array<ITrack> | undefined {
            return this.compilation.Tracks as Array<ITrack> | undefined;
        },
        /** Gets the media object URL, if available
         */
        mediaUrl(): string | undefined {
            return this.trackMediaUrl?.url;
        },

        /** Gets the currently playing cue, if available
         */
        playingCue(): ICue | null {
            return (
                this.activeTrack?.Cues.filter(
                    (cue) =>
                        cue.Time !== null &&
                        this.currentSeconds >= cue.Time &&
                        this.currentSeconds < cue.Time + (cue.Duration ?? 0),
                )[0] ?? null
            );
        },

        allTrackIds(): string[] {
            return this.tracks?.map((track) => track.Id) ?? [];
        },

        allActiveTrackCueIds(): string[] {
            return this.activeTrack?.Cues.map((cue) => cue.Id) ?? [];
        },

        /** Returns the media URL (playable file content) for a track's file name
         * @remarks if available, the tracks from a compilation package are used, otherwise the
         * files are to be loaded from the file system or from the internet
         */
        trackMediaUrl(): MediaUrl | null {
            const mediaUrls = this.$store.getters.mediaUrls as Map<
                string,
                MediaUrl
            >;
            let mediaUrl = CompilationHandler.getMatchingPackageMediaUrl(
                this.activeTrack?.Url,
                mediaUrls,
            );
            return mediaUrl;
        },
        /** Gets a reference to the player instance.
         * @devdoc $ref's are non-reactive, see https://v3.vuejs.org/api/special-attributes.html#ref
         * Thus, referencing an instance after it has been removed from the DOM (e.g. by v-if)
         * does not work, even after it's rendered again later.
         */
        trackPlayerInstance(): InstanceType<typeof TrackAudioApiPlayer> {
            return this.$refs.playerReference as InstanceType<
                typeof TrackAudioApiPlayer
            >;
        },

        /** Whether the active track has a previous track
         * @devdoc Calculated by whether the active track is not the first in all available
         */
        hasPreviousTrack(): boolean {
            return this.allTrackIds[0] !== this.activeTrack?.Id;
        },
        /** Whether the active track has a previous track
         * @devdoc Calculated by whether the active track is not the last in all available
         */
        hasNextTrack(): boolean {
            return this.allTrackIds.slice(-1)[0] !== this.activeTrack?.Id;
        },
        /** Whether the playing cue has a previous cue
         */
        hasPreviousCue(): boolean {
            return this.allActiveTrackCueIds[0] !== this.playingCue?.Id;
        },
        /** Whether the playing cue has a next cue
         */
        hasNextCue(): boolean {
            return (
                this.allActiveTrackCueIds.slice(-1)[0] !== this.playingCue?.Id
            );
        },
    },
    methods: {
        stop(): void {
            this.trackPlayerInstance.stop();
            this.activeTrack = null;
        },
        /** Updates the track duration and calculates the cue durations */
        calculateCueDurations(trackDurationSeconds: number) {
            if (this.activeTrack) {
                const trackId = this.activeTrack.Id;
                this.$store.commit(MutationTypes.UPDATE_DURATIONS, {
                    trackId,
                    trackDurationSeconds,
                });
            }
        },
        /** Visually scrolls to the given track, making it appear.
         */
        scrollToTrack(track: ITrack) {
            if (track) {
                const trackElement = document.getElementById(
                    'track-' + track.Id,
                );

                VueScrollTo.scrollTo(trackElement, {
                    /** Only scroll into view, not necessarily on top */
                    force: false,
                    /** empirical value (taking into account the non-existing fixed top navbar) */
                    offset: -22,
                    /** Avoid interference with the key press overlay */
                    cancelable: false,
                });
            }
        },
        /** Skips to the given track.
         * @remarks If the track is not yet active, tries to activate the track (which will autoplay).
         * If it's the active track, just toggles play/pause
         */
        skipToPlayPause(track: ITrack): void {
            if (this.activeTrack?.Id !== track.Id) {
                this.activeTrack = track;
                //will autoplay
                //                this.trackPlayerInstance.playFrom(0.0);
                this.trackPlayerInstance.seekToSeconds(0);
            } else {
                //same track: just toggle playback
                this.trackPlayerInstance.togglePlayback();
            }
        },

        /** Toggles play/pause of the current track.
         * @remarks If no track is yet active, tries to activate the first track.
         */
        togglePlayPause(): void {
            if (!this.activeTrack) {
                const firstTrack =
                    this.tracks?.find((x) => x !== undefined) ?? null;
                this.activeTrack = firstTrack;
            }

            if (this.activeTrack) {
                this.updatePlaying(!this.isPlaying);
            }
        },

        toPreviousTrack(): Promise<void> {
            return new Promise((resolve, reject) => {
                if (this.tracks && this.activeTrack) {
                    const indexOfSelected = this.allTrackIds.indexOf(
                        this.activeTrack.Id,
                    );
                    const prevTrackId = this.allTrackIds[indexOfSelected - 1];
                    const previousTrack = this.tracks.filter(
                        (track) => track.Id === prevTrackId,
                    )[0];
                    if (previousTrack) {
                        this.skipToPlayPause(previousTrack);
                        resolve();
                    } else {
                        reject('No previous track available.');
                    }
                }
            });
        },
        toNextTrack(): Promise<void> {
            return new Promise((resolve, reject) => {
                if (this.tracks && this.activeTrack) {
                    const indexOfSelected = this.allTrackIds.indexOf(
                        this.activeTrack.Id,
                    );
                    const nextTrackId = this.allTrackIds[indexOfSelected + 1];
                    const nextTrack = this.tracks.filter(
                        (track) => track.Id === nextTrackId,
                    )[0];
                    if (nextTrack) {
                        this.skipToPlayPause(nextTrack);
                        resolve();
                    } else {
                        reject('No next track available.');
                    }
                }
            });
        },

        toPreviousCue(): Promise<void> {
            return new Promise((resolve, reject) => {
                if (this.activeTrack && this.playingCue) {
                    const indexOfSelected = this.allActiveTrackCueIds.indexOf(
                        this.playingCue.Id,
                    );
                    const prevCueId =
                        this.allActiveTrackCueIds[indexOfSelected - 1];
                    const previousCue = this.activeTrack.Cues.filter(
                        (cue) => cue.Id === prevCueId,
                    )[0];
                    if (previousCue && previousCue.Time != null) {
                        this.trackPlayerInstance.seekToSeconds(
                            previousCue.Time,
                        );
                        resolve();
                    } else {
                        reject('No previous cue or no cue time available.');
                    }
                }
            });
        },

        toNextCue(): Promise<void> {
            return new Promise((resolve, reject) => {
                if (this.activeTrack && this.playingCue) {
                    const indexOfSelected = this.allActiveTrackCueIds.indexOf(
                        this.playingCue.Id,
                    );
                    const nextCueId =
                        this.allActiveTrackCueIds[indexOfSelected + 1];
                    const nextCue = this.activeTrack.Cues.filter(
                        (cue) => cue.Id === nextCueId,
                    )[0];
                    if (nextCue && nextCue.Time != null) {
                        this.trackPlayerInstance.seekToSeconds(nextCue.Time);
                        resolve();
                    } else {
                        reject('No next cue or no cue time available.');
                    }
                }
            });
        },

        /** Updates the playing flag from the associated player event */
        updatePlaying(value: boolean) {
            console.debug(
                `Track(${this.activeTrack?.Name})::updatePlaying:value:` +
                    value,
            );
            this.isPlaying = value;
        },
        /** Determines whether the given track is currently playing */
        isTrackPlaying(track: ITrack): boolean {
            return this.isActiveTrack(track) && this.isPlaying;
        },

        /** Determines whether the given track is currently fading */
        isTrackFading(track: ITrack): boolean {
            return this.isActiveTrack(track) && this.isFading;
        },

        /** Determines whether the given track is the currently active track */
        isActiveTrack(track: ITrack): boolean {
            return track.Id === this.activeTrack?.Id;
        },

        /** Handler for when a track has been played to end
         * @remarks Plays the next track automatically
         */
        trackEnded(): void {
            this.toNextTrack().then(() => {
                //TODO use a more dynamic approach
                //this assumes a fixed timeout after which the track is playable (loaded up to oncanplay)
                setTimeout(() => {
                    this.updatePlaying(true);
                }, 500);
            });
        },
    },
    watch: {
        /** Handle scrolling to the active track.
         * @remarks This is intentionally only invoked on when the active track changes.
         */
        activeTrack(track: ITrack | null) {
            console.debug('scrolling to track ', track?.Name);
            if (track) {
                this.scrollToTrack(track);
            }
        },
    },
});
</script>

<style scoped>
.has-navbar-fixed-bottom {
    padding-bottom: 4rem;
}
</style>
