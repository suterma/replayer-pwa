<template>
    <div class="level">
        <div class="level-item has-text-centered">
            <span class="has-opacity-half is-single-line">by</span>
        </div>
        <div class="level-item has-text-centered is-flex-shrink-5">
            <!-- Artist -->
            <div class="field">
                <p class="control">
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
                </p>
            </div>
        </div>
        <div class="level-item has-text-centered">
            <span class="has-opacity-half is-single-line">on</span>
        </div>
        <div class="level-item has-text-centered is-flex-shrink-5">
            <!-- Album -->
            <div class="field">
                <p class="control">
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
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import StyledInput from '@/components/StyledInput.vue';
import { defineProps, defineEmits } from 'vue';

/** A level-based Editor for an artist and album
 * @remarks Shows a level with inputs for artist and album as level items
 * @devdoc Input value binding is not implemented with a two-way v-model binding because the incoming values are taken
 * from a property (where setting of values is not permitted).
 * Instead, the values are one-way bound via :value and changes are directly stored in the state.
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
