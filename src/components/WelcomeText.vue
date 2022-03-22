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
        <Experimental>
            <a
                href="http://localhost:8080/#/play?media=https%3A%2F%2Fweb.replayer.app%2Fyour-light-by-lidija-roos.mp3&title=Your%20Light&artist=Lidija%20Roos&album=Not%20For%20Sale&6.49=Intro"
                alt="Link to the Replayer app demo"
            >
                API test with Lidija Roos</a
            >
            <a
                href="http://localhost:8080/#/play?media=https%3A%2F%2Fweb.replayer.app%2Fyour-light-by-lidija-roos.mp3&title=Your%20Light&artist=Lidija%20Roos&album=Not%20For%20Sale&6.49=Intro&12=twelve"
                alt="Link to the Replayer app demo"
            >
                API test with Lidija Roos2</a
            >
        </Experimental>
    </p>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import SupportedFilesText from '@/components/SupportedFilesText.vue';
import Experimental from '@/components/Experimental.vue';
import { ActionTypes } from '@/store/action-types';

export default defineComponent({
    name: 'WelcomeText',
    components: { SupportedFilesText, Experimental },
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
