<template>
    <ModalDialog
        submit-button-text="Download"
        :submit-button-disabled="!compilationTitle"
        @submit="download()"
    >
        <template #title>Download compilation as...</template>
        <template #body>
            <div class="field">
                <label class="label">Compilation title*</label>
                <div class="control has-icons-right">
                    <input
                        v-focus
                        class="input"
                        :class="{ 'is-danger': !compilationTitle }"
                        type="text"
                        placeholder="Compilation title"
                        :value="compilationTitle"
                        @change="
                            updateCompilationTitle(
                                ($event.target as HTMLInputElement).value,
                            )
                        "
                        @input="
                            updateCompilationTitle(
                                ($event.target as HTMLInputElement).value,
                            )
                        "
                    />
                    <span
                        v-show="!compilationTitle"
                        class="icon is-small is-right"
                    >
                        <i class="fas fa-exclamation-triangle"></i>
                    </span>
                </div>
                <p v-if="!compilationTitle" class="help is-danger">
                    The compilation title is required
                </p>
                <p v-else class="help">
                    The compilation title is used as file name
                </p>
            </div>
            <div class="field">
                <div class="control">
                    <label class="radio">
                        <input
                            v-model="isDownloadZip"
                            type="radio"
                            name="downloadType"
                            class="mr-1"
                            :value="true"
                            checked
                            data-cy="radio-download-zip"
                        />
                        <span class="has-text-weight-bold">ZIP</span>
                        <span class="has-opacity-half is-size-7">
                            (<span class="is-family-monospace"
                                >{{ proposedFileName }}.zip</span
                            >), including provided media files
                        </span>
                    </label>
                </div>
            </div>
            <div class="field">
                <div class="control">
                    <label class="radio">
                        <input
                            v-model="isDownloadZip"
                            type="radio"
                            name="downloadType"
                            class="mr-1"
                            :value="false"
                            data-cy="radio-download-xml"
                        />
                        <span class="has-text-weight-bold">XML</span>
                        <span class="has-opacity-half is-size-7">
                            (<span class="is-family-monospace"
                                >{{ proposedFileName }}.xml</span
                            >), using media file names / URL's only
                        </span>
                    </label>
                </div>
            </div>
        </template>
    </ModalDialog>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from 'vue';
import CompilationHandler from '@/store/compilation-handler';
import { mapActions } from 'pinia';
import { useAppStore } from '@/store/app';
import ModalDialog from '@/components/dialogs/ModalDialog.vue';
import type { ICompilation } from '@/store/ICompilation';

export default defineComponent({
    name: 'CompilationDownloadDialog',
    components: {
        ModalDialog,
    },
    props: {
        compilation: {
            type: Object as PropType<ICompilation>,
            required: true,
        },
    },
    setup() {
        /** NOTE: Returning the returnValue function is required by vue3-promise-dialog */
        function returnValue() {
            return true;
        }
        const isDownloadZip = ref(true);
        return {
            returnValue,
            isDownloadZip,
        };
    },

    computed: {
        compilationTitle(): string {
            return this.compilation?.Title ?? '';
        },

        proposedFileName(): string {
            return CompilationHandler.getCompilationFileName(
                this.compilation?.Title,
            );
        },
    },

    methods: {
        ...mapActions(useAppStore, [
            'updateCompilationData',
            'downloadZipPackage',
            'downloadXmlFile',
        ]),

        /** Updates the compilation title */
        updateCompilationTitle(title: string) {
            if (this.compilation) {
                const artist = this.compilation?.Artist;
                const album = this.compilation?.Album;
                this.updateCompilationData(title, artist, album);
            }
        },

        /** Initiates the download of the current compilation with the chosen target type
         */
        async download(): Promise<void> {
            if (this.isDownloadZip) {
                return this.downloadZipPackage();
            } else {
                return this.downloadXmlFile();
            }
        },
    },
});
</script>
