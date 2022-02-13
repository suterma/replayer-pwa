<template>
    <div class="editableInput" v-click-outside="acceptValue">
        <!-- Note: Enter to accept the value -->
        <GlobalEvents v-if="editMode" @keydown.prevent.enter="acceptValue" />
        <input
            v-if="editMode"
            :class="{ input: true, 'is-static': !editMode }"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            type="text"
            placeholder="placeholder"
            ref="textInput"
            tabindex="0"
        />
        <span v-else @click="toggleEditMode()">
            {{ modelValue }}
        </span>
        <!-- Edit -->

        <!-- dropdown-trigger -->
        <button class="button is-nav" @click="toggleEditMode()" tabindex="0">
            <span
                :class="{
                    icon: true,
                }"
            >
                <i class="mdi mdi-24px">
                    <!-- A checkmark icon -->
                    <svg
                        v-if="editMode"
                        style="width: 24px; height: 24px"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="currentColor"
                            d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
                        />
                    </svg>
                    <!-- A pencil icon -->
                    <svg
                        v-else
                        style="width: 24px; height: 24px"
                        viewBox="0 0 24 24"
                    >
                        <path
                            fill="currentColor"
                            d="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
                        />
                    </svg>
                </i>
            </span>
        </button>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { GlobalEvents } from 'vue-global-events';

/** A text input, which has a dedicated edit icon.
 */
export default defineComponent({
    name: 'EditableInput',
    components: { GlobalEvents },
    emits: ['update:modelValue'],
    props: {
        /* The input text */
        modelValue: {
            type: String,
            default: undefined,
        },
        /** The placeholder to show in edit mode, when empty
         */
        placeholder: {
            type: String,
            default: undefined,
        },
    },
    data: () => ({
        /** Whether the input is in Edit mode */
        editMode: false,
    }),

    computed: {},
    methods: {
        updateValue() {
            this.$emit('update:modelValue', this.modelValue);
        },
        toggleEditMode() {
            this.editMode = !this.editMode;
            if (this.editMode) {
                this.setFocusToInput();
            }
        },

        /** Accept the value and end the edit mode */
        acceptValue() {
            this.editMode = false;
        },

        /** Sets the focus to the input box
         * @devdoc Use next-tick, because the input is not yet existing according to the v-if
         */
        setFocusToInput() {
            this.$nextTick(() => {
                const inputElement = this.$refs.textInput as HTMLInputElement;
                inputElement.focus();
            });
        },
    },
});
</script>
<style scoped>
.editableInput {
    /** align like a bulma level, vertically centered */
    display: flex;
    align-items: center;
}
</style>
