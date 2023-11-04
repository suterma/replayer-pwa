<template>
    <Playback
        v-show="
            routedToPlayback || experimentalShowEverythingEverywhereAllAtOnce
        "
    ></Playback>
    <hr v-if="experimentalShowEverythingEverywhereAllAtOnce" />
    <Setlist
        v-show="
            routedToSetlist || experimentalShowEverythingEverywhereAllAtOnce
        "
    ></Setlist>
    <hr v-if="experimentalShowEverythingEverywhereAllAtOnce" />
    <Settings
        v-show="
            routedToSettings || experimentalShowEverythingEverywhereAllAtOnce
        "
    ></Settings>
    <hr v-if="experimentalShowEverythingEverywhereAllAtOnce" />
    <About
        v-show="routedToAbout || experimentalShowEverythingEverywhereAllAtOnce"
    ></About>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import Playback from '@/views/main/Playback.vue';
import Setlist from '@/views/main/Setlist.vue';
import Settings from '@/views/main/Settings.vue';
import About from '@/views/main/About.vue';
import { computed } from 'vue';
import { Route } from '@/router';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';

/** A main view for the Replayer application
 * @remarks This main view works similar but distinct from keep-alive with router-view.
 * It routes to the different main views of the application, but always keeps them
 * mounted, and rendered to the real DOM.
 * This facilitates a permanently existing DOM for the applications parts that should
 * maintain a continuous playback (especially the media elements, but also
 * other DOM related features)
 */

/** Apply the settings */
const settings = useSettingsStore();
const { experimentalShowEverythingEverywhereAllAtOnce } = storeToRefs(settings);

/** Handle the routes */
const router = useRouter();

const routedToPlayback = computed(() => {
    return (
        router.currentRoute.value.name === Route.Play ||
        router.currentRoute.value.name === Route.Edit ||
        router.currentRoute.value.name === Route.Mix
    );
});
const routedToSetlist = computed(() => {
    return router.currentRoute.value.name === Route.Setlist;
});
const routedToSettings = computed(() => {
    return router.currentRoute.value.name === Route.Settings;
});
const routedToAbout = computed(() => {
    return router.currentRoute.value.name === Route.About;
});
</script>
