<template>
    <div>
        <!-- Compilation loader -->
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useAppStore } from '@/store/app';
import { useMessageStore } from '@/store/messages';
import { mapActions } from 'pinia';
import XmlCompilationParser from '@/code/xml/XmlCompilationParser';

/** A Loader for packages or tracks, from the URL
 * @remarks Implements the Track and Package API by loading items from the URL parameters
 * @devdoc According to my current understanding this must be run
 * as part of a component. Otherwise the URL fragment part is not processed
 * as the query part within vue-router
 */
export default defineComponent({
    name: 'CompilationLoader',
    mounted: function (): void {
        //Check whether a given compilation is to be loaded (by Track API)
        //console.debug('CompilationLoader::mounted:route', this.$route);
        const query = this.$route?.query;

        //Handle a Track API Request (mandatory media is available)
        if (query && query['media'] !== undefined) {
            const track = XmlCompilationParser.parseFromUrlQuery(query);
            if (track && track.Url) {
                //Add the track, before the track media URL (to avoid the creation of a default track)
                this.addTrack(track);
                const firstCueId = track.Cues[0]?.Id;
                if (firstCueId) {
                    this.updateSelectedCueId(firstCueId);
                }
                //Now, after the track has been added, add the track's media URL
                this.useMediaFromUrl(track.Url);
            } else {
                this.pushError(
                    'No valid track media URL found, no track is loaded',
                );
            }
        }
        //Handle a Package API Request (mandatory package is available)
        if (query && query['package']) {
            this.loadFromUrl(query['package'] as string);
        }
        this.removeQuery();
    },
    methods: {
        ...mapActions(useAppStore, [
            'loadFromUrl',
            'updateSelectedCueId',
            'updateScheduledCueId',
            'addTrack',
            'useMediaFromUrl',
        ]),

        ...mapActions(useMessageStore, ['pushError']),

        /** Removes the API query from the fragment, since it has been applied now
         */
        removeQuery() {
            this.$router.replace({ query: undefined });
        },
    },
});
</script>
