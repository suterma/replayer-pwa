<template>
    <UseFocusTrap>
        <div class="modal is-active">
            <div class="modal-background"></div>

            <div class="modal-card">
                <form
                    data-cy="modal-form"
                    @submit.prevent="
                        download().then(() => {
                            $close(this);
                        })
                    "
                >
                    <header class="modal-card-head has-cropped-text">
                        <h1 class="modal-card-title title is-flex-shrink-1">
                            Download compilation as...
                        </h1>
                    </header>
                    <section class="modal-card-body">
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
                                            ($event.target as HTMLInputElement)
                                                .value,
                                        )
                                    "
                                    @input="
                                        updateCompilationTitle(
                                            ($event.target as HTMLInputElement)
                                                .value,
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
                                    <span class="has-text-weight-bold"
                                        >ZIP</span
                                    >
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
                                    <span class="has-text-weight-bold"
                                        >XML</span
                                    >
                                    <span class="has-opacity-half is-size-7">
                                        (<span class="is-family-monospace"
                                            >{{ proposedFileName }}.rex</span
                                        >), using media file names / URLs only
                                    </span>
                                </label>
                            </div>
                        </div>
                    </section>
                    <footer class="modal-card-foot is-justify-content-flex-end">
                        <div class="field is-grouped">
                            <p class="control">
                                <Hotkey
                                    :keys="['esc']"
                                    :excluded-elements="[]"
                                    v-slot="{ clickRef }"
                                >
                                    <button
                                        class="button"
                                        :ref="clickRef"
                                        @click.prevent="$close(this, false)"
                                        data-cy="button-cancel"
                                    >
                                        Cancel
                                    </button>
                                </Hotkey>
                            </p>
                            <p class="control">
                                <Hotkey
                                    :keys="['enter']"
                                    :excluded-elements="[]"
                                    v-slot="{ clickRef }"
                                >
                                    <button
                                        class="button is-success"
                                        type="submit"
                                        :ref="clickRef"
                                        :disabled="!compilationTitle"
                                        data-cy="button-download"
                                    >
                                        Download
                                    </button>
                                </Hotkey>
                            </p>
                        </div>
                    </footer>
                </form>
            </div>
        </div>
    </UseFocusTrap>
</template>

<script lang="ts">
import { ActionTypes } from '@/store/action-types';
import { Compilation } from '@/store/compilation-types';
import { defineComponent, ref } from 'vue';
import { UseFocusTrap } from '@vueuse/integrations/useFocusTrap/component';
import { Hotkey } from '@simolation/vue-hotkey';
import CompilationHandler from '@/store/compilation-handler';
import { onMounted, onUnmounted } from 'vue';
import { useStore } from 'vuex';
import { MutationTypes } from '@/store/mutation-types';

export default defineComponent({
    name: 'CompilationDownloadDialog',
    components: {
        UseFocusTrap,
        Hotkey,
    },
    props: {
        compilation: Compilation,
    },
    setup() {
        /** Temporarily pause the use of the global app shortcuts in favor of typical
         * key event handling within this dialog. */
        const store = useStore();
        onMounted(() => {
            store.commit(MutationTypes.USE_APP_SHORTCUTS, false);
        });
        onUnmounted(() => {
            store.commit(MutationTypes.USE_APP_SHORTCUTS, true);
        });

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
        /** Updates the compilation title */
        updateCompilationTitle(title: string) {
            this.$store.dispatch(ActionTypes.UPDATE_COMPILATION_TITLE, title);
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
