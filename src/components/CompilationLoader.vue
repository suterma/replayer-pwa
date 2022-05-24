<template><div></div></template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ActionTypes } from '@/store/action-types';
import { settingsMixin } from '@/mixins/settingsMixin';
import CompilationParser from '@/store/compilation-parser';
import { MutationTypes } from '@/store/mutation-types';

/** A Loader for packages or tracks, from the URL
 * @remarks Loads items from the URL parameters
 * @devdoc According to my current understanding this must be run
 * as part of a component. Otherwise the URL fragment part is not processed
 * as the query part within vue-router
 */
export default defineComponent({
    name: 'CompilationLoader',
    components: {},
    mixins: [settingsMixin],
    mounted: function (): void {
        //Check whether a given compilation is to be loaded (by Track API)
        console.debug('CompilationLoader::mounted:route', this.$route);
        const query = this.$route?.query;

        //Handle a Track API Request (mandatory media is available)
        if (query && query['media'] !== undefined) {
            console.debug(
                'CompilationLoader::mounted:handeling Track API request for media:',
                query['media'],
            );
            const track = CompilationParser.parseFromUrlQuery(query);
            if (track && track.Url) {
                this.$store
                    .dispatch(ActionTypes.USE_MEDIA_FROM_URL, track.Url)
                    .then(() => {
                        this.$store.commit(MutationTypes.ADD_TRACK, track);
                        const firstCueId = track.Cues[0]?.Id;
                        console.debug(
                            'CompilationLoader::mounted:firstCueId:',
                            firstCueId,
                        );
                        if (firstCueId) {
                            this.$store.commit(
                                MutationTypes.UPDATE_SELECTED_CUE_ID,
                                firstCueId,
                            );
                        }
                    })
                    .then(() => {
                        this.removeQuery();
                    });
                return; //With this URL's track loading
            } else {
                this.$store.commit(
                    MutationTypes.PUSH_ERROR_MESSAGE,
                    'No valid track media URL found, no track is loaded',
                );
            }
        }
        //Handle a Package API Request (mandatory package is available)
        if (query && query['package']) {
            console.debug(
                'CompilationLoader::mounted:handeling Track API request for package:',
                query['package'],
            );

            this.$store.dispatch(ActionTypes.LOAD_FROM_URL, query['package']);
            this.removeQuery();
            return; //With this package loading
        }
    },
    methods: {
        /** Removes the API query from the fragment, since it has been applied now
         */
        removeQuery() {
            this.$router.replace({ query: undefined });
        },
    },
});
</script>
