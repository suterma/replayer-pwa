<template>
    <!-- Each track is a tile (vertically distributed), and contains all the cues -->
    <div class="tile is-ancestor">
        <div class="tile is-vertical is-parent">
            <div class="tile is-child card">
                <div class="card-content">
                    <h2 class="subtitle">
                        <span class="">{{ track?.Name }}</span>

                        <!-- Text colors similar to cues -->
                        <span
                            v-if="!showCues"
                            class="is-pulled-right ml-3 tag is-warning"
                            ><a @click="toggleBurger" role="button">
                                <!-- Text colors similar to cues -->
                                <span
                                    class="icon-text is-size-7 has-text-light"
                                    v-if="!showCues"
                                >
                                    Show
                                    {{ track?.Cues?.length }} cues</span
                                >
                            </a></span
                        >
                        <span
                            v-if="showCues"
                            class="is-pulled-right ml-3 tag is-dark"
                            ><a @click="toggleBurger" role="button">
                                <span
                                    class="icon-text is-size-7 has-text-light"
                                    v-if="showCues"
                                >
                                    Hide cues</span
                                >
                            </a></span
                        >

                        <!-- Artist info -->
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

                    <div v-show="showCues">
                        <AudioPlayer
                            ref="player"
                            :title="trackFileUrl?.fileName"
                            :src="trackFileUrl?.objectUrl"
                        ></AudioPlayer>

                        <div class="buttons">
                            <template v-for="cue in cues" :key="cue.Id">
                                <CueButton
                                    :cue="cue"
                                    @click="cueClick(cue.Time)"
                                />
                            </template>
                        </div>
                    </div>
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
            showCues: true,
        };
    },
    methods: {
        toggleBurger() {
            this.showCues = !this.showCues;
            return this.showCues;
        },

        cueClick(time: number | null) {
            if (time != null) {
                (
                    this.$refs.player as InstanceType<typeof AudioPlayer>
                ).playFrom(time);
            }
        },
        /** Finds the matching the media file (playable file content) for a track's file name, from an already loaded package
         * @remarks If strict file names do not match, a more lazy approach without case and without non-ascii characters is attempted
         */
        getMatchingPackageFileUrl(
            fileName: string | undefined,
            fileUrls: Array<MediaFile>,
        ): MediaFile | null {
            if (fileUrls && fileName) {
                let url = fileUrls.filter((fileUrl: MediaFile) =>
                    fileName.normalize().endsWith(fileUrl.fileName.normalize()),
                )[0];
                if (!url) {
                    //In case of possible weird characters, or case mismatch, try a more lazy match.
                    //See https://stackoverflow.com/a/9364527/79485 and
                    //https://stackoverflow.com/questions/20856197/remove-non-ascii-character-in-string
                    const lazyFileName = fileName
                        .toLowerCase()
                        // eslint-disable-next-line
                        .replace(/[^\x00-\x7F]/g, '');
                    console.debug(
                        'Trying to match fileName: "' +
                            fileName +
                            '" / lazyFileName: "' +
                            lazyFileName +
                            '" with fileUrls: "',
                        fileUrls,
                    );
                    url = fileUrls.filter((fileUrl: MediaFile) => {
                        var lazyUrlFileName = fileUrl.fileName
                            .toLowerCase()
                            // eslint-disable-next-line
                            .replace(/[^\x00-\x7F]/g, '');
                        console.debug('lazyUrlFileName: ', lazyUrlFileName);
                        return lazyFileName.endsWith(lazyUrlFileName);
                    })[0];
                }
                return url;
            } else {
                return null;
            }
        },
        /** Finds the matching the media file (playable file content) for a track's file name, from the local file system */
        getMatchingLocalFileUrl(
            fileName: string | undefined,
        ): MediaFile | null {
            // if (fileName) {
            //     var objectUrl = URL.createObjectURL(blob);

            //     const objectURL = window.URL.createObjectURL(file);
            // }
            return null; //TODO load the file
        },
    },
    computed: {
        cues(): Array<ICue> | undefined {
            return this.track?.Cues;
        },
        /** Returns the media file (playable file content) for a track's file name
         * @remarks if available, the tracks from a compilation package are used, otherwise the
         * files are to be loaded from the file system or from the internet
         */

        trackFileUrl(): MediaFile | null {
            const fileUrls = this.$store.getters.fileUrls as Array<MediaFile>;

            // console.debug('TrackTile::Track URL', this.track?.Url);

            let fileUrl = this.getMatchingPackageFileUrl(
                this.track?.Url,
                fileUrls,
            );
            if (fileUrl === null) {
                fileUrl = this.getMatchingLocalFileUrl(this.track?.Url);
            }
            return fileUrl;
        },
        //TODO display the ready-state of the corresponding file object
    },
});
</script>
