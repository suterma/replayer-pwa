<template><div></div></template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ActionTypes } from '@/store/action-types';
import { settingsMixin } from '@/mixins/settingsMixin';
import CompilationParser from '@/store/compilation-parser';
import { MutationTypes } from '@/store/mutation-types';

/** A Loader for packages or tracks, from the URL
 * @remarks The order is as follows:
 * 1) if given, load items from the URL parameters (discards any previously persisted compilation)
 * 2) automatically retrieve an existing persisted compilation
 * //TODO rework this as something else than a component, maybe into somethign like the persistence plugin
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
                    })
                    .then(() => {
                        //get rid of the query, since it has been applied now
                        this.$router.replace({ query: undefined });
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
            //get rid of the query, since it has been applied now
            this.$router.replace({ query: undefined });
            return; //With this package loading
        }
    },
});
</script>
