<template>
    <div class="home">
        <img alt="Vue logo" src="../assets/logo.png" />
        <p>
            The classic
            <a href="https://github.com/suterma/replayer" target="_blank"
                >RePlayer</a
            >, as a Progressive Web App
        </p>
        <p>
            Go to <router-link to="/development">Development</router-link> to
            try the current version.
        </p>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    components: {},
});
</script>
