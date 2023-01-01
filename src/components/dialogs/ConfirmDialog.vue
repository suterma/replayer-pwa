<template>
    <UseFocusTrap>
        <div class="modal is-active">
            <div class="modal-background"></div>

            <div class="modal-card">
                <form>
                    <header class="modal-card-head">
                        <h1 class="modal-card-title title">{{ header }}</h1>
                    </header>
                    <section class="modal-card-body">
                        {{ question }}
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
                                        @click="$close(this, false)"
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
                                        type="submit"
                                        v-focus
                                        class="button is-success"
                                        :ref="clickRef"
                                        @click="$close(this)"
                                    >
                                        Ok
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
import { useStore } from 'vuex';
import { MutationTypes } from '@/store/mutation-types';

export default defineComponent({
    name: 'ConfirmDialog',
    components: { UseFocusTrap, Hotkey },
    props: {
        question: String,
        header: String,
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
        return {
            returnValue,
        };
    },
});
</script>
