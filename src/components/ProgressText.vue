<template>
    {{ progressMessage }}
</template>

<script lang="ts">
import { defineComponent } from 'vue'

/** A simple textual display of the latest application progress message */
export default defineComponent({
    name: 'ProgressText',

    methods: {},
    computed: {
        progressMessage(): string {
            return this.$store.getters.progressMessage
        },
    },
})
</script>
