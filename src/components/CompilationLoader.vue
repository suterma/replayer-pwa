<template>
    <!-- Query the user in the modal dialog whether to load an existing compilation, if required -->
    <div :class="{ modal: true, 'is-active': showDialog }">
        <div class="modal-background"></div>

        <div class="modal-card">
            <header class="modal-card-head">
                <h1 class="modal-card-title title">
                    Retrieve last compilation?
                </h1>
            </header>
            <section class="modal-card-body">
                <div class="content">
                    A previously preserved compilation is available. Do you want
                    to retrieve it or discard it?
                </div>
            </section>
            <footer class="modal-card-foot is-justify-content-flex-end">
                <button
                    class="button pl-6 pr-6"
                    @click="discardLastCompilation()"
                >
                    Discard
                </button>

                <button
                    class="button is-success pl-6 pr-6"
                    @click="retrieveLastCompilation()"
                >
                    Retrieve
                </button>
            </footer>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ActionTypes } from '@/store/action-types';
import { settingsMixin } from '@/mixins/settingsMixin';
import CompilationParser from '@/store/compilation-parser';
import { MutationTypes } from '@/store/mutation-types';

/** A Loader for compilations, from either the URL or the local persistent storage
 * @remarks Provides a dialog for loading the last compilation, if available
 * @remarks The order is as follows:
 * 1) if given, load items from the URL parameters (discards any previously persisted compilation)
 * 2) if available, and set to auto-retrieva, automatically retrieve an existing persisted compilation
 * 3) if available, but not set to auto-retrieve, offer it via UI
 */
export default defineComponent({
    name: 'CompilationLoader',
    components: {},
    mixins: [settingsMixin],
    data() {
        return {
            showDialog: false,
        };
    },
    mounted: function (): void {
        //Check whether a given compilation is to be loaded (by Track API or by Auto-Retrieve, if enabled)
        console.debug('CompilationLoader::mounted:route', this.$route);
        const query = this.$route?.query;

        //Handle a Track API Request (mandatory media is available)
        if (query && query['media']) {
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
            } else {
                this.$store.commit(
                    MutationTypes.PUSH_ERROR_MESSAGE,
                    'No valid track media URL found, no track is loaded',
                );
            }
        }
        //Handle a Package API Request (mandatory package is available)
        else if (query && query['package']) {
            console.debug(
                'CompilationLoader::mounted:handeling Track API request for package:',
                query['package'],
            );

            this.$store.dispatch(ActionTypes.LOAD_FROM_URL, query['package']);
            //get rid of the query, since it has been applied now
            this.$router.replace({ query: undefined });
        }
        //Handle auto-retrieval
        else if (this.getSettings.autoRetrieveLastCompilation) {
            console.debug(
                'CompilationLoader::mounted:auto-retriving available compilation',
            );
            this.$store.dispatch(ActionTypes.RETRIEVE_COMPILATION);
        }
        //Query the user about manual retrieval
        else if (this.hasRetrievableCompilation && !this.hasCompilation) {
            console.debug('CompilationLoader::mounted:user-choice');
            this.showDialog = true;
        }
    },

    methods: {
        discardLastCompilation(): void {
            this.$store.dispatch(ActionTypes.DISCARD_COMPILATION).then(() => {
                this.showDialog = false;
            });
        },
        retrieveLastCompilation(): void {
            this.$store.dispatch(ActionTypes.RETRIEVE_COMPILATION).then(() => {
                this.showDialog = false;
            });
        },
    },
    computed: {
        hasRetrievableCompilation(): boolean {
            return this.$store.getters.hasRetrievableCompilation;
        },
        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },
    },
});
</script>
<style scoped></style>
