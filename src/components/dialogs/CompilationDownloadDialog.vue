<template>
    <ModalDialog
        submit-button-text="Download"
        :submit-button-disabled="!proposedFileName"
        @submit="download()"
    >
        <template #title>Download compilation as...</template>
        <template #body>
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
                            including locally provided media files
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
                            using media file names / URL's only
                        </span>
                    </label>
                </div>
            </div>

            <!-- Informationally, provide the filename, with word wrap to make sure it's displayed fully -->
            <div class="field">
                <span class="label is-pulled-left is-sr-only">File name</span>
                <span class="ml-3 xis-pulled-right">
                    <span
                        class="is-family-monospace"
                        style="white-space: normal"
                    >
                        {{ proposedFileName }}
                    </span>
                    <span v-if="isDownloadZip" class="is-family-monospace"
                        >.zip</span
                    >
                    <span v-else class="is-family-monospace">.xml</span>
                </span>
            </div>
        </template>
    </ModalDialog>
</template>

<script lang="ts">
import { defineComponent, ref, type PropType } from 'vue';
import CompilationHandler from '@/store/compilation-handler';
import { useAppStore } from '@/store/app';
import ModalDialog from '@/components/dialogs/ModalDialog.vue';
import LabeledInput from '@/components/editor/LabeledInput.vue';
import StyledInput from '@/components/StyledInput.vue';
import type { ICompilation } from '@/store/ICompilation';

export default defineComponent({
    name: 'CompilationDownloadDialog',
    components: {
        ModalDialog,
        LabeledInput,
        StyledInput,
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
        proposedFileName(): string {
            return CompilationHandler.getCompilationFileName(this.compilation);
        },
    },

    methods: {
        /** Initiates the download of the current compilation with the chosen target type
         */
        download(): void {
            if (this.isDownloadZip) {
                useAppStore().downloadZipPackage(this.proposedFileName);
            } else {
                useAppStore().downloadXmlFile(this.proposedFileName);
            }
        },
    },
});
</script>
