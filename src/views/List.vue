<template>
    <div class="has-navbar-fixed-bottom">
        <CompilationHeader :compilation="compilation" />

        <PlayPauseButton
            class="is-success"
            :isPlaying="isPlaying"
            @click="togglePlayPause()"
        ></PlayPauseButton>

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
                            @click="skipToPlayPause(track)"
                            title="play"
                        />
                    </div>
                </template>
                <template v-slot:left-end>
                    <TimeDisplay
                        class="level-item is-narrow"
                        :modelValue="track?.Duration"
                        :hidePlaceholder="true"
                    ></TimeDisplay>
                </template>
            </TrackHeader>
        </template>

        <nav
            class="navbar is-fixed-bottom"
            role="form"
            aria-label="media player"
        >
            <div class="navbar-item">
                <TrackAudioApiPlayer
                    ref="playerReference"
                    :title="activeTrack?.Name"
                    :mediaUrl="mediaUrl"
                    :sourceDescription="activeTrack?.Url"
                    :playbackMode="playbackMode"
                    v-model:volume.number="volume"
                    v-model:isPlaying="isPlaying"
                    @durationChanged="isPlayable = true"
                    @ended="trackEnded()"
                >
                    <button
                        :class="{
                            button: true,
                        }"
                        @click="toPreviousTrack()"
                        title="skip to previous track"
                    >
                        <BaseIcon name="skip-previous-outline" />
                    </button>
                    <PlayPauseButton
                        :isPlaying="isPlaying"
                        @click="togglePlayPause()"
                    ></PlayPauseButton>
                    <button
                        :class="{
                            button: true,
                        }"
                        @click="toNextTrack()"
                        title="skip to next track"
                    >
                        <BaseIcon name="skip-next-outline" />
                    </button>
                </TrackAudioApiPlayer>
            </div>
        </nav>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    DefaultTrackVolume,
    ICompilation,
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

            /** Indicates that a track media has been loaded and is available for play
             * @remarks Because of a lack of a dedicated event, just uses the first duration update
             * as indication of an available track media.
             */
            isPlayable: false,
            volume: DefaultTrackVolume,
        };
    },
    computed: {
        compilation(): ICompilation {
            return this.$store.getters.compilation;
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

        allTrackIds(): string[] {
            return this.tracks?.map((track) => track.Id) ?? [];
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
    },
    methods: {
        /** Skips to and toggles play/pause of the given track.
         * @remarks If the track is not yet active, tries to activate and play the track.
         * If it's the active track, just toggles play/pause
         */
        skipToPlayPause(track: ITrack): void {
            if (this.activeTrack?.Id !== track.Id) {
                this.activeTrack = track;
                this.trackPlayerInstance.playFrom(0.0);
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

        /** Determines whether the given track is the currently active track */
        isActiveTrack(track: ITrack): boolean {
            return track.Id === this.activeTrack?.Id;
        },

        /** Handler for when a track has been played to end
         * @remarks Plays the next track automatically
         */
        trackEnded(): void {
            this.toNextTrack().then(() => {
                this.updatePlaying(true);
            });
        },
    },
});
</script>

<style scoped>
.has-navbar-fixed-bottom {
    padding-bottom: 4rem;
}
</style>
