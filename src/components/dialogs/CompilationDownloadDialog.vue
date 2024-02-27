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

                    <i
                        v-show="!compilationTitle"
                        class="icon is-small is-right mdi has-text-danger"
                    >
                        <svg viewBox="0 0 24 24">
                            <path
                                fill="currentColor"
                                :d="mdiFlashTriangleOutline"
                            />
                        </svg>
                    </i>
                </div>
                <p v-if="!compilationTitle" class="help is-danger">
                    The compilation title is required
                </p>
                <p v-else class="help">
                    The compilation title, plus artist and album if given, are
                    used as file name
                </p>
            </div>
            <div class="field is-horizontal">
                <LabeledInput label="by">
                    <StyledInput
                        class="input is-italic"
                        :model-value="compilation.Artist"
                        type="text"
                        placeholder="Artist"
                        title="Artist"
                        data-cy="track-artist"
                        @update:model-value="
                            (value) => {
                                updateArtist(value);
                            }
                        "
                    >
                    </StyledInput>
                </LabeledInput>
                <LabeledInput label="on">
                    <StyledInput
                        class="input is-italic"
                        :model-value="compilation.Album"
                        type="text"
                        placeholder="Album"
                        title="Album"
                        data-cy="track-album"
                        @update:model-value="
                            (value) => {
                                updateAlbum(value);
                            }
                        "
                    >
                    </StyledInput>
                </LabeledInput>
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
import { mapActions } from 'pinia';
import { useAppStore } from '@/store/app';
import ModalDialog from '@/components/dialogs/ModalDialog.vue';
import CoveredPanel from '@/components/CoveredPanel.vue';
import LabeledInput from '@/components/editor/LabeledInput.vue';
import StyledInput from '@/components/StyledInput.vue';
import type { ICompilation } from '@/store/ICompilation';
import { mdiFlashTriangleOutline } from '@mdi/js';

export default defineComponent({
    name: 'CompilationDownloadDialog',
    components: {
        ModalDialog,
        CoveredPanel,
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
    data() {
        return {
            mdiFlashTriangleOutline: mdiFlashTriangleOutline,
        };
    },

    computed: {
        compilationTitle(): string {
            return this.compilation?.Title ?? '';
        },

        proposedFileName(): string {
            return CompilationHandler.getCompilationFileName(this.compilation);
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

        /** Updates the track artist */
        updateArtist(artist: string) {
            const title = this.compilation.Title;
            const album = this.compilation.Album;
            this.updateCompilationData(title, artist, album);
        },
        /** Updates the track album */
        updateAlbum(album: string) {
            const title = this.compilation.Title;
            const artist = this.compilation.Artist;
            this.updateCompilationData(title, artist, album);
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
