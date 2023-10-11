<template>
    <p>
        <SupportedFilesText />
    </p>
    <p>
        <a
            href="https://replayer.app/documentation/audio-formats"
            alt="Link to the Replayer app documentation"
            target="_blank"
            >Learn more...</a
        >.
    </p>

    <p>
        <a
            href="https://replayer.app/privacy-policy"
            alt="Link to the Replayer app privacy policy"
            target="_blank"
            >Privacy policy...</a
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
