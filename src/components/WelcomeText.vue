<template>
    <SupportedFilesText />

    <p class="has-text-centered">
        Find more details in the online
        <a
            href="https://replayer.app/documentation-app"
            alt="Link to the Replayer app documentation"
            target="_blank"
            >app documentation</a
        >
        or
        <a href="#" alt="Link to the Replayer app demo" @click="loadDemo()"
            >try the demo</a
        >.
    </p>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import SupportedFilesText from '@/components/SupportedFilesText.vue';
import { ActionTypes } from '@/store/action-types';

export default defineComponent({
    name: 'WelcomeText',
    components: { SupportedFilesText },
    methods: {
        loadDemo() {
            const url =
                location.protocol +
                '//' +
                location.host +
                location.pathname +
                'demo-compilation-featuring-lidija-roos.rez';
            console.debug('loadDemo:', url);

            this.$store.dispatch(ActionTypes.LOAD_FROM_URL, url);
        },
    },
});
</script>
