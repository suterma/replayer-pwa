<template>
    <ModalDialog submitButtonText="Done" wide>
        <template #title>Share track '{{ track?.Name }}' via...</template>
        <template #body>
            <div class="control">
                <textarea
                    class="textarea has-fixed-size is-size-7"
                    placeholder="Track link"
                    readonly
                    v-text="trackUrl"
                ></textarea>
            </div>
            <p>
                <a :href="trackUrl" target="_blank">Click to follow</a>
            </p>
            <p>
                You are sharing the track metadata and the URL, not the media
                file itself.
            </p>
        </template>
    </ModalDialog>
</template>

<script lang="ts">
import { ICue, Track } from '@/store/compilation-types';
import { PropType, defineComponent } from 'vue';
import { RouteLocationRaw } from 'vue-router';
import ModalDialog from '@/components/dialogs/ModalDialog.vue';

export default defineComponent({
    name: 'TrackSharingDialog',
    components: {
        ModalDialog,
    },
    props: {
        track: {
            type: Object as PropType<Track>,
        },
    },
    setup() {
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
