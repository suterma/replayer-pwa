<template>
    <span
        :title="text"
        :class="{
            'is-clipped': true,
            'has-ellipsis': true,
            'has-left-ellipsis': this.clipLeft,
            'is-single-line': true,
        }"
        >{{ text }}</span
    ><progress
        v-if="this.hasProgress"
        class="progress is-small ml-3"
        max="100"
    ></progress>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** A long line of content that does not break, but instead has a hidden overflow
 */
export default defineComponent({
    name: 'LongLine',
    props: {
        text: String,
        /** Whether the a progress bar is rendered
         */
        hasProgress: {
            type: Boolean,
            default: false,
        },
        /** Whether the text is clipped at the left side
         */
        clipLeft: {
            type: Boolean,
            default: false,
        },
    },
    computed: {},
    methods: {},
});
</script>
<style scoped>
.progress {
    min-width: 0.5em;
    width: 5em;
    max-width: 10em;
}
</style>
