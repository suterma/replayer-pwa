<template>
    <ModalDialog submit-button-text="Add" wide>
        <template #title>Adding cues for '{{ track?.Name }}' ...</template>
        <template #body>
            <div class="field">
                <div class="control">
                    <textarea
                        v-model="cueText"
                        v-focus
                        class="textarea is-size-7"
                        placeholder="Description,Time[seconds],Shortcut"
                        rows="8"
                        autocomplete="off"
                    ></textarea>
                </div>
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
import { type PropType, defineComponent, ref } from 'vue';

import { v4 as uuidv4 } from 'uuid';
import ModalDialog from '@/components/dialogs/ModalDialog.vue';
import type { ITrack } from '@/store/ITrack';
import type { ICue } from '@/store/ICue';
import { Cue } from '@/store/Cue';
import useLog from '@/composables/LogComposable';
const { log } = useLog();

export default defineComponent({
    name: 'AddTextCuesDialog',
    components: {
        ModalDialog,
    },
    props: {
        /** The target track to add cues to */
        track: {
            type: Object as PropType<ITrack>,
            required: true,
        },
    },

    setup() {
        const cueText = ref('');

        /** NOTE: Returning the returnValue function is required by vue3-promise-dialog */
        const returnValue = (): ICue[] => {
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
                        null,
                        shortcut ?? null,
                        cueTime,
                        null,
                        false,
                        false,
                        uuidv4(),
                    ),
                );
            });
            log.debug(cueText.value);
            log.debug('cues', cues);

            return cues;
        };

        return {
            returnValue,
            cueText,
        };
    },
});
</script>
