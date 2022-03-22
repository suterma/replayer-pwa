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
        //Check whether a given compilation is to be loaded (by URL or by Auto-Retrieve, if enabled)

        //TODO experimental load from API
        console.debug('CompilationLoader::route', this.$route);
        console.debug('CompilationLoader::fullPath', this.$route?.fullPath);
        console.debug('CompilationLoader::query', this.$route?.query);

        console.debug('paramsUrl:' + this.paramsUrl);

        if (this.paramsUrl) {
            if (typeof this.paramsUrl === 'string') {
                //Handle the single item
                this.loadUrl(decodeURIComponent(this.paramsUrl));
            } else {
                //Handle the array
                this.paramsUrl.forEach((url) =>
                    this.loadUrl(decodeURIComponent(url)),
                );
            }
        } else if (this.getSettings.autoRetrieveLastCompilation) {
            this.$store.dispatch(ActionTypes.RETRIEVE_COMPILATION);
        } else if (this.hasRetrievableCompilation && !this.hasCompilation) {
            this.showDialog = true;
        }
    },

    methods: {
        /** Handles the request to load a file from an online resource, using a URL
         * @remarks This method can be called multiple times, each resource gets appropriately added to the current compilation
         * @param url - The URL to load the file from
         */
        loadUrl(url: string): void {
            console.debug('CompilationLoader::loadUrl:', url);

            this.$store.dispatch(ActionTypes.LOAD_FROM_URL, url);
        },

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
        /** Provide the URL parameter from the route, if available */
        paramsUrl(): string | string[] {
            console.debug('CompilationLoader::paramsUrl', this.$route);
            return this.$route?.params.url;
            //TODO learn about routing first
        },

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
