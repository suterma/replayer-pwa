<template>
    <!-- align like a bulma level, vertically centered -->
    <div class="is-flex is-align-items-center" v-click-outside="acceptValue">
        <slot></slot>
        <template v-if="editMode">
            <!-- Use ENTER as hotkey to accept the value -->
            <!-- Use ESC as hotkey to revert the value -->
            <input
                v-focus
                :class="{ input: true, 'is-static': !editMode }"
                :value="modelValue"
                @input="$emit('update:modelValue', $event.target.value)"
                @blur="acceptValue()"
                @keydown.prevent.enter="acceptValue()"
                @keydown.prevent.escape="revertValue()"
                type="text"
                inputmode="text"
                :placeholder="placeholder"
                tabindex="0"
            />
            <!-- Edit -->
            <NavButton
                @click="toggleEditMode()"
                :iconPath="mdiCheckBold"
                title="Click to accept"
            />
        </template>
        <span
            v-else
            @click="toggleEditMode()"
            title="Click to edit"
            class="is-relative mr-40px"
        >
            <span v-if="!modelValue" class="is-placeholder"
                >{{ placeholder }}
            </span>
            {{ modelValue }}
            <!-- Edit -->
            <!-- To not disturb the original layout by the edit button, just position it absolutely,
            and introduce a margin on the original text. -->
            <NavButton
                class="is-absolute"
                :iconPath="mdiPencilOutline"
                title="Click to edit"
            />
        </span>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NavButton from '@/components/buttons/NavButton.vue';
import { mdiPencilOutline, mdiCheckBold } from '@mdi/js';

/** A text input, which has a dedicated edit icon.
 * @remarks Provides a slot for a prefix content
 */
export default defineComponent({
    name: 'EditableInput',
    components: { NavButton },
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
    data() {
        return {
            /** Whether the input is in Edit mode */
            editMode: false,

            /* The previous input text, to reverse an edit */
            previousValue: '' as string | undefined,

            /** Icons from @mdi/js */
            mdiCheckBold: mdiCheckBold,
            mdiPencilOutline: mdiPencilOutline,
        };
    },
    computed: {},
    methods: {
        updateValue() {
            this.$emit('update:modelValue', this.modelValue);
        },
        toggleEditMode() {
            this.editMode = !this.editMode;
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
.is-absolute {
    bottom: -8px;
    margin: auto 0;
}
</style>
