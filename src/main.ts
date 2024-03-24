/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import { createApp, watch } from 'vue';
import App from './App.vue';
import { createPinia, storeToRefs } from 'pinia';
import router from './router';
import VueScrollTo from 'vue-scrollto';
import vClickOutside from 'click-outside-vue3';
//@ts-ignore (because vue3-promise-dialog does not provide types)
import { PromiseDialog } from 'vue3-promise-dialog';
import { useMessageStore } from './store/messages';
import { useAppStore } from './store/app';
import { createManager } from '@vue-youtube/core';
import { useTitle } from '@vueuse/core';
import chalk from 'chalk';
import { ExperimentDirective } from './directives/ExperimentDirective';
import { FocusDirective } from './directives/FocusDirective';
import { TooltipDirective } from './directives/TooltipDirective';

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

createApp(App)
    .use(createPinia())
    .use(router)
    .use(VueScrollTo, { duration: 300 /* replayer-transition-duration */ })
    .use(vClickOutside)
    .use(PromiseDialog, {})
    .use(youtubeManager)
    .directive('focus', FocusDirective)
    .directive('experiment', ExperimentDirective)
    .directive('tooltip', TooltipDirective)
    .mount('#app');

// Show general errors (including unhandled promises)
const message = useMessageStore();
onerror = (_event, _source, _lineno, _colno, error) => {
    message.pushError(`${error?.name}: ${error?.message}`);
};
window.addEventListener(
    'unhandledrejection',
    function (event: PromiseRejectionEvent) {
        console.error(event?.reason, event);
        message.pushError(event?.reason);
    },
);

// Handle the app title when the compilation title changes
const app = useAppStore();
const title = useTitle();
const { compilationTitle } = storeToRefs(app);
watch(compilationTitle, () => {
    const updatedTitle =
        (compilationTitle.value ? compilationTitle.value + ' | ' : '') +
        'Replayer';
    title.value = updatedTitle;
});
