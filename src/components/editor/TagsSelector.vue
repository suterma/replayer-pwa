<template>
    <TransitionGroup name="list" tag="div" class="notranslate buttons">
        <ToggleButton
            v-for="tag in allTags"
            :key="tag"
            class="button is-info is-colorless is-rounded transition-in-place"
            :class="{
                'is-inactive': !isSelected(tag),
            }"
            :is-engaged="isSelected(tag)"
            @click="toggle(tag)"
            >{{ tag }}
        </ToggleButton>
    </TransitionGroup>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import ToggleButton from '@/components/buttons/ToggleButton.vue';

const emit = defineEmits(['selected', 'deselected']);

const props = defineProps({
    /** All tags to offer to select from */
    allTags: {
        type: Set as PropType<Set<string>>,
        required: true,
    },
    /** The currently selected tags
     * @remarks Selection changes will be indicated via the respective events
     */
    selectedTags: {
        type: Set as PropType<Set<string>>,
        required: false,
        default: new Set<string>([]),
    },
});

function isSelected(tag: string) {
    return props.selectedTags.has(tag);
}

function toggle(tag: string) {
    if (isSelected(tag)) {
        emit('deselected', tag);
    } else {
        emit('selected', tag);
    }
}
</script>
