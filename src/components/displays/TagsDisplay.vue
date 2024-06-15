<template>
    <div class="tags are-large">
        <TransitionGroup name="list">
            <span class="tag is-info is-rounded" v-for="tag in tags" :key="tag">
                <div>
                    {{ tag }}
                    <button
                        class="delete is-large"
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
});

function remove(tag: string) {
    emit('remove', tag);
}
</script>
