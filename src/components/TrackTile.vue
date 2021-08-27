<template>
    <!-- Each track is a tile (vertically distributed), and contains all the cues -->
    <div class="tile is-ancestor">
        <div class="tile is-vertical is-parent">
            <div class="tile is-child box has-background-info-light">
                <h2 class="subtitle">
                    {{ track.Name }}

                    <span class="is-pulled-right is-size-7 has-text-right">
                        <span v-if="track.Artist" class="has-opacity-half">
                            by
                        </span>
                        <span class="is-italic">
                            {{ track.Artist }}
                        </span>
                        <br />
                        <span v-if="track.Album" class="has-opacity-half">
                            on
                        </span>
                        <span class="is-italic">
                            {{ track.Album }}
                        </span>
                    </span>
                </h2>

                <div class="buttons">
                    <template v-for="cue in cues" :key="cue.Id">
                        <CueButton :cue="cue" />
                    </template>
                </div>
                <AudioElement
                    :title="trackFileUrl?.fileName"
                    :src="trackFileUrl?.objectUrl"
                ></AudioElement>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track, ICue } from '@/store/compilation-types';
import CueButton from '@/components/CueButton.vue';
import AudioElement from '@/components/AudioElement.vue';
import { MediaFile } from '@/store/state-types';

export default defineComponent({
    name: 'TrackTile',
    components: { CueButton, AudioElement },
    props: {
        track: Track,
    },
    methods: {},
    computed: {
        cues(): Array<ICue> | undefined {
            return this.track?.Cues;
        },
        /** Returns the media file (playable file content) for a track's file name (from a compilation track) */

        trackFileUrl(): MediaFile | null {
            const fileUrls = this.$store.getters.fileUrls as Array<MediaFile>;

            console.debug('TrackTile::fileUrls', fileUrls);
            console.debug('TrackTile::Track URL', this.track?.Url);

            if (fileUrls) {
                //TODO maybe only match case-insensitive, and without special chars
                const matchingFileUrl = fileUrls.filter((fileUrl: MediaFile) =>
                    this.track?.Url.endsWith(fileUrl.fileName),
                );

                return matchingFileUrl[0];
            } else {
                return null;
            }
        },
        //TODO display the ready-state of the corresponding file object
    },
});
</script>
<style scoped>
.has-opacity-half {
    opacity: 50%;
}
</style>
