<!--
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
-->
<template>
    <!-- Use the full width for a navigable channel arrangement the mix view, 
        and a more accessible narrower blog style width for all other content -->
    <div
        :class="{
            'container is-fullhd':
                router.currentRoute.value.name != 'mix' && !useWideContentWidth,
        }"
    >
        <StageMark></StageMark>
        <!-- The app menu, on the right, without bottom margin to not alter the layout of content below -->
        <section
            class="section has-background-none is-hidden-print is-pulled-right pb-0"
        >
            <AppContextMenu :has-compilation="hasCompilation"></AppContextMenu>
        </section>

        <!-- The routed view section -->
        <!-- To facilitate route-specific styles, the route name is provided as it's own class -->
        <section class="section route" :class="router.currentRoute.value.name">
            <router-view></router-view>
            <MessageOverlay />
            <DialogWrapper :transition-attrs="{ name: 'dialog' }" />
        </section>

        <section class="is-hidden-print">
            <!-- A placeholder that invisibly extends the view bottom,
        taking into account the vertical size of the media player panel.
        An additional margin is used as an additional spacer
        to make it visually clear that no more content is available below.
        The min-height is the empirically determined minimal value.        
        -->
            <div
                class="mt-6"
                :style="{
                    'min-height': '153px',
                    height: navbarCompensationHeight + 'px',
                }"
            ></div>
        </section>
    </div>
    <!-- The bottom nav bar, used as a media player panel
        for the media player widget in some view modes -->
    <nav
        class="navbar is-fixed-bottom has-background-grey-dark is-hidden-print"
    >
        <div
            id="media-player-panel"
            ref="mediaPlayerPanel"
            :class="{
                'container is-fullhd':
                    router.currentRoute.value.name != 'mix' &&
                    !useWideContentWidth,
            }"
            aria-label="media player"
        ></div>
    </nav>
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
import { computed, onMounted, provide, readonly, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { refDebounced, useElementSize } from '@vueuse/core';
import { useRouter } from 'vue-router';
import { trackViewModeInjectionKey } from '@/components/track/TrackInjectionKeys';
import { Route } from '@/router';
import { TrackViewMode } from '@/store/TrackViewMode';

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

        acknowledgeVersion(currentVersion, updateText).then(() => {
            app.updateAcknowledgedVersion(currentVersion);
        });
    } else {
        app.updateAcknowledgedVersion(currentVersion);
    }

    console.debug('App.vue::handleAppUpdate done.');
}

// --- track view mode ---

const trackViewMode = computed(() => {
    const routeName = router.currentRoute.value.name;
    switch (routeName) {
        case Route.Edit:
            return TrackViewMode.Edit;
        case Route.Play:
            return TrackViewMode.Play;
        case Route.Mix:
            return TrackViewMode.Mix;
        default:
            return TrackViewMode.Play;
    }
});

provide(trackViewModeInjectionKey, readonly(trackViewMode));

// --- bottom navbar spacing ---

const mediaPlayerPanel = ref();
const { height } = useElementSize(mediaPlayerPanel);

/** A computed compensation height, using a fixed value as a fallback.
 * @devdoc Some devices, notably older iOS devices can not get the panel
 * height (equals zero), thus a useful default is assumed instead.
 */
const mediaPlayerPanelComputedHeight = computed(() => {
    return height.value
        ? height.value
        : 205 /*empirically determined useful max height*/;
});

/** The body height compensation for the fixed navbar.
 * @remark Debounced to prevent excess updates
 * @devdoc Debouncing also solves a update loop error
 */
const navbarCompensationHeight = refDebounced(
    mediaPlayerPanelComputedHeight,
    300 /*replayer-transition-duration*/,
);
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
