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
import { ExperimentDirective } from './directives/ExperimentDirective';
import { FocusDirective } from './directives/FocusDirective';
import { TooltipDirective } from './directives/TooltipDirective';
import { useAppStore } from './store/app';
import { useAudioStore } from './store/audio';
import useLog from './composables/LogComposable';
import { logInjectionKey } from './AppInjectionKeys';

const { log } = useLog();
log.info(`Replayer app version: ${import.meta.env.VITE_APP_VERSION}`);
log.info(`MODE: ${import.meta.env.MODE}`);
log.info(`NODE_ENV: ${process.env.NODE_ENV}`);
log.info(`BASE_URL: ${import.meta.env.BASE_URL}`);
log.info(`GIT_VERSION: ${import.meta.env.VITE_APP_GIT_VERSION}`);
log.info(`GIT_AUTHOR_DATE: ${import.meta.env.VITE_APP_GIT_AUTHOR_DATE}`);

const youtubeManager = createManager({
    deferLoading: {
        enabled: true,
        autoLoad: true,
    },
});

/** Creates the Replayer VueJs app */
const app = createApp(App)
    .provide(logInjectionKey, log)
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
    log.info('app::cleanUp...');
    useAppStore().revokeAllMediaUrls();
    useAudioStore().closeContext();
    log.info('app::cleanUp done.');
});

app.mount('#app');
