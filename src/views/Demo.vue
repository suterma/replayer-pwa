<template>
    <!-- Note: This template is not actually used but provided here to avoid a warning -->
    <p>Loading the demo....</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ActionTypes } from '@/store/action-types';

/** A view for demo purposes
 * @remarks Just loads the demo compilation and navigates to the play view. Later, some explanatory items could be added.
 */
export default defineComponent({
    name: 'Demo',
    components: {},

    mounted() {
        this.loadDemo();
        this.$router.push('play');
    },

    methods: {
        loadDemo() {
            // const url =
            //     location.protocol +
            //     '//' +
            //     location.host +
            //     location.pathname +
            //     'demo-compilation-featuring-lidija-roos.rez';
            // console.debug('loadDemo:', url);

            // const url =
            //     'https://web-devel.replayer.app/demo-compilation-featuring-lidija-roos.rez';

            // https://web-devel.replayer.app/#/play?package=https://web-devel.replayer.app/music/large.rez
            const url = 'https://web-devel.replayer.app/music/large.rez';
            console.debug('loadDemo:', url);

            this.$store.dispatch(ActionTypes.LOAD_FROM_URL, url);
        },
    },
});
</script>
