<template>
    <div class="buttons">
        <ToggleButton
            class="button is-info is-rounded"
            v-for="tag in allTags"
            :key="tag"
            :class="{
                'is-inactive': !isSelected(tag),
            }"
            @click="toggle(tag)"
            :is-engaged="isSelected(tag)"
            >{{ tag }}
        </ToggleButton>
    </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';
import ToggleButton from '@/components/buttons/ToggleButton.vue';

const emit = defineEmits(['selected', 'deselected']);

const props = defineProps({
    allTags: {
        type: Set as PropType<Set<string>>,
        required: true,
    },
    selectedTags: {
        type: Set as PropType<Set<string>>,
        required: false,
        default: new Set<string>([]),
    },
    small: {
        type: Boolean,
        required: false,
        default: false,
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
