<template>
    <UseFocusTrap>
        <div class="modal is-active">
            <div class="modal-background"></div>
            <div class="modal-card" :class="{ 'is-wide': wide }">
                <form data-cy="modal-form" @submit.prevent="$close(this)">
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
                                    :keys="['esc']"
                                    :excluded-elements="[]"
                                    v-slot="{ clickRef }"
                                >
                                    <button
                                        class="button"
                                        data-cy="modal-cancel-button"
                                        :ref="clickRef"
                                        @click.prevent="$close(this, false)"
                                    >
                                        {{ cancelButtonText }}
                                    </button>
                                </Hotkey>
                            </p>
                            <p class="control">
                                <Hotkey
                                    :keys="['enter']"
                                    :excluded-elements="['textarea']"
                                    v-slot="{ clickRef }"
                                >
                                    <button
                                        type="submit"
                                        class="button is-success"
                                        data-cy="modal-submit-button"
                                        :ref="clickRef"
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

        /** The affirmative action is required, no cancel is made button available */
        required: Boolean,
    },

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

        return {};
    },
});
</script>
