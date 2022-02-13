<template>
    <!-- Main container (This level is not a nav, since the containted buttons dispatch actions, not navigations) -->
    <div
        v-if="
            !this.getSettings.autoRetrieveLastCompilation &&
            hasRetrievableCompilation &&
            !hasCompilation
        "
        class="level"
    >
        <!-- Left side -->
        <div class="level-left">
            <div class="level-item">
                <button
                    tabindex="0"
                    class="button"
                    @click="retrieveLastCompilation()"
                >
                    Retrieve last compilation
                </button>
            </div>
            <div class="level-item">&mdash; OR &mdash;</div>
        </div>

        <!-- Right side -->
        <div class="level-right">
            <p class="level-item"></p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ActionTypes } from '@/store/action-types';
import { settingsMixin } from '@/mixins/settingsMixin';

/** A Loader for compilations, from either the URL or the local storage files
 * @remarks Provides a button for loading the last compilation, if available
 * @remarks loads a compilation from either local files and also listens to url params
 */
export default defineComponent({
    name: 'CompilationLoader',
    components: {},
    mixins: [settingsMixin],
    mounted: function (): void {
        //Check whether a given compilation is to be loaded (by URL or by Auto-Retrieve, if enabled)
        if (this.paramsUrl) {
            if (typeof this.paramsUrl === 'string') {
                //Handle the single item
                this.loadUrl(this.paramsUrl);
            } else {
                //Handle the array
                this.paramsUrl.forEach((url) => this.loadUrl(url));
            }
        } else if (this.getSettings.autoRetrieveLastCompilation) {
            this.$store.dispatch(ActionTypes.RETRIEVE_COMPILATION);
        }
    },
    methods: {
        /** Handles the request to load a file from an online resource, using a URL
         * @remarks This method can be called multiple times, each resource gets appropriately added to the current compilation
         * @param url - The URL to load the file from
         */
        loadUrl(url: string): void {
            this.$store.dispatch(ActionTypes.LOAD_FROM_URL, url);
        },

        retrieveLastCompilation(): void {
            this.$store.dispatch(ActionTypes.RETRIEVE_COMPILATION);
        },
    },
    computed: {
        /** Provide the URL parameter from the route, if available */
        paramsUrl(): string | string[] {
            return this.$route?.params.url;
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
