<template>
    <a
        v-if="isLinkText"
        :href="text"
        alt="Link to the displayed text"
        target="_blank"
        >{{ text }}</a
    >
    <template v-else>
        {{ text }}
    </template>
</template>

<script lang="ts">
import FileHandler from '@/store/filehandler';
import { defineComponent } from 'vue';

/** Display for a text, which shows a link instead, if the text is an URL
 */
export default defineComponent({
    name: 'LinkableText',
    props: {
        text: {
            type: String,
            required: false,
        },
    },
    data() {
        return {};
    },
    computed: {
        isLinkText(): boolean {
            return FileHandler.isValidHttpUrl(this.text ?? '');
        },
    },
});
</script>
