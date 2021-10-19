<template>
    <RezLoader />
    <CompilationDisplay :compilation="compilation" />
    <hr />

    <!-- <div class="has-text-centered"> -->
    <p>
        <a href="https://replayer.app/" alt="Link to the Replayer website"
            >Replayer</a
        >
        is a free, cue-based media player for rehearsals with playback music. By
        the click of a button, you can start to play at predefined times in the
        audio file.
    </p>

    <p>
        Go to

        <router-link to="/development">Development</router-link>

        to try upcoming features.
    </p>
    <!-- </div> -->
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RezLoader from '@/components/RezLoader.vue'; // @ is an alias to /src
import CompilationDisplay from '@/components/CompilationDisplay.vue'; // @ is an alias to /src
import { ICompilation, ITrack } from '@/store/compilation-types';
import { MediaFile } from '@/store/state-types';

/** A view for playing an existing compilation */
export default defineComponent({
    name: 'Play',
    components: {
        RezLoader,
        CompilationDisplay,
    },
    computed: {
        compilation(): ICompilation {
            return this.$store.getters.compilation;
        },
        tracks(): Array<string> {
            return (this.$store.getters.compilation as ICompilation).Tracks.map(
                function (item: ITrack) {
                    return item.Name;
                },
            );
        },
        fileUrls(): Array<MediaFile> {
            return this.$store.getters.fileUrls;
        },
    },
});
</script>
