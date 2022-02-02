<template>
    <button
        :class="{
            button: true,
            'is-small': true,
        }"
        @click="toggleExpanded()"
        :title="titleText"
    >
        <!-- Collapsed/Expanded -->
        <span
            :class="{
                icon: true,
                rotate: true,
                down: this.modelValue,
            }"
        >
            <i class="mdi mdi-24px">
                <!-- A chevron down icon -->
                <svg style="width: 24px; height: 24px" viewBox="0 0 24 24">
                    <path
                        fill="currentColor"
                        d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z"
                    />
                </svg>
            </i>
        </span>
        <span v-if="this.modelValue" class=""> {{ this.expandedText }}</span>
        <span v-else class=""> {{ this.collapsedText }} </span>
    </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** A button to select the collapsed or expanded state
 */
export default defineComponent({
    name: 'CollapsibleButton',
    emits: ['update:modelValue'],
    components: {},
    props: {
        /** Whether this represents the expanded state. */
        modelValue: {
            type: Boolean,
            default: false,
        },
        expandedText: {
            type: String,
            default: '',
        },
        collapsedText: {
            type: String,
            default: '',
        },
    },
    methods: {
        toggleExpanded() {
            const expanded = !this.modelValue;
            console.debug(
                `CollapsibleButton::toggleExpanded:expanded:${expanded}`,
            );
            this.$emit('update:modelValue', expanded);
        },
    },
    computed: {
        titleText(): string {
            if (this.modelValue) {
                return 'collapse';
            }
            return 'expand';
        },
    },
});
</script>
<style scoped>
.rotate {
    -moz-transition: all 0.3s linear;
    -webkit-transition: all 0.3s linear;
    transition: all 0.3s linear;
}

.rotate.down {
    -ms-transform: rotate(180deg);
    -moz-transform: rotate(180deg);
    -webkit-transform: rotate(180deg);
    transform: rotate(180deg);
}
</style>
