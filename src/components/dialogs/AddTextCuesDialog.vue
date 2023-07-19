<template>
    <ModalDialog submitButtonText="Add" wide>
        <template #title>Adding cues for '{{ track?.Name }}' from...</template>
        <template #body>
            <div class="control">
                <textarea
                    class="textarea is-size-7"
                    placeholder="Description,Time[seconds],Shortcut"
                    v-model="cueText"
                    rows="8"
                    autocomplete="off"
                    v-focus
                ></textarea>
            </div>

            <div class="section pl-0 pr-0 block">
                <div class="content box">
                    <p>Provide one cue per line with:</p>
                    <div class="content">
                        <ul>
                            <li>description</li>
                            <li>time position (optionally)</li>
                            <li>shortcut (optionally)</li>
                        </ul>
                    </div>
                    <p>
                        each separated by a comma (,) character. Cues without
                        time position will have a 10 seconds gap.
                    </p>
                </div>
            </div>
        </template>
    </ModalDialog>
</template>

<script lang="ts">
import { Cue, ICue, Track } from '@/store/compilation-types';
import { PropType, defineComponent, ref } from 'vue';

import { v4 as uuidv4 } from 'uuid';
import ModalDialog from '@/components/dialogs/ModalDialog.vue';

export default defineComponent({
    name: 'AddTextCuesDialog',
    components: {
        ModalDialog,
    },
    props: {
        track: {
            type: Object as PropType<Track>,
        },
    },

    setup() {
        const cueText = ref('');

        /** NOTE: Returning the returnValue function is required by vue3-promise-dialog */
        function returnValue(): ICue[] {
            const cues = new Array<ICue>();
            const lines = cueText.value.split('\n');
            let cueTime = 0;
            lines.forEach((line) => {
                const parts = line.split(',');
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
