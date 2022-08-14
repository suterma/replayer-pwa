<template>
    <div class="has-navbar-fixed-bottom">
        <CompilationHeader :compilation="compilation" />
        <template v-for="track in tracks" :key="track.Id">
            <!-- <button class="button is-nav"> -->
            <TrackHeader
                :track="track"
                :isCollapsible="false"
                :isPlaying="isTrackPlaying(track)"
                :isTrackLoaded="true"
            >
                <template v-slot:left>
                    <div class="level-item is-narrow">
                        <NavButton
                            title="play"
                            iconName="play"
                            @click="playTrack(track)"
                        />
                    </div>
                </template>
            </TrackHeader>
            <!-- </button> -->
        </template>

        {{ volume }} {{ isPlaying }}

        <nav
            class="navbar is-fixed-bottom"
            role="form"
            aria-label="media player"
        >
            <div class="navbar-item">
                <!-- The audio player, but only once the source is available
                from the store -->
                <!-- <template v-if="mediaUrl"> -->
                <TrackAudioApiPlayer
                    ref="playerReference"
                    :title="activeTrack?.Name"
                    :mediaUrl="mediaUrl"
                    :sourceDescription="activeTrack?.Url"
                    @trackPlaying="updatePlaying"
                    :playbackMode="playbackMode"
                    v-model:volume.number="volume"
                ></TrackAudioApiPlayer>
                <!-- </template> -->
                <!-- A simplified emulation of an empty player with a seekbar/timeline as placeholder for the missing track's URL -->
                <!-- <template v-else>
                    <div class="field player-panel is-fullwidth">
                        <p class="control">
                            <button disabled class="button is-fullwidth">
                                <LongLine
                                    :text="`Fetching resource ${activeTrack?.Url}`"
                                    :hasProgress="true"
                                    :clipLeft="true"
                                />
                            </button>
                        </p>
                    </div>
                </template> -->
            </div>
        </nav>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
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
import NavButton from '@/components/NavButton.vue';

/** A Display of a complete compilation, with a simple track listing */
export default defineComponent({
    name: 'List',
    components: {
        CompilationHeader,
        TrackAudioApiPlayer,
        TrackHeader,
        NavButton,
    },
    data() {
        return {
            tracksDisplayMode: TrackDisplayMode.Play,
            playbackMode: PlaybackMode.PlayTrack,
            activeTrack: null as ITrack | null,
            /** Flag to indicate whether the player is currently playing
             */
            isPlaying: false,
            volume: 0.5,
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
        playTrack(track: ITrack): void {
            this.activeTrack = track;
            this.trackPlayerInstance.playFrom(0.0);
        },

        /** Updates the playing flag from the associated player event */
        updatePlaying(value: boolean) {
            console.debug(
                `Track(${this.activeTrack?.Name})::updatePlaying:value:` +
                    value,
            );
            this.isPlaying = value;
        },

        isTrackPlaying(track: ITrack): boolean {
            return track.Id === this.activeTrack?.Id && this.isPlaying;
        },
    },
});
</script>

<style scoped>
.has-navbar-fixed-bottom {
    padding-bottom: 4rem;
}
</style>
