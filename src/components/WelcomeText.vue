<template>
    <div class="section has-background-transparent">
        <div class="level">
            <div class="level-item has-text-centered">
                <a
                    href="https://replayer.app#how-it-works"
                    alt="Link to the Replayer app website with the how it works section"
                    target="_blank"
                    >How it works...</a
                >.
            </div>
            <div class="level-item has-text-centered">
                <a
                    href="https://replayer.app/documentation"
                    alt="Link to the Replayer app documentation"
                    target="_blank"
                    >Documentation...</a
                >.
            </div>
            <div class="level-item has-text-centered">
                <a
                    href="https://replayer.app/documentation/media-formats"
                    alt="Link to the Replayer app documentation about media formats"
                    target="_blank"
                    >Supported media formats...</a
                >.
            </div>
            <div class="level-item has-text-centered">
                <a
                    href="https://replayer.app/privacy-policy"
                    alt="Link to the Replayer app privacy policy"
                    target="_blank"
                    >Privacy policy...</a
                >.
            </div>
        </div>
    </div>

    <!-- <p>
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
    </p> -->
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
