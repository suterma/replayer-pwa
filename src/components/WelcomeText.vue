<template>
    <SupportedFilesText />

    <p class="has-text-centered">
        Find more details in the online
        <a
            href="https://replayer.app/documentation-app"
            alt="Link to the Replayer app documentation"
            target="_blank"
            >app documentation</a
        >.
    </p>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import SupportedFilesText from '@/components/SupportedFilesText.vue';

export default defineComponent({
    name: 'WelcomeText',
    components: { SupportedFilesText },
    methods: {},
});
</script>
