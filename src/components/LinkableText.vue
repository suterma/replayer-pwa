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
    methods: {
        isValidHttpUrl(text: string) {
            let url;

            try {
                url = new URL(text);
            } catch (_) {
                return false;
            }

            return url.protocol === 'http:' || url.protocol === 'https:';
        },
    },
    computed: {
        isLinkText(): boolean {
            if (!this.text) {
                return false;
            }
            return this.isValidHttpUrl(this.text);
        },
    },
});
</script>
