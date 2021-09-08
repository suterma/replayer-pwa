<template>
    <section class="hero is-primary">
        <div class="hero-body">
            <p class="title">Under construction</p>
            <p class="subtitle">
                The classic
                <a href="https://github.com/suterma/replayer" target="_blank"
                    >RePlayer</a
                >, as a Progressive Web App
            </p>
            <p>
                Go to
                <router-link to="/development">Development</router-link> to try
                upcoming features.
            </p>
        </div>
    </section>
    <section class="section">
        <div class="container">
            <div class="notification is-warning">Use with caution</div>
            <p>RePlayer supports</p>
            <ul>
                <li>Loading of .REZ / .ZIP compilations</li>
            </ul>
            <p>
                The following features might be implemented soon (see also the
                <a href="https://github.com/suterma/replayer-pwa/issues"
                    >issues on the GitHub repository</a
                >)
            </p>
            <ul>
                <li>Dark theme</li>
                <li>Loading of LivePlayer compilations</li>
                <li>Visual indication of already passed cues in the track</li>
            </ul>
        </div>
    </section>
    <section class="hero is-danger">
        <div class="hero-body">
            <p class="title">Continue at:</p>
            <p class="">
                //TODO recreate the object tree from the NSKeyedArchiver data in
                the plist file
            </p>
        </div>
    </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    components: {},
});
</script>
