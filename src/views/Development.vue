<template>
    <div class="development">
        <img alt="Vue logo" src="../assets/logo.png" />

        <RezLoader />

        //TODO's
        <ul>
            <li>Use a proper vuex store, with proper types for compilations</li>
            <li>
                Create players for all files individually. Find a suitable
                ready-made component for this
            </li>
            <li>Parse the XML compilation and show the content</li>
            <li>Select a UI framework</li>
        </ul>
    </div>
</template>

<script lang="ts">
import { Options, Vue } from 'vue-class-component';
import RezLoader from '@/components/RezLoader.vue'; // @ is an alias to /src
import store from '@/store';

@Options({
    components: {
        RezLoader,
    },
})
export default class Home extends Vue {
    //TODO currently not used here, tracks are shown in the loader only, currently
    // tracks(): Array<string> {
    //     return store.getters.tracks;
    // }
}
</script>
