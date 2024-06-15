<template>
    <div
        class="tags"
        :class="{
            'are-large': !small,
        }"
    >
        <TransitionGroup name="list">
            <span class="tag is-info is-rounded" v-for="tag in tags" :key="tag">
                <div>
                    {{ tag }}
                    <button
                        v-if="!readonly"
                        class="delete"
                        :class="{
                            'is-large': !small,
                        }"
                        @click="remove(tag)"
                    ></button>
                </div>
            </span>
        </TransitionGroup>
    </div>
</template>

<script setup lang="ts">
import { type PropType } from 'vue';

const emit = defineEmits(['remove']);

defineProps({
    tags: {
        type: Set as PropType<Set<string>>,
        required: true,
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
});

function remove(tag: string) {
    emit('remove', tag);
}
</script>
