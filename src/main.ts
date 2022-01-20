import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import { store } from './store/store';
import VueScrollTo from 'vue-scrollto';
import SlideUpDown from 'vue3-slide-up-down';
import vClickOutside from 'click-outside-vue3';
import outfront from 'outfront';

/** Custom outfront variant from the replayer project
 * @devdoc Currently not in use because of issues with errors from within promises
 */
//import outfront from './../../OutFrontJS'; // import outfront JS from local script
//import outfront from './code/outfront'; // import outfront JS
//outfront('warn'); // Call it on top of project.

outfront();

console.log('App version: ' + process.env.VUE_APP_VERSION);
console.log('Environment: ' + process.env.NODE_ENV);
console.log('GIT_VERSION: ' + process.env.VUE_APP_GIT_VERSION);
console.log('GIT_AUTHOR_DATE: ' + process.env.VUE_APP_GIT_AUTHOR_DATE);

createApp(App)
    .use(store)
    .use(router)
    .use(VueScrollTo)
    .use(vClickOutside)
    .component('slide-up-down', SlideUpDown)
    .mount('#app');
