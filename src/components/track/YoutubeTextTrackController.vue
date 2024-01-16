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
            <!-- NOTE: YouTube's TOC do not allow content overlays, 
                     thus no captions are implemented here -->
        </div>
        <div class="level-right"></div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import LabeledCheckbox from '@/components/editor/LabeledCheckbox.vue';

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
</script>
