<template>
    <p>
        The
        <a
            href="https://replayer.app/"
            alt="Link to the Replayer website"
            target="_blank"
            >Replayer Web App</a
        >
        is a companion to the
        <a
            href="https://replayer.app/"
            alt="Link to the Replayer website"
            target="_blank"
            >Replayer Classic</a
        >
        Windows desktop application. It features the playback of locally
        downloaded files of these types:
    </p>

    <SupportedFilesText />

    <p>
        Find more details in the online
        <a
            href="https://replayer.app/documentation-app"
            alt="Link to the Replayer app documentation"
            target="_blank"
            >app documentation</a
        >
        .
    </p>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import SupportedFilesText from '@/components/SupportedFilesText.vue';

export default defineComponent({
    name: 'WelcomeText',
    components: { SupportedFilesText },
});
</script>
