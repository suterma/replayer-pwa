<template>
    <UseFocusTrap>
        <div class="modal is-active">
            <div class="modal-background"></div>
            <Experimental>
                <div class="modal-card">
                    <form data-cy="modal-form" @submit.prevent="$close(this)">
                        <header class="modal-card-head has-cropped-text">
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
                                    v-text="trackUrl"
                                ></textarea>
                            </div>
                            <a :href="trackUrl" target="_blank"
                                >Click to follow</a
                            >
                            <div class="content">
                                You are sharing the track metadata and the URL,
                                not the media file itself.
                            </div>
                        </section>
                        <footer
                            class="modal-card-foot is-justify-content-flex-end"
                        >
                            <div class="field is-grouped">
                                <p class="control">
                                    <Hotkey
                                        :keys="['esc']"
                                        :excluded-elements="[]"
                                        v-slot="{ clickRef }"
                                    >
                                        <button
                                            class="button"
                                            :ref="clickRef"
                                            @click.prevent="$close(this, false)"
                                        >
                                            Cancel
                                        </button>
                                    </Hotkey>
                                </p>
                                <p class="control">
                                    <Hotkey
                                        :keys="['enter']"
                                        :excluded-elements="[]"
                                        v-slot="{ clickRef }"
                                    >
                                        <button
                                            v-focus
                                            type="submits"
                                            class="button is-success"
                                            :ref="clickRef"
                                        >
                                            Ok
                                        </button>
                                    </Hotkey>
                                </p>
                            </div>
                        </footer>
                    </form>
                </div>
            </Experimental>
        </div>
    </UseFocusTrap>
</template>

<script lang="ts">
import { ICue, Track } from '@/store/compilation-types';
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { UseFocusTrap } from '@vueuse/integrations/useFocusTrap/component';
import { Hotkey } from '@simolation/vue-hotkey';
import { useStore } from 'vuex';
import { MutationTypes } from '@/store/mutation-types';

export default defineComponent({
    name: 'TrackSharingDialog',
    components: {
        UseFocusTrap,
        Hotkey,
    },
    props: {
        track: Track,
    },
    setup() {
        /** Temporarily pause the use of the global app shortcuts in favor of typical
         * key event handling within this dialog. */
        const store = useStore();
        onMounted(() => {
            store.commit(MutationTypes.USE_APP_SHORTCUTS, false);
        });
        onUnmounted(() => {
            store.commit(MutationTypes.USE_APP_SHORTCUTS, true);
        });

        /** NOTE: Returning the returnValue function is required by vue3-promise-dialog */
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
