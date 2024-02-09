<template>
    <!-- Note: This template is not actually used but provided here to avoid a warning -->
    <p>Loading the demo....</p>
</template>

<script lang="ts">
import { Route } from '@/router';
import { useAppStore } from '@/store/app';
import { mapActions } from 'pinia';
import { defineComponent } from 'vue';

/** A view for demo purposes
 * @remarks Just loads the demo compilation and navigates to the play view.
 */
export default defineComponent({
    name: 'DemoView',
    components: {},

    mounted() {
        this.loadDemo();
        this.$router.push(Route.Play);
    },

    methods: {
        ...mapActions(useAppStore, ['loadFromUrl']),

        loadDemo() {
            const url =
                'https://lib.replayer.app/demo/demo-compilation-featuring-lidija-roos-with-info.xml';
            console.debug('loadDemo:', url);
            this.loadFromUrl(url);
        },
    },
});
</script>
