<template>
    <ModalDialog submit-button-text="Inherit">
        <template #title
            >Inheriting cues to '{{ track?.Name }}' from ...</template
        >
        <template #body>
            <div class="field">
                <div class="control">
                    <label class="label">Track to inherit from </label>
                    <div class="control">
                        <div class="select">
                            <select v-model="selectedTrackId">
                                <option
                                    v-for="sourceTrack in sourceTracks"
                                    :key="sourceTrack.Id"
                                    :value="sourceTrack.Id"
                                    :disabled="sourceTrack.Id == track.Id"
                                >
                                    {{ sourceTrack.Name }} &mdash; (
                                    {{ sourceTrack.Url }})
                                </option>
                            </select>
                        </div>
                    </div>
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="replaceCues"
                        label="Replace existing cues"
                        hint="Removes existing cues before inheriting the new ones"
                    ></LabeledCheckbox>
                </div>
            </div>

            <div class="field">
                <div class="control">
                    <LabeledCheckbox
                        v-model="inheritTrackPreroll"
                        label="Inherit track preroll"
                    ></LabeledCheckbox>
                </div>
            </div>

            <div
                v-if="experimentalUseMeter"
                v-experiment="experimentalUseMeter"
                class="field"
            >
                <div class="control">
                    <LabeledCheckbox
                        v-model="inheritMeterBpm"
                        label="Inherit the meter and BPM"
                    ></LabeledCheckbox>
                </div>
            </div>
        </template>
    </ModalDialog>
</template>

<script setup lang="ts">
import { type PropType, ref } from 'vue';

import LabeledCheckbox from '@/components/editor/LabeledCheckbox.vue';
import ModalDialog from '@/components/dialogs/ModalDialog.vue';
import type { ITrack } from '@/store/ITrack';
import CompilationHandler from '@/store/compilation-handler';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';
const props = defineProps({
    /** The target track to add cues to */
    track: {
        type: Object as PropType<ITrack>,
        required: true,
    },

    /** The track to choose from */
    sourceTracks: {
        type: Object as PropType<ITrack[]>,
        required: true,
    },
});

const replaceCues = ref(true);
const inheritTrackPreroll = ref(true);
const inheritMeterBpm = ref(true);
const selectedTrackId = ref(CompilationHandler.EmptyId);

/** NOTE: Returning the returnValue function is required by vue3-promise-dialog */
defineExpose({
    returnValue: (): {
        source: ITrack | null;
        replaceCues: boolean;
        inheritMeterBpm: boolean;
        inheritTrackPreroll: boolean;
    } => {
        const selectedTrack = props.sourceTracks.find(
            (t) => t.Id == selectedTrackId.value,
        );
        return {
            source: selectedTrack ?? null,
            replaceCues: replaceCues.value,
            inheritMeterBpm: inheritMeterBpm.value,
            inheritTrackPreroll: inheritTrackPreroll.value,
        };
    },
});

const settings = useSettingsStore();
const { experimentalUseMeter } = storeToRefs(settings);
</script>
