<template>
    <!-- Note: This template is not actually used but provided here to avoid a warning -->
    <p>Loading the demo....</p>
</template>

<script lang="ts">
import { useAppStore } from '@/store/app';
import { mapActions } from 'pinia';
import { defineComponent } from 'vue';

/** A view for demo purposes
 * @remarks Just loads the demo compilation and navigates to the play view.
 */
export default defineComponent({
    name: 'Demo',
    components: {},

    mounted() {
        this.loadDemo();
        this.$router.push('play');
    },

    methods: {
        ...mapActions(useAppStore, ['loadFromUrl']),

        loadDemo() {
            const url =
                'https://lib.replayer.app/demo-compilation-featuring-lidija-roos-with-info.rex';
            console.debug('loadDemo:', url);
            this.loadFromUrl(url);
        },
    },
});
</script>
