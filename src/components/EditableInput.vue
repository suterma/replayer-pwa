<template>
    <div class="editableInput" v-click-outside="acceptValue">
        <!-- Note: Enter to accept the value -->
        <GlobalEvents
            v-if="editMode"
            @keydown.prevent.enter="acceptValue()"
            @keydown.prevent.escape="revertValue()"
        />
        <input
            v-if="editMode"
            :class="{ input: true, 'is-static': !editMode }"
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            @blur="acceptValue()"
            type="text"
            :placeholder="placeholder"
            ref="textInput"
            tabindex="0"
        />
        <span v-else @click="toggleEditMode()">
            <template v-if="!modelValue"
                >Click to set: {{ placeholder }}
            </template>
            {{ modelValue }}
        </span>
        <!-- Edit -->

        <!-- dropdown-trigger -->
        <NavButton
            v-if="editMode"
            @click="toggleEditMode()"
            iconPathData="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
            title="Click to accept"
        />
        <NavButton
            v-else
            @click="toggleEditMode()"
            iconPathData="M20.71,7.04C21.1,6.65 21.1,6 20.71,5.63L18.37,3.29C18,2.9 17.35,2.9 16.96,3.29L15.12,5.12L18.87,8.87M3,17.25V21H6.75L17.81,9.93L14.06,6.18L3,17.25Z"
            title="Click to edit"
        />
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { GlobalEvents } from 'vue-global-events';
import NavButton from '@/components/NavButton.vue';

/** A text input, which has a dedicated edit icon.
 */
export default defineComponent({
    name: 'EditableInput',
    components: { GlobalEvents, NavButton },
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

        /* The previous input text, to reverse an edit */
        previousValue: '' as string | undefined,
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

        /** Accept the value and end the edit mode */
        revertValue() {
            this.$emit('update:modelValue', this.previousValue);
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
    watch: {
        /** Watch for changes in the edit mode
         * @remarks Handles the restoration of the previous value in case of an escape
         */
        editMode(newVal: boolean): void {
            if (newVal) {
                this.previousValue = this.modelValue;
            }
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
