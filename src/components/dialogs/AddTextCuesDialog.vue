<template>
    <UseFocusTrap>
        <div class="modal is-active">
            <div class="modal-background"></div>
            <Experimental>
                <!-- //TODO later use a css style for the with -->
                <div class="modal-card" style="width: 100%">
                    <form>
                        <header class="modal-card-head">
                            <h1 class="modal-card-title title">
                                Adding cues for '{{ track?.Name }}' from...
                            </h1>
                        </header>
                        <section class="modal-card-body">
                            <div class="control">
                                <!-- //TODO autofocus seems not to work -->
                                <textarea
                                    class="textarea is-size-7"
                                    placeholder="Description;Time[seconds];Shortcut"
                                    v-model="cueText"
                                    rows="6"
                                    autocomplete="off"
                                    v-focus
                                ></textarea>
                            </div>

                            <div class="content">
                                Provide one cue per line with a description, and
                                optionally, a time position and a shortcut, each
                                separated by a pipe (|) character.
                            </div>
                        </section>
                        <footer
                            class="modal-card-foot is-justify-content-flex-end"
                        >
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
                                        :excluded-elements="['textarea']"
                                        v-slot="{ clickRef }"
                                    >
                                        <button
                                            v-focus
                                            class="button is-success"
                                            :ref="clickRef"
                                            @click="$close(this)"
                                        >
                                            Add
                                        </button>
                                    </Hotkey>
                                </p>
                            </div>
                        </footer>
                    </form>
                </div>
            </Experimental>
        </div>
    </UseFocusTrap>
</template>

<script lang="ts">
import { Cue, ICue, Track } from '@/store/compilation-types';
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import { UseFocusTrap } from '@vueuse/integrations/useFocusTrap/component';
import { Hotkey } from '@simolation/vue-hotkey';
import { useStore } from 'vuex';
import { MutationTypes } from '@/store/mutation-types';
import { v4 as uuidv4 } from 'uuid';

export default defineComponent({
    name: 'AddTextCuesDialog',
    components: {
        UseFocusTrap,
        Hotkey,
    },
    props: {
        track: Track,
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

        const cueText = ref('');

        /** NOTE: Returning the returnValue function is required by vue3-promise-dialog */
        function returnValue(): ICue[] {
            const cues = new Array<ICue>();
            const lines = cueText.value.split('\n');
            let cueTime = 0;
            lines.forEach((line) => {
                const parts = line.split('|');
                const description = parts[0];
                const time = parts[1];
                const shortcut = parts[2];
                let parsedTime = parseFloat(time ?? '') || null;
                if (Number.isFinite(parsedTime) && parsedTime != null) {
                    cueTime = parsedTime;
                } else {
                    cueTime = cueTime + 10 /* default spacing */;
                }
                cues.push(
                    new Cue(
                        description ?? '',
                        shortcut ?? null,
                        cueTime,
                        null,
                        uuidv4(),
                    ),
                );
            });
            console.debug(cueText.value);
            console.debug('cues', cues);

            return cues;
        }

        return {
            returnValue,
            cueText,
        };
    },
});
</script>