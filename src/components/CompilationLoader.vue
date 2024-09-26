<template>
    <div>
        <!-- Compilation loader -->
    </div>
</template>

<script setup lang="ts">
/** A Loader for packages or tracks, from the URL
 * @remarks Implements the Track and Package API by loading items from the URL parameters
 * @devdoc According to my current understanding this must be run
 * as part of a component. Otherwise the URL fragment part is not processed
 * as the query part within vue-router
 */
import { onMounted } from 'vue';
import { useAppStore } from '@/store/app';
import { useMessageStore } from '@/store/messages';
import { TrackApi } from '@/code/api/TrackApi';
import { useRoute, useRouter } from 'vue-router';

const message = useMessageStore();
const router = useRouter();
const route = useRoute();

onMounted(() => {
    //Check whether a given compilation is to be loaded (by Track API)
    const query = route?.query;

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
            message.pushError(
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
                message.pushError(errorMessage);
            });
    }
    removeQuery();
});

/** Removes the API query from the fragment, since it has been applied now
 */
function removeQuery() {
    router.replace({ query: undefined });
}
</script>
