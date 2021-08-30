<template>
    <!-- Each track is a tile (vertically distributed), and contains all the cues -->
    <div class="tile is-ancestor">
        <div class="tile is-vertical is-parent">
            <div class="tile is-child box has-background-info-light">
                <h2 class="subtitle">
                    {{ track?.Name }}

                    <!-- The Navbar burger -->
                    <a
                        @click="toggleBurger"
                        role="button"
                        class="navbar-burger is-pulled-left2"
                        aria-label="menu"
                        aria-expanded="false"
                        data-target="navbarAppMenu"
                        v-bind:class="{ 'is-active': activator }"
                    >
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                        <span aria-hidden="true"></span>
                    </a>

                    <span class="is-pulled-right is-size-7 has-text-right">
                        <span v-if="track?.Artist" class="has-opacity-half">
                            by
                        </span>
                        <span class="is-italic">
                            {{ track?.Artist }}
                        </span>
                        <br />
                        <span v-if="track?.Album" class="has-opacity-half">
                            on
                        </span>
                        <span class="is-italic">
                            {{ track?.Album }}
                        </span>
                    </span>
                </h2>

                <div v-show="activator">
                    <div class="buttons">
                        <template v-for="cue in cues" :key="cue.Id">
                            <CueButton :cue="cue" @click="cueClick(cue.Time)" />
                        </template>
                    </div>

                    <AudioPlayer
                        ref="player"
                        :title="trackFileUrl?.fileName"
                        :src="trackFileUrl?.objectUrl"
                    ></AudioPlayer>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Track, ICue } from '@/store/compilation-types';
import CueButton from '@/components/CueButton.vue';
import AudioPlayer from '@/components/AudioPlayer.vue';
import { MediaFile } from '@/store/state-types';

export default defineComponent({
    name: 'TrackTile',
    components: { CueButton, AudioPlayer },
    props: {
        track: Track,
    },
    data() {
        return {
            msg: '',
            activator: false,
        };
    },
    methods: {
        toggleBurger() {
            this.activator = !this.activator;
            return this.activator;
        },

        cueClick(time: number) {
            (this.$refs.player as InstanceType<typeof AudioPlayer>).playFrom(
                time,
            );
        },
        /** Finds the matching the media file (playable file content) for a track's file name*/
        getMatchingFileUrl(
            fileName: string | undefined,
            fileUrls: Array<MediaFile>,
        ) {
            if (fileUrls && fileName) {
                let url = fileUrls.filter((fileUrl: MediaFile) =>
                    fileName.endsWith(fileUrl.fileName),
                )[0];
                if (!url) {
                    //In case of possible weird characters, or case mismatch, try an more lazy match. See https://stackoverflow.com/a/9364527/79485
                    const lazyFileName = fileName
                        .toLowerCase()
                        .replace(/\W/g, '');
                    //console.debug('lazyFileName: ', lazyFileName);
                    url = fileUrls.filter((fileUrl: MediaFile) =>
                        lazyFileName.endsWith(
                            fileUrl.fileName.toLowerCase().replace(/\W/g, ''),
                        ),
                    )[0];
                }
                return url;
            } else {
                return null;
            }
        },
    },
    computed: {
        cues(): Array<ICue> | undefined {
            return this.track?.Cues;
        },
        /** Returns the media file (playable file content) for a track's file name (from a compilation track) */

        trackFileUrl(): MediaFile | null {
            const fileUrls = this.$store.getters.fileUrls as Array<MediaFile>;

            console.debug('TrackTile::fileUrls', fileUrls);
            console.debug('TrackTile::Track URL', this.track?.Url);

            return this.getMatchingFileUrl(this.track?.Url, fileUrls);
        },
        //TODO display the ready-state of the corresponding file object
    },
});
</script>
