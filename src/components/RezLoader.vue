<template>
    <!-- Main container (This level is not a nav, since the containted buttons dispatch actions, not navigations) -->
    <div class="level">
        <!-- Left side -->
        <div class="level-left">
            <div class="level-item">
                <input
                    tabindex="10"
                    class="button is-primary"
                    type="button"
                    onclick="document.getElementById('rezfileinput').click()"
                    value="Choose a compilation or media file…"
                />
                <input
                    tabindex="-1"
                    class="is-hidden"
                    type="file"
                    id="rezfileinput"
                    accept=".rex,.xml,.rez,.zip,.mp3,.bplist"
                    multiple
                    @change="loadFiles"
                    name="resume"
                />
            </div>

            <template v-if="hasRetrievableCompilation">
                <div class="level-item">&mdash; OR &mdash;</div>
                <div class="level-item">
                    <button
                        tabindex="20"
                        class="button"
                        @click="retrieveLastCompilation()"
                    >
                        Retrieve last compilation
                    </button>
                </div>
            </template>
            <div class="level-item">&mdash; OR &mdash;</div>
            <div class="level-item">
                <button tabindex="30" class="button" @click="loadDemo()">
                    Try the demo
                </button>
            </div>
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

/** A Loader for importable files
 * @remarks Provides a button for loading local files and also listens to url params
 */
export default defineComponent({
    name: 'RezLoader',
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
        /** Loads the demo compilation
         */
        loadDemo() {
            this.loadUrl(
                location.protocol +
                    '//' +
                    location.host +
                    location.pathname +
                    'demo-compilation-featuring-lidija-roos.rez',
            );
        },
        retrieveLastCompilation(): void {
            this.$store.dispatch(ActionTypes.RETRIEVE_COMPILATION);
        },

        /** Handles the selection of one or more files by loading their content
         */
        async loadFiles(event: Event): Promise<void> {
            Array.from(
                (event.target as HTMLInputElement).files as unknown as File[],
            ).forEach((file) => {
                this.loadFile(file);
            });
        },

        /** Loads a single file by loading it's content
         */
        async loadFile(file: File): Promise<void> {
            this.$store.dispatch(ActionTypes.LOAD_FROM_FILE, file);
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
    },
});
</script>
<style scoped>
.button.is-primary:focus,
.button.is-primary.is-focused {
    border-color: #ededed;
    color: #ededed;
}

.button.is-primary:focus:not(:active),
.button.is-primary.is-focused:not(:active) {
    box-shadow: 0 0 0 0.125em rgb(250 250 250 / 25%);
}
</style>
