import { createApp } from 'vue';
import App from './App.vue';
import './registerServiceWorker';
import router from './router';
import { store } from './store/store';
import VueScrollTo from 'vue-scrollto';
import AudioVisual from 'vue-audio-visual';

import outfront from 'outfront'; // import outfront JS
outfront(); // Call it on top of project.

createApp(App)
    .use(store)
    .use(router)
    .use(VueScrollTo)
    .use(AudioVisual)
    .mount('#app');
