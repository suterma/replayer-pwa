<template>
    <section class="hero is-danger">
        <div class="hero-body has-text-centered">
            <p class="title">Under construction</p>
            <p class="subtitle">
                The classic
                <a href="https://github.com/suterma/replayer" target="_blank"
                    >Replayer</a
                >, as a Progressive Web App
            </p>
        </div>
    </section>

    <section class="section">
        <div class="has-text-centered">
            <p>
                Go to

                <router-link to="/development">Development</router-link>

                to try upcoming features.
            </p>
        </div>
    </section>
    <div class="container">
        <h1 class="title is-1">Replayer</h1>
        <p></p>
    </div>

    <div class="container">
        <h1>Current features</h1>
        <ul>
            <li>Loading of compilations from local files (No Web URL yet)</li>
            <li>Replay of tracks with cues (no keyboard support yet)</li>
        </ul>

        <p>
            The following file types are supported (See also the documentation
            for Replayer Classic)
        </p>

        <ul>
            <li>Compilation XML file (.rex)</li>
            <li>Compilation bplist file (From LivePlayback, PlayList)</li>
            <li>
                Zipped archives of the above, including the media files (.zip,
                .rez)
            </li>
        </ul>
        <p>
            Note: Media files are matched by name. Only .mp3 are supported
            currently.
        </p>

        <p>
            The following features might be implemented soon (see also the
            <a href="https://github.com/suterma/replayer-pwa/issues"
                >issues on the GitHub repository</a
            >)
        </p>
        <ul>
            <li>Visual indication of already passed cues in the track</li>
            <li>Visual indication of currently playing track</li>
            <li>Better responsiveness on smaller devices</li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    components: {},
});
</script>
