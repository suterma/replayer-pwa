<template>
    <!-- Main container -->
    <nav class="level">
        <!-- Left side -->
        <div class="level-left">
            <div class="level-item">
                <div class="file is-primary">
                    <label class="file-label">
                        <input
                            class="file-input"
                            type="file"
                            id="file-input"
                            accept=".rex,.xml,.rez,.zip,.mp3,.bplist"
                            multiple
                            @change="loadFiles"
                            name="resume"
                        />
                        <span class="file-cta">
                            <!-- //TODO use an SVG upload icon -->
                            <!-- <span class="file-icon">
                        <i class="fas fa-upload"></i>
                    </span> -->
                            <span class="file-label">
                                Choose a compilation or media file…
                            </span>
                        </span>
                        <!-- <span class="file-name">
                    {{selectedFile}}}
                </span> -->
                    </label>
                </div>
            </div>
            <!-- //TODO later implement loading from URL too. Or, maybe, only via query API? -->
            <!-- <div class="level-item">&mdash; OR &mdash;</div>
            <div class="level-item">
                //TODO load from URL
            </div> -->
            <div class="level-item">&mdash; OR &mdash;</div>
            <div class="level-item">
                <button class="button" @click="retrieveLastCompilation()">
                    Retrieve last compilation
                </button>
            </div>
            <div class="level-item">&mdash; OR &mdash;</div>
            <div class="level-item">
                <button
                    class="button"
                    @click="
                        loadUrl('demo-compilation-featuring-lidija-roos.rez')
                    "
                >
                    Try the demo
                </button>
            </div>
        </div>

        <!-- Right side -->
        <div class="level-right">
            <p class="level-item"></p>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ActionTypes } from '@/store/action-types';

/** A Loader for importable files
 * @remarks Provides a button for loading local files and also listens to url params
 */
export default defineComponent({
    name: 'RezLoader',
    components: {},
    mounted: function (): void {
        //Check whether a given file is to be loaded
        //TODO maybe later put all this params handling in one place; However, yet to decide where is the best place.
        if (this.paramsUrl) {
            if (typeof this.paramsUrl === 'string') {
                //Handle the single item
                this.loadUrl(this.paramsUrl);
            } else {
                //Handle the array
                this.paramsUrl.forEach((url) => this.loadUrl(url));
            }
        }
    },
    methods: {
        /** Handles the request to load a file from an online resource, using a URL
         * @remarks This method can be called multiple times, each resource gets appropriately added to the current compilation
         * @param url - The URL to load the file from
         */
        loadUrl(url: string): void {
            //TODO TEST does this work?
            this.$store.dispatch(ActionTypes.LOAD_FROM_URL, url);
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

        /** Loads a single file (from a selection of one or more files) by loading their content
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
    },
});
</script>
