import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import { store } from './store/store';
import VueScrollTo from 'vue-scrollto';
import SlideUpDown from 'vue3-slide-up-down';
import vClickOutside from 'click-outside-vue3';

//import {clickOutside} from './directives/clickOutside';

// const clickOutside = {
//     beforeMount: (el: any, binding: any) => {
//         el.clickOutsideEvent = (event: any) => {
//             // here I check that click was outside the el and his children
//             if (!(el == event.target || el.contains(event.target))) {
//                 // and if it did, call method provided in attribute value
//                 binding.value();
//             }
//         };
//         document.addEventListener('click', el.clickOutsideEvent);
//     },
//     unmounted: (el: any) => {
//         document.removeEventListener('click', el.clickOutsideEvent);
//     },
// };

import outfront from 'outfront'; // import outfront JS
outfront(); // Call it on top of project.

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
