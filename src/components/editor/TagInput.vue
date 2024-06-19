<template>
    <LabeledInput label="Add Tag">
        <input
            ref="newTag"
            class="input"
            type="text"
            @keyup.enter="addNewTag"
        />

        <template #addon>
            <div class="control" title="Add new tag">
                <button class="button as-after-addon" @click="addNewTag">
                    <BaseIcon v-once :path="mdiTagPlusOutline" />
                </button>
            </div>
        </template>
    </LabeledInput>
</template>

<script setup lang="ts">
import LabeledInput from '@/components/editor/LabeledInput.vue';
import { mdiTagPlusOutline } from '@mdi/js';
import { ref } from 'vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';

/**
 * An input control for Tags, with a label
 */
defineProps({
    /**
     * The label text
     */
    label: {
        type: String,
        required: false,
        default: '',
    },
});

const emit = defineEmits(['newTag']);

// --- Tag handling ---

const newTag = ref(null);

/** Uses the text from the tag input as new tag and clears the input */
function addNewTag() {
    const tagInput = newTag.value as unknown as HTMLInputElement;
    const tag = tagInput.value;
    emit('newTag', tag);
    tagInput.value = '';
}
</script>
