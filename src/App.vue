<template>
    <StageMark></StageMark>
    <!-- The app menu, on the right, without bottom margin to not alter the layout of content below -->
    <section
        class="section has-background-none is-hidden-print is-pulled-right pb-0"
    >
        <AppContextMenu :has-compilation="hasCompilation"></AppContextMenu>
    </section>
    <!-- The routed view section -->
    <!-- NOTE: the same audio context is reused for all playback operations and
         must be resumed once in the app lifetime, when used. 
         This is solved here globally for simplicity -->
    <section class="section">
        <router-view></router-view>
        <ProgressOverlay />
        <ErrorOverlay />
        <DialogWrapper :transition-attrs="{ name: 'dialog' }" />
    </section>

    <!-- The bottom nav bar, used for the media player widget for the active track 
        plus the compilation-wide transport in mix mode -->
    <nav
        id="media-player"
        class="navbar is-fixed-bottom has-background-grey-dark is-hidden-print"
        role="form"
        aria-label="media player"
    ></nav>

    <div class="section is-hidden-print">
        <!-- A placeholder that invisibly extends the view bottom,
        taking into account the player widget.
        An additional surrounding section is used as an additional spacer
        to make it visually clear that no more content is available below.
        -->
        <div class="has-player-navbar-fixed-bottom"></div>
        <!-- A placeholder that invisibly extends the bottom for the experimental content in the fixed bottom bar -->
        <div
            v-experiment="experimentalShowPositionInTrackHeader"
            style="height: 224px"
        ></div>
    </div>
</template>
<script setup lang="ts">
import AppContextMenu from '@/components/context-menu/AppContextMenu.vue';
import ProgressOverlay from '@/components/ProgressOverlay.vue';
import StageMark from '@/components/StageMark.vue';
import ReplayerAd from '@/components/ReplayerAd.vue';
import ErrorOverlay from '@/components/ErrorOverlay.vue';
//@ts-ignore (because the vue3-promise-dialog does not provide types)
import { DialogWrapper } from 'vue3-promise-dialog';
import { useSettingsStore } from '@/store/settings';
import { useAppStore } from './store/app';
import { acknowledgeVersion } from './code/ui/dialogs';
import { compare } from 'compare-versions';
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';

onMounted(() => {
    handleAppUpdate();
});

const app = useAppStore();
const settings = useSettingsStore();

const { hasCompilation } = storeToRefs(app);
const { experimentalShowPositionInTrackHeader } = storeToRefs(settings);

// --- app state ---

/** Check for and handle a new version */
function handleAppUpdate() {
    // Check for and handle a new version
    const currentVersion = import.meta.env.VITE_APP_VERSION ?? '0.0.1';
    const previousVersion = app.acknowledgedVersion ?? currentVersion;

    if (currentVersion != previousVersion) {
        console.debug(
            `App.vue::handleAppUpdate from ${previousVersion} to ${currentVersion}`,
        );

        // Remove stale state, when updating from old vuex state
        if (compare(previousVersion, '2.0.0', '<')) {
            app.discardCompilation();
            useSettingsStore().$reset();
            localStorage.clear();
            indexedDB.deleteDatabase('keyval-store');
        }

        let updateText = '';
        if (compare(previousVersion, '2.0.0', '<')) {
            updateText =
                'New version (2.0.0): This release adds video playback, including YouTube. It shows text files in a compilation. During editing, a waveform view and a peak level meter is available. A customizable pre-roll can be set.\r\n' +
                updateText;
        }
        if (compare(previousVersion, '2.0.1', '<')) {
            updateText =
                'Bugfix version (2.0.1): Audio related bugfixes.\r\n' +
                updateText;
        }
        if (compare(previousVersion, '2.0.2', '<')) {
            updateText = 'Version 2.0.2: Minor bugfixes\r\n' + updateText;
        }

        acknowledgeVersion(currentVersion, updateText).then(() => {
            app.updateAcknowledgedVersion(currentVersion);
        });
    } else {
        app.updateAcknowledgedVersion(currentVersion);
    }

    console.debug('App.vue::handleAppUpdate done.');
}
</script>
<!-- HINT: Uncomment to display the HTML structure for review -->
<!--
<style type="css">
* {
    border: 1px black solid;
    margin: 2px;
    padding: 2px;
}
*:hover {
    background-color: pink;
}
</style>
-->
