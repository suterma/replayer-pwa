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
import { TrackApi } from '@/code/api/TrackApi';

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
        const query = this.$route?.query;

        //Handle a Track API Request (mandatory media is available)
        if (query && query['media'] !== undefined) {
            const track = TrackApi.parseFromUrlQuery(query);
            if (track && track.Url) {
                console.log(
                    'CompilationLoader::mounted:adding track from URL:',
                    track.Url,
                );
                //Add the track, before the track media URL (to avoid the creation of a default track)
                useAppStore().addTrack(track);

                // Select cue matching the initial playhead position (see #134)
                const initialCueId = track.Cues?.find(
                    (cue) => cue.Time == track.PlayheadPosition,
                )?.Id;
                if (initialCueId) {
                    useAppStore().updateSelectedCueId(initialCueId);
                } else {
                    const firstCueId = track.Cues?.[0]?.Id;
                    if (firstCueId) {
                        useAppStore().updateSelectedCueId(firstCueId);
                    }
                }
                //Now, after the track has been added, add the track's media URL
                useAppStore().useMediaFromUrl(track.Url);
            } else {
                this.pushError(
                    'No valid track media URL found, no track is loaded',
                );
            }
        }
        //Handle a Package API Request (mandatory package is available)
        const packageUrl = query['package'] as string;
        if (query && packageUrl) {
            console.log(
                'CompilationLoader::mounted:adding package from URL:',
                packageUrl,
            );
            useAppStore()
                .loadFromUrl(packageUrl)
                .catch((errorMessage: string) => {
                    this.pushError(errorMessage);
                });
        }
        this.removeQuery();
    },
    methods: {
        ...mapActions(useMessageStore, ['pushError']),

        /** Removes the API query from the fragment, since it has been applied now
         */
        removeQuery() {
            this.$router.replace({ query: undefined });
        },
    },
});
</script>
