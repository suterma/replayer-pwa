<template>
    <div class="level is-mobile">
        <div class="level-left level-wrap">
            <!-- Video toggler -->
            <div class="level-item has-text-left">
                <div class="field is-horizontal">
                    <div class="field-body">
                        <div class="field">
                            <p class="control">
                                <LabeledCheckbox
                                    v-model="vModel"
                                    label="Show video"
                                ></LabeledCheckbox>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <template v-if="props.modelValue">
                <!-- Video size toggler -->
                <div class="level-item has-text-left">
                    <div class="field is-horizontal">
                        <div class="field-body">
                            <div class="field">
                                <p class="control">
                                    <LabeledCheckbox
                                        v-model="vModelSmallVideo"
                                        label="Limit video height"
                                    ></LabeledCheckbox>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
                <!-- NOTE: YouTube's TOC do not allow content overlays, 
                     thus no captions are implemented here -->
            </template>
        </div>
        <div class="level-right"></div>
    </div>
</template>

<script setup lang="ts">
import { type PropType, computed } from 'vue';
import LabeledCheckbox from '@/components/editor/LabeledCheckbox.vue';
import type { ICue } from '@/store/ICue';

/** A YouTube controller, that toggles the video properties
 */

const props = defineProps({
    /** Whether to show the video. Includes showing these controls (except the showVideo toggler)
     */
    modelValue: {
        type: Boolean,
        required: false,
        default: true,
    },
    /** Whether to show the video in a small canvas.
     */
    smallVideo: {
        type: Boolean,
        required: false,
        default: true,
    },
});

// --- visibility ---

const emit = defineEmits(['update:modelValue', 'update:smallVideo']);

const vModel = computed<boolean>({
    get(): boolean {
        return props.modelValue;
    },
    set(value): void {
        emit('update:modelValue', value);
    },
});
const vModelSmallVideo = computed<boolean>({
    get(): boolean {
        return props.smallVideo;
    },
    set(value): void {
        emit('update:smallVideo', value);
    },
});
</script>
