/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import router from './router';
import VueScrollTo from 'vue-scrollto';
//@ts-ignore (because vue3-promise-dialog does not provide types)
import { PromiseDialog } from 'vue3-promise-dialog';
import { useMessageStore } from './store/messages';
import { createManager } from '@vue-youtube/core';
import chalk from 'chalk';
import { ExperimentDirective } from './directives/ExperimentDirective';
import { FocusDirective } from './directives/FocusDirective';
import { TooltipDirective } from './directives/TooltipDirective';
import { useAppStore } from './store/app';
import { useAudioStore } from './store/audio';
import { ReplayerEvent } from './code/ui/ReplayerEvent';

const appInfo = chalk.bold.hex('#f89406'); // Replayer cue color (bulma warning)
console.log(
    appInfo(`Replayer app version: ${import.meta.env.VITE_APP_VERSION}`),
);
console.log(appInfo(`MODE: ${import.meta.env.MODE}`));
console.log(appInfo(`NODE_ENV: ${process.env.NODE_ENV}`));
console.debug(appInfo(`BASE_URL: ${import.meta.env.BASE_URL}`));
console.log(appInfo(`GIT_VERSION: ${import.meta.env.VITE_APP_GIT_VERSION}`));
console.log(
    appInfo(`GIT_AUTHOR_DATE: ${import.meta.env.VITE_APP_GIT_AUTHOR_DATE}`),
);

const youtubeManager = createManager({
    deferLoading: {
        enabled: true,
        autoLoad: true,
    },
});

/** Creates the Replayer VueJs app */
const app = createApp(App)
    .use(createPinia())
    .use(router)
    .use(VueScrollTo, { duration: 300 /* replayer-transition-duration */ })
    .use(PromiseDialog, {})
    .use(youtubeManager)
    .directive('focus', FocusDirective)
    .directive('experiment', ExperimentDirective)
    .directive('tooltip', TooltipDirective);

// --- Show general errors (including unhandled promises) as message ---

const message = useMessageStore();
// Add a custom error handler, useful for logging errors
app.config.errorHandler = (err) => {
    message.pushError(`${err}`);
};

window.addEventListener(
    'unhandledrejection',
    function (event: PromiseRejectionEvent) {
        message.pushError(event?.reason);
    },
);

/** Register a handler to handle page reloads and tab/browser exits
 */
window.onbeforeunload = app.unmount;

app.onUnmount(() => {
    console.log('app::cleanUp...');
    useAppStore().revokeAllMediaUrls();
    useAudioStore().closeContext();
    console.log('app::cleanUp done.');
});

app.mount('#app');
