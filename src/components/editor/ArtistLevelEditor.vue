<template>
    <div class="level">
        <div class="level-item has-text-centered is-flex-shrink-5">
            <!-- Artist -->
            <LabeledInput label="by">
                <StyledInput
                    class="input is-italic"
                    :modelValue="props.artist"
                    @update:modelValue="(value:string) => emit('update:artist', value)"
                    type="text"
                    placeholder="Artist"
                    title="Artist"
                    data-cy="track-artist"
                    focusOnMounted
                >
                </StyledInput>
            </LabeledInput>
        </div>
        <div class="level-item has-text-centered is-flex-shrink-5">
            <!-- Album -->
            <LabeledInput label="on">
                <StyledInput
                    class="input is-italic"
                    :modelValue="props.album"
                    @update:modelValue="(value:string) => emit('update:album', value)"
                    type="text"
                    placeholder="Album"
                    title="Album"
                    data-cy="track-album"
                >
                </StyledInput>
            </LabeledInput>
        </div>
    </div>
</template>

<script setup lang="ts">
import StyledInput from '@/components/StyledInput.vue';
import LabeledInput from './LabeledInput.vue';

/** A level-based Editor for an artist and album
 * @remarks Shows a level with inputs for artist and album as level items
 */
const emit = defineEmits(['update:artist', 'update:album']);

const props = defineProps({
    artist: {
        type: String,
        required: true,
    },
    album: {
        type: String,
        required: true,
    },
});
</script>
