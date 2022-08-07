<template>
    <UseFocusTrap>
        <div class="modal is-active">
            <div class="modal-background"></div>
            <Experimental>
                <div class="modal-card">
                    <header class="modal-card-head">
                        <h1 class="modal-card-title title">
                            Share track '{{ track?.Name }}' via...
                        </h1>
                    </header>
                    <section class="modal-card-body">
                        <div class="control">
                            <textarea
                                class="textarea has-fixed-size is-size-7"
                                placeholder="Track link"
                                readonly
                                v-text="this.trackUrl"
                            ></textarea>
                        </div>
                        <a :href="this.trackUrl" target="_blank"
                            >Click to follow</a
                        >
                        <div class="content">
                            You are sharing the track metadata and the URL, not
                            the media file itself.
                        </div>
                    </section>
                    <footer class="modal-card-foot is-justify-content-flex-end">
                        <div class="field is-grouped">
                            <p class="control">
                                <button
                                    class="button"
                                    @click="$close(this, false)"
                                >
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
    </UseFocusTrap>
</template>

<script lang="ts">
import { ICue, Track } from '@/store/compilation-types';
import Experimental from '@/components/Experimental.vue';
import { defineComponent } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { UseFocusTrap } from '@vueuse/integrations/useFocusTrap/component';

export default defineComponent({
    name: 'TrackSharingDialog',
    components: {
        Experimental,
        UseFocusTrap,
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

    methods: {
        /** Gets the timestamp of a cue as an object key
         * @devdoc Makes sure the numeric keys are not integers, to keep a more suitable order
         * later on when creating the API query parameters
         * Javascript unfortunately orders integer object keys as first
         */
        getCueObjectKey(value: ICue): string {
            if (!value.Time) {
                return '0.0';
            }
            return value.Time.toString();
        },
    },

    computed: {
        trackUrl(): string {
            //Prepare track metadata
            let apiQuery = {
                media: this.track?.Url,
                title: this.track?.Name,
                album: this.track?.Album,
                artist: this.track?.Artist,
            };

            //Add available cues
            const cues = this.track?.Cues;
            if (cues) {
                apiQuery = Object.assign(
                    apiQuery,
                    ...cues.map((cue) => ({
                        [this.getCueObjectKey(cue)]: cue.Description,
                    })),
                );
            }
            console.debug('TrackSharingDialog::trackUrl:apiQuery:', apiQuery);

            //Build the URL
            const route = {
                name: 'Play',
                query: apiQuery,
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
