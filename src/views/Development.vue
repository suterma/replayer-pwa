<template>
    <div class="development">
        <h1>1) Select a REZ or ZIP file</h1>
        <RezLoader />
        <p>This component loads a .REZ Compilaton into memory</p>

        <!-- //TODO later only show when something is loaded -->
        <template v-if="true">
            <h1>2) See the compilation</h1>
            <CompilationDisplay :compilation="compilation" />

            <h1>3) Play an arbitrary MP3 file (loaded Track)</h1>

            <ul>
                <li v-for="fileUrl in fileUrls" :key="fileUrl.objectUrl">
                    <AudioElement
                        :title="fileUrl.fileName"
                        :src="fileUrl.objectUrl"
                    ></AudioElement>
                </li>
            </ul>
        </template>

        <hr />
        //TODO's
        <ul>
            <li>
                Find a suitable ready-made component for for the audio player
                (for VueJs), if available
            </li>
        </ul>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import RezLoader from '@/components/RezLoader.vue'; // @ is an alias to /src
import { ICompilation, ITrack } from '@/store/compilation-types';
import CompilationDisplay from '@/components/CompilationDisplay.vue';
import AudioElement from '@/components/AudioElement.vue';
import { MediaFile } from '@/store/state-types';

export default defineComponent({
    components: {
        RezLoader,
        CompilationDisplay,
        AudioElement,
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
            const fileUrls = this.$store.getters.fileUrls;
            console.debug('Development::FILEURLS', fileUrls);
            return fileUrls;
        },
    },
});
</script>
