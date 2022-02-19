<template>
    <Track
        v-if="track"
        :track="track"
        :ref="'track-' + track.Id"
        :isEditable="false"
        :isCollapsible="false"
    ></Track>

    <template v-else>
        <!-- Tracks to work with -->
        <p>Available Track Ids</p>
        <div class="content">
            <ul>
                <template v-for="track in tracks" :key="track.Id">
                    <li>
                        {{ track.Id }}
                    </li>
                </template>
            </ul>
        </div>
    </template>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ICompilation, ITrack } from '@/store/compilation-types';
import Track from '@/components/Track.vue';
import CompilationHandler from '@/store/compilation-handler';

/** A view for playback of a single track */
export default defineComponent({
    name: 'TrackPlayer',
    components: {
        Track,
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
            const trackId = this.$route.params.id[0];
            const track = CompilationHandler.getTrackById(
                this.compilation,
                trackId,
            );
            return track;
        },
    },
});
</script>
