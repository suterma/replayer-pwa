<template>
    <div>
        <article class="message is-danger">
            <div class="message-header">
                <p>Under construction</p>
            </div>
            <div class="message-body">
                <p>
                    The classic
                    <a
                        href="https://github.com/suterma/replayer"
                        target="_blank"
                        >RePlayer</a
                    >, as a Progressive Web App
                </p>
                <p>
                    Go to
                    <router-link to="/development">Development</router-link> to
                    try the current version.
                </p>
            </div>
        </article>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    components: {},
})
</script>
