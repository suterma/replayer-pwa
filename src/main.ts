import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import { store } from './store/store';
import VueScrollTo from 'vue-scrollto';
import vClickOutside from 'click-outside-vue3';
import { PromiseDialog } from 'vue3-promise-dialog';
import Experimental from '@/components/Experimental.vue';

console.log('App version: ' + process.env.VUE_APP_VERSION);
console.log('Environment: ' + process.env.NODE_ENV);
console.log('GIT_VERSION: ' + process.env.VUE_APP_GIT_VERSION);
console.log('GIT_AUTHOR_DATE: ' + process.env.VUE_APP_GIT_AUTHOR_DATE);

createApp(App)
    .use(store)
    .use(router)
    .use(VueScrollTo)
    .use(vClickOutside)
    .use(PromiseDialog)
    .component('Experimental', Experimental)
    .directive('focus', {
        mounted: (el) => el.focus(),
    })
    .mount('#app');

// Show general errors (including unhandled promises) within the app's notification system
import { MutationTypes } from './store/mutation-types';
onerror = (_event, _source, _lineno, _colno, error) => {
    store.commit(MutationTypes.PUSH_ERROR, `${error?.name}: ${error?.message}`);
};
window.addEventListener('unhandledrejection', function (event) {
    store.commit(MutationTypes.PUSH_ERROR, `${event.reason}`);
});
