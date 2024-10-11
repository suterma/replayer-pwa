<!--
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
-->
<template>
    <v-layout ref="app" class="rounded rounded-md">
        <v-app-bar :elevation="2">
            <template #prepend>
                <v-app-bar-nav-icon></v-app-bar-nav-icon>
            </template>

            <v-app-bar-title>Application Bar</v-app-bar-title>
            <StageMark></StageMark>
        </v-app-bar>

        <v-main
            class="d-flex align-center justify-center"
            style="min-height: 300px"
        >
            <!-- The app menu, on the right, without bottom margin to not alter the layout of content below -->
            <section
                class="section has-background-none is-hidden-print is-pulled-right pb-0"
            >
                <AppContextMenu
                    :has-compilation="hasCompilation"
                ></AppContextMenu>
            </section>

            <!-- The routed view section -->
            <!-- To facilitate route-specific styles, the route name is provided as it's own class -->
            <section
                class="section route"
                :class="router.currentRoute.value.name"
            >
                <router-view></router-view>
            </section>
        </v-main>
        <!-- The bottom bar, used as a media player panel
        for the media player widget in some view modes -->
        <v-footer
            id="media-player-panel"
            ref="mediaPlayerPanel"
            name="footer"
            app
            class="is-hidden-print"
            aria-label="media player"
        >
        </v-footer>
    </v-layout>
    <MessageOverlay />
    <DialogWrapper :transition-attrs="{ name: 'dialog' }" />
</template>
<script setup lang="ts">
import AppContextMenu from '@/components/context-menu/AppContextMenu.vue';
import StageMark from '@/components/indicators/StageMark.vue';
import MessageOverlay from '@/components/MessageOverlay.vue';
//@ts-ignore (because the vue3-promise-dialog does not provide types)
import { DialogWrapper } from 'vue3-promise-dialog';
import { useSettingsStore } from '@/store/settings';
import { useAppStore } from './store/app';
import { acknowledgeVersion } from './code/ui/dialogs';
import { compare } from 'compare-versions';
import { computed, onMounted, ref, provide, readonly } from 'vue';
import { storeToRefs } from 'pinia';
import { refDebounced, useElementSize } from '@vueuse/core';
import { useRouter } from 'vue-router';

onMounted(() => {
    handleAppUpdate();
});

const app = useAppStore();
const { hasCompilation } = storeToRefs(app);
const settings = useSettingsStore();
const { useWideContentWidth } = storeToRefs(settings);
const router = useRouter();

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
        if (compare(previousVersion, '2.1.0', '<')) {
            updateText =
                'Version 2.1.0: fullscreen mode, simplified video usage, audio level meter off by default\r\n' +
                updateText;
        }
        if (compare(previousVersion, '2.2.0', '<')) {
            updateText =
                'Version 2.2.0: playback speed can be changed\r\n' + updateText;
        }
        if (compare(previousVersion, '2.2.1', '<')) {
            updateText = 'Version 2.2.1: minor bugfixes\r\n' + updateText;
        }
        if (compare(previousVersion, '2.3.0', '<')) {
            updateText =
                'Version 2.3.0: Storage bugfixes and minor UI improvements\r\n' +
                updateText;
        }
        if (compare(previousVersion, '2.4.0', '<')) {
            updateText =
                'Version 2.4.0: PDF display, improved fade- and preroll-handling, and tag-based filtering\r\n' +
                updateText;
        }

        acknowledgeVersion(currentVersion, updateText).then(() => {
            app.updateAcknowledgedVersion(currentVersion);
        });
    } else {
        app.updateAcknowledgedVersion(currentVersion);
    }

    console.debug('App.vue::handleAppUpdate done.');
}

// --- bottom navbar spacing ---

const mediaPlayerPanel = ref();
</script>
