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
                //TODO unfortunately, the buffer is 52210 bytes long as from the
                content, but the correct size (from the hex editor) should be
                45416 bytes //TODO we should read the buffer corectly. The
                initial string bplist00 is correct though //TODO probably there
                is a confusion when reading as binary string (with UTF-8 or some
                escape characters??)
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
