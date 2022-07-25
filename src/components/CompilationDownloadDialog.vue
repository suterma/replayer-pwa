<template>
    <div class="modal is-active">
        <div class="modal-background"></div>

        <div class="modal-card">
            <header class="modal-card-head">
                <h1 class="modal-card-title title is-flex-shrink-1">
                    Download compilation '{{ compilation?.Title }}' as...
                </h1>
            </header>
            <section class="modal-card-body">
                <form>
                    <div class="field">
                        <div class="control">
                            <label class="radio">
                                <input
                                    type="radio"
                                    name="downloadType"
                                    class="mr-1"
                                    v-model="isDownloadZip"
                                    v-bind:value="true"
                                    checked
                                />
                                <span class="has-text-weight-bold">ZIP</span>
                                <span class="has-opacity-half is-size-7">
                                    (<span class="is-family-monospace"
                                        >.rez</span
                                    >), including provided media files
                                </span>
                            </label>
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <label class="radio">
                                <input
                                    type="radio"
                                    name="downloadType"
                                    class="mr-1"
                                    v-model="isDownloadZip"
                                    v-bind:value="false"
                                />
                                <span class="has-text-weight-bold">XML</span>
                                <span class="has-opacity-half is-size-7">
                                    (<span class="is-family-monospace"
                                        >.rex</span
                                    >), using media file names / URLs only
                                </span>
                            </label>
                        </div>
                    </div>
                </form>
            </section>
            <footer class="modal-card-foot is-justify-content-flex-end">
                <div class="field is-grouped">
                    <p class="control">
                        <button class="button" @click="$close(this, false)">
                            Cancel
                        </button>
                    </p>
                    <p class="control">
                        <button
                            v-focus
                            class="button is-success"
                            @click="
                                download().then(() => {
                                    $close(this);
                                })
                            "
                        >
                            Download
                        </button>
                    </p>
                </div>
            </footer>
        </div>
    </div>
</template>

<script lang="ts">
import { ActionTypes } from '@/store/action-types';
import { Compilation } from '@/store/compilation-types';
import { defineComponent, ref } from 'vue';

export default defineComponent({
    name: 'CompilationDownloadDialog',
    components: {},
    props: {
        compilation: Compilation,
    },
    setup() {
        function returnValue() {
            return true;
        }
        const isDownloadZip = ref(true);
        return {
            returnValue,
            isDownloadZip,
        };
    },

    methods: {
        /** Initiates the download of the current compilation with the chosen target type
         */
        async download(): Promise<void> {
            if (this.isDownloadZip) {
                return this.downloadRezPackage();
            } else {
                return this.downloadRexFile();
            }
        },
        /** Initiates the download of the current compilation as a single XML (.rex) file
         */
        async downloadRexFile(): Promise<void> {
            this.$store.dispatch(ActionTypes.DOWNLOAD_REX_FILE);
        },

        /** Initiates the download of the current compilation as a ZIP (.rez) package
         */
        async downloadRezPackage(): Promise<void> {
            this.$store.dispatch(ActionTypes.DOWNLOAD_REZ_PACKAGE);
        },
    },

    computed: {},
});
</script>
