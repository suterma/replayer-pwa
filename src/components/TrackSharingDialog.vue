<template>
    <div class="modal is-active">
        <div class="modal-background"></div>
        <Experimental>
            <div class="modal-card">
                <header class="modal-card-head">
                    <h1 class="modal-card-title title">
                        Share '{{ track?.Name }}' via...
                    </h1>
                </header>
                <section class="modal-card-body">
                    <a :href="this.trackUrl" target="_blank">Link</a>
                </section>
                <footer class="modal-card-foot is-justify-content-flex-end">
                    <div class="field is-grouped">
                        <p class="control">
                            <button class="button" @click="$close(this, false)">
                                Cancel
                            </button>
                        </p>
                        <p class="control">
                            <button
                                v-focus
                                class="button is-success"
                                @click="$close(this)"
                            >
                                Ok
                            </button>
                        </p>
                    </div>
                </footer>
            </div>
        </Experimental>
    </div>
</template>

<script lang="ts">
import { Track } from '@/store/compilation-types';
import Experimental from '@/components/Experimental.vue';
import { defineComponent } from 'vue';
import { RouteLocationRaw } from 'vue-router';

export default defineComponent({
    name: 'TrackSharingDialog',
    components: {
        Experimental,
    },
    props: {
        track: Track,
    },
    setup() {
        function returnValue() {
            return true;
        }
        return {
            returnValue,
        };
    },

    computed: {
        trackUrl(): string {
            //Prepare cues and track metadata
            let apiCues = {};
            const cues = this.track?.Cues;
            if (cues) {
                apiCues = Object.assign(
                    {},
                    ...cues.map((x) => ({
                        [x.Time?.toString() ?? '0']: x.Description,
                    })),
                );
                console.debug(apiCues);
            }

            const apiTrackMetadata = {
                media: this.track?.Url,
                title: this.track?.Name,
                album: this.track?.Album,
                artist: this.track?.Artist,
            };

            //Build the URL
            const route = {
                name: 'Play',
                query: { ...apiTrackMetadata, ...apiCues },
            } as unknown as RouteLocationRaw;
            return (
                window.location.protocol +
                '//' +
                window.location.host +
                window.location.pathname +
                this.$router.resolve(route).href
            );
        },
    },
});
</script>

<style scoped></style>
