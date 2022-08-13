<template>
    <Experimental class="has-navbar-fixed-bottom">
        <CompilationHeader :compilation="compilation" />
        <template v-for="track in tracks" :key="track.Id">
            <TrackHeader
                :track="track"
                :isCollapsible="false"
                @click="activeTrack = track"
            />
        </template>

        <nav
            class="navbar is-fixed-bottom"
            role="form"
            aria-label="media player"
        >
            <div class="navbar-item">
                <!-- The audio player, but only once the source is available
                from the store -->
                <template v-if="mediaUrl">
                    <TrackAudioApiPlayer
                        v-if="mediaUrl"
                        ref="playerReference"
                        :title="activeTrack?.Name"
                        :mediaUrl="mediaUrl"
                        :sourceDescription="activeTrack?.Url"
                        :playbackMode="playbackMode"
                        :volume="0.5"
                    ></TrackAudioApiPlayer>
                </template>
                <!-- A simplified emulation of an empty player with a seekbar/timeline as placeholder for the missing track's URL -->
                <template v-else>
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
                </template>
            </div>
        </nav>
    </Experimental>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    ICompilation,
    ITrack,
    PlaybackMode,
    TrackDisplayMode,
} from '@/store/compilation-types';
import Experimental from '@/components/Experimental.vue';
import TrackAudioApiPlayer from '@/components/TrackAudioApiPlayer.vue';
import CompilationHeader from '@/components/CompilationHeader.vue';
import { MediaUrl } from '@/store/state-types';
import CompilationHandler from '@/store/compilation-handler';
import LongLine from '@/components/LongLine.vue';
import TrackHeader from '../components/TrackHeader.vue';

/** A Display of a complete compilation, with a simple track listing */
export default defineComponent({
    name: 'List',
    components: {
        Experimental,
        CompilationHeader,
        LongLine,
        TrackAudioApiPlayer,
        TrackHeader,
    },
    data() {
        return {
            tracksDisplayMode: TrackDisplayMode.Play,
            playbackMode: PlaybackMode.PlayTrack,
            activeTrack: null as ITrack | null,
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
    },
});
</script>

<style scoped>
.has-navbar-fixed-bottom {
    padding-bottom: 4rem;
}
</style>
