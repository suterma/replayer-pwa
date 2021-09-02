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
        </div>
    </section>
    <section class="section">
        <div class="">
            <p>
                Go to
                <router-link to="/development">Development</router-link> to try
                upcoming features.
            </p>
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
