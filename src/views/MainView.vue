<!--
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
-->
<template>
    <!-- NOTE: the same audio context is reused for all playback operations and
         must be resumed once in the main view lifetime, when used.  -->
    <div @click="resumeAudioContext()">
        <PlaybackView
            v-show="
                routedToPlayback ||
                experimentalShowEverythingEverywhereAllAtOnce
            "
        ></PlaybackView>
        <hr v-if="experimentalShowEverythingEverywhereAllAtOnce" />
        <SetlistView
            v-show="
                routedToSetlist || experimentalShowEverythingEverywhereAllAtOnce
            "
        ></SetlistView>
        <hr v-if="experimentalShowEverythingEverywhereAllAtOnce" />
        <SettingsView
            v-show="
                routedToSettings ||
                experimentalShowEverythingEverywhereAllAtOnce
            "
        ></SettingsView>
        <hr v-if="experimentalShowEverythingEverywhereAllAtOnce" />
        <AboutView
            v-show="
                routedToAbout || experimentalShowEverythingEverywhereAllAtOnce
            "
        ></AboutView>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import PlaybackView from '@/views/main/PlaybackView.vue';
import SetlistView from '@/views/main/SetlistView.vue';
import SettingsView from '@/views/main/SettingsView.vue';
import AboutView from '@/views/main/AboutView.vue';
import { computed, onBeforeMount } from 'vue';
import { Route } from '@/router';
import { useSettingsStore } from '@/store/settings';
import { storeToRefs } from 'pinia';
import { useAppStore } from '@/store/app';
import { useAudioStore } from '@/store/audio';
import { ReplayerEvent } from '@/code/ui/ReplayerEvent';

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

/** Any route that actively controls playback */
const routedToPlayback = computed(() => {
    return routedToPlay.value || routedToEdit.value || routedToMix.value;
});

const routedToPlay = computed(() => {
    return router.currentRoute.value.name === Route.Play;
});
const routedToEdit = computed(() => {
    return router.currentRoute.value.name === Route.Edit;
});
const routedToMix = computed(() => {
    return router.currentRoute.value.name === Route.Mix;
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

// --- resource and audio context handling

/** Register a handler to handle page reloads and tab/browser exits
 * @devdoc Using the "unmounted" lifecycle event proved to be unreliable: The Browser did not trigger "unmounted".
 * Using the window's onbeforeunload causes the handler to get reliably triggered
 */
onBeforeMount(() => {
    window.onbeforeunload = cleanUp;
});

const app = useAppStore();
const audio = useAudioStore();
const { showLevelMeterForEdit } = storeToRefs(settings);

function cleanUp() {
    console.log('Main.vue::cleanUp...');

    document.dispatchEvent(
        new CustomEvent(ReplayerEvent.CLEAN_UP, {
            detail: 'none',
        }),
    );

    //Make sure, no object URLs are remaining
    app.revokeAllMediaUrls();

    audio.closeContext();

    console.log('Main.vue::cleanUp done.');
}

/*
 * @devdoc Great care has been taken to only ever create and use the audio context
 * when required. Currently, the audio level meter is only shown with a
 * corresponding option set to true and only in edit mode.
 * Audio context handling throughout the application reflects this.
 */
function resumeAudioContext() {
    if (showLevelMeterForEdit.value && routedToEdit.value) {
        audio.resumeContext();
    }
}
</script>
