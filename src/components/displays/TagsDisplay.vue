<template>
    <span
        class="notranslate tags"
        :class="{
            'are-large': !small,
        }"
    >
        <TransitionGroup name="list">
            <span
                v-for="tag in tags"
                :key="tag"
                class="tag is-info is-colorless is-rounded transition-in-place"
                :class="{
                    'has-text-dark': readonly,
                }"
            >
                {{ tag }}
                <button
                    v-if="!readonly"
                    class="delete"
                    :class="{
                        'is-large': !small,
                    }"
                    @click="remove(tag)"
                ></button>
            </span>
        </TransitionGroup>
    </span>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';

const emit = defineEmits(['remove']);

defineProps({
    tags: {
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
    readonly: {
        type: Boolean,
        required: false,
        default: false,
    },
    selectable: {
        type: Boolean,
        required: false,
        default: false,
    },
});

function remove(tag: string) {
    emit('remove', tag);
}
</script>
