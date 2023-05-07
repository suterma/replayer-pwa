import { createApp } from 'vue';
import App from './App.vue';
import { createPinia } from 'pinia';
import './registerServiceWorker';
import router from './router';
import VueScrollTo from 'vue-scrollto';
import vClickOutside from 'click-outside-vue3';
import { PromiseDialog } from 'vue3-promise-dialog';
import Experimental from '@/components/Experimental.vue';

console.log('App version: ' + process.env.VUE_APP_VERSION);
console.log('Environment: ' + process.env.NODE_ENV);
console.log('GIT_VERSION: ' + process.env.VUE_APP_GIT_VERSION);
console.log('GIT_AUTHOR_DATE: ' + process.env.VUE_APP_GIT_AUTHOR_DATE);

const pinia = createPinia();

createApp(App)
    .use(pinia)
    .use(router)
    .use(VueScrollTo)
    .use(vClickOutside)
    .use(PromiseDialog, {})
    .component('Experimental', Experimental)
    .directive('focus', {
        mounted: (el) => el.focus(),
    })
    .mount('#app');

// Show general errors (including unhandled promises) within the app's notification system
import { useAppStore } from './store/app';
const app = useAppStore();

onerror = (_event, _source, _lineno, _colno, error) => {
    app.pushError(`${error?.name}: ${error?.message}`);
};
window.addEventListener('unhandledrejection', function (event) {
    app.pushError(`${event?.reason}`);
});
