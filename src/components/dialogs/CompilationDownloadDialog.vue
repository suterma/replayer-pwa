<template>
    <ModalDialog
        submitButtonText="Download"
        :submitButtonDisabled="!compilationTitle"
        @submit="download()"
    >
        <template #title>Download compilation as...</template>
        <template #body>
            <div class="field">
                <label class="label">Compilation title*</label>
                <div class="control has-icons-right">
                    <input
                        class="input"
                        :class="{ 'is-danger': !compilationTitle }"
                        type="text"
                        v-focus
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
                        class="icon is-small is-right"
                        v-show="!compilationTitle"
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
                            type="radio"
                            name="downloadType"
                            class="mr-1"
                            v-model="isDownloadZip"
                            v-bind:value="true"
                            checked
                            data-cy="radio-download-zip"
                        />
                        <span class="has-text-weight-bold">ZIP</span>
                        <span class="has-opacity-half is-size-7">
                            (<span class="is-family-monospace"
                                >{{ proposedFileName }}.rez</span
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
                            data-cy="radio-download-xml"
                        />
                        <span class="has-text-weight-bold">XML</span>
                        <span class="has-opacity-half is-size-7">
                            (<span class="is-family-monospace"
                                >{{ proposedFileName }}.rex</span
                            >), using media file names / URLs only
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

    methods: {
        ...mapActions(useAppStore, [
            'updateCompilationData',
            'downloadRezPackage',
            'downloadRexFile',
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
                return this.downloadRezPackage();
            } else {
                return this.downloadRexFile();
            }
        },
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
});
</script>
import { Compilation } from '@/store/Compilation';
