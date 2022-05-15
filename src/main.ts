import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import { store } from './store/store';
import VueScrollTo from 'vue-scrollto';
import SlideUpDown from 'vue3-slide-up-down';
import vClickOutside from 'click-outside-vue3';
import { PromiseDialog } from 'vue3-promise-dialog';

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
    .component('slide-up-down', SlideUpDown)
    .directive('focus', {
        mounted: (el) => el.focus(),
    })
    .mount('#app');
