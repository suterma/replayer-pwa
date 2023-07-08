import { createApp, watch } from 'vue';
import App from './App.vue';
import { createPinia, storeToRefs } from 'pinia';
import './registerServiceWorker';
import router, { updateTitle } from './router';
import VueScrollTo from 'vue-scrollto';
import vClickOutside from 'click-outside-vue3';
import { PromiseDialog } from 'vue3-promise-dialog';
import { useMessageStore } from './store/messages';
import { useAppStore } from './store/app';

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
    .directive('focus', {
        mounted: (el) => el.focus(),
    })
    .directive('experiment', (el: HTMLElement, binding) => {
        // this will be called for both `mounted` and `updated`
        if (binding.value) {
            el.classList.add('is-experimental');
        } else {
            // NOTE: This does not remove the element from the DOM/VDOM,
            // it will actually run the full vue lifecycle.
            // If it should not be rendered, additionally use the v-if directive
            // NOTE: using el.remove(); would not help here, since the element
            // would already have been added to the DOM
            el.style.display = 'none';
        }
    })
    .mount('#app');

// Show general errors (including unhandled promises)
const message = useMessageStore();
onerror = (_event, _source, _lineno, _colno, error) => {
    message.pushError(`${error?.name}: ${error?.message}`);
};
window.addEventListener('unhandledrejection', function (event) {
    message.pushError(`${event?.reason}`);
});

// Handle the app title when the compilation title changes
const app = useAppStore();
const { compilationTitle } = storeToRefs(app);
watch(compilationTitle, () => {
    updateTitle();
});
