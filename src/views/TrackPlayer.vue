<template>
    <Track
        v-if="track"
        :track="track"
        :ref="'track-' + track.Id"
        :displayMode="this.trackDisplayMode"
    ></Track>

    <template v-else>
        <p>No matching track is available.</p>
    </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import {
    ICompilation,
    ITrack,
    TrackDisplayMode,
} from '@/store/compilation-types';
import Track from '@/components/Track.vue';
import CompilationHandler from '@/store/compilation-handler';

/** A view for playback of a single track, expanded and not collapsible */
export default defineComponent({
    name: 'TrackPlayer',
    components: {
        Track,
    },
    data() {
        return {
            trackDisplayMode: TrackDisplayMode.Play,
        };
    },
    computed: {
        compilation(): ICompilation {
            return this.$store.getters.compilation;
        },

        /** Gets the list of tracks within this compilation */
        tracks(): Array<ITrack> | undefined {
            return this.compilation?.Tracks;
        },

        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },

        /** Gets the track, matching the id parameter */
        track(): ITrack | undefined {
            const trackId = this.$route.params.id as string;
            console.debug('TrackPlayer::track:trackId', trackId);
            const track = CompilationHandler.getTrackById(
                this.compilation,
                trackId,
            );
            return track;
        },
    },
});
</script>
