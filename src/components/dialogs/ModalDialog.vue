<template>
    <UseFocusTrap>
        <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-card" :class="{ 'is-wide': wide }">
                <form
                    data-cy="modal-form"
                    @submit.prevent="
                        $emit('submit');
                        closeDialog(true);
                    "
                >
                    <header class="modal-card-head has-cropped-text">
                        <h1 class="modal-card-title title">
                            <slot name="title"></slot>
                        </h1>
                    </header>
                    <section class="modal-card-body">
                        <slot name="body"></slot>
                    </section>
                    <footer class="modal-card-foot is-justify-content-flex-end">
                        <div class="field is-grouped">
                            <p v-if="!required" class="control">
                                <Hotkey
                                    v-slot="{ clickRef }"
                                    :keys="['esc']"
                                    :excluded-elements="[]"
                                >
                                    <button
                                        :ref="clickRef"
                                        class="button"
                                        data-cy="cancel-button"
                                        @click.prevent="closeDialog(false)"
                                    >
                                        {{ cancelButtonText }}
                                    </button>
                                </Hotkey>
                            </p>
                            <p v-if="!informational" class="control">
                                <Hotkey
                                    v-slot="{ clickRef }"
                                    :keys="['enter']"
                                    :excluded-elements="['textarea']"
                                >
                                    <button
                                        :ref="clickRef"
                                        v-focus
                                        type="submit"
                                        class="button is-success"
                                        data-cy="submit-button"
                                        :disabled="submitButtonDisabled"
                                    >
                                        {{ submitButtonText }}
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
import { defineComponent, onMounted, onUnmounted } from 'vue';
import { UseFocusTrap } from '@vueuse/integrations/useFocusTrap/component';
import { Hotkey } from '@simolation/vue-hotkey';
import { useAppStore } from '@/store/app';
//@ts-ignore (because the vue3-promise-dialog does not provide types)
import { closeDialog } from 'vue3-promise-dialog';

export default defineComponent({
    name: 'ModalDialog',
    components: {
        UseFocusTrap,
        Hotkey,
    },
    props: {
        submitButtonText: {
            type: String,
            reqired: false,
            default: 'OK',
        },
        submitButtonDisabled: Boolean,

        wide: Boolean,

        cancelButtonText: {
            type: String,
            reqired: false,
            default: 'Cancel',
        },

        /** The affirmative action is required, no cancel button is made available
         * @remarks Can not be used in combination with "informational"
         */
        required: Boolean,

        /** The affirmative action is not available, only the cancel (as dismiss) button is made available
         * @remarks Can not be used in combination with "required"
         */
        informational: Boolean,
    },
    emits: ['submit'],

    setup() {
        /** Temporarily pause the use of the global app shortcuts in favor of typical
         * key event handling within this dialog. */
        const app = useAppStore();
        onMounted(() => {
            app.useAppShortcuts = false;
        });
        onUnmounted(() => {
            app.useAppShortcuts = true;
        });

        return { closeDialog };
    },
});
</script>
