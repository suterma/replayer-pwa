<template>
    <div class="level">
        <div class="level-left">
            <!-- BPM -->
            <div class="level-item has-text-centered">
                <span class="has-opacity-half is-single-line">Tempo</span>
            </div>
            <div class="level-item is-flex-shrink-2">
                <div class="field">
                    <p class="control">
                        <BpmEditor
                            class="input"
                            :modelValue="props.beatsPerMinute"
                            @change="
                                emit(
                                    'update:beatsPerMinute',
                                    $event.target.value,
                                )
                            "
                            placeholder="BPM"
                            title="BPM (Beats per minute)"
                        >
                        </BpmEditor>
                    </p>
                </div>
            </div>

            <!-- Time Signature -->
            <div class="level-item has-text-centered">
                <span class="has-opacity-half">Time Signature</span>
            </div>
            <div class="level-item is-flex-shrink-2">
                <div class="field">
                    <p class="control">
                        <TimeSignatureEditor
                            class="input"
                            :numerator="props.numerator"
                            @update:numerator="(value:number|null) => emit('update:numerator', value)"
                            :denominator="props.denominator"
                            @update:denominator="(value:number|null) => {emit('update:denominator', value);}"
                            title="Time signature"
                        >
                        </TimeSignatureEditor>
                    </p>
                </div>
            </div>
            <!-- Metronome -->
            <div class="level-item is-flex-shrink-2">
                <div class="field">
                    <p class="control">
                        <a href="https://tic.replayer.app" target="_blank"
                            >TAP</a
                        >
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { PropType } from 'vue';
import BpmEditor from '@/components/editor/BpmEditor.vue';
import TimeSignatureEditor from '@/components/editor/TimeSignatureEditor.vue';

/** A level-based Editor for tempo-related values
 * @remarks Shows a level with inputs for BPM, time signature etc., as level items
 */

const emit = defineEmits([
    'update:numerator',
    'update:denominator',
    'update:beatsPerMinute',
]);

const props = defineProps({
    numerator: {
        type: null as unknown as PropType<number | null>,
        required: false,
        default: null,
    },
    denominator: {
        type: null as unknown as PropType<number | null>,
        required: false,
        default: null,
    },
    beatsPerMinute: {
        type: null as unknown as PropType<number | null>,
        required: false,
        default: null,
    },
});
</script>
