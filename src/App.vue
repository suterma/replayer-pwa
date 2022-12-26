<template>
    <!-- The app menu, on the right, without bottom margin to not alter the layout of content below -->
    <section
        class="section has-background-none is-hidden-print is-pulled-right pb-0"
    >
        <AppContextMenu></AppContextMenu>
    </section>
    <!-- The pages section -->
    <section class="section">
        <!-- To keep the audio within the media player component running, 
            simply keep this component alive over route changes -->
        <router-view v-slot="{ Component }">
            <keep-alive include="Play">
                <component :is="Component" />
            </keep-alive>
        </router-view>
        <ProgressOverlay />
        <ErrorOverlay />
        <DialogWrapper :transition-attrs="{ name: 'dialog' }" />
    </section>

    <!-- The ad is only used for print outputs, to allow a printout recipient to explore the app. -->
    <ReplayerAd class="is-print-only is-together-print is-scaled-50" />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import AppContextMenu from '@/components/context-menu/AppContextMenu.vue';
import ProgressOverlay from '@/components/ProgressOverlay.vue';
import ReplayerAd from '@/components/ReplayerAd.vue';
import ErrorOverlay from '@/components/ErrorOverlay.vue';
import { MutationTypes } from './store/mutation-types';
import { DialogWrapper } from 'vue3-promise-dialog';
import Experimental from './components/Experimental.vue';

export default defineComponent({
    name: 'App',
    components: {
        AppContextMenu,
        ProgressOverlay,
        ErrorOverlay,
        DialogWrapper,
        ReplayerAd,
        Experimental,
    },

    /** Register a handler to handle page reloads and tab/browser exits
     * @devdoc Using the "unmounted" lifecycle event proved to be unreliable: Page reload in the Browser did not trigger "unmounted"
     * Using the window's onbeforeunload causes the cleanup to get reliably triggered at page reload
     */
    beforeMount() {
        window.onbeforeunload = this.cleanUp;
    },

    methods: {
        cleanUp() {
            console.log('App.vue::cleanUp...');
            //Make sure, no object URLs are remaining
            this.$store.commit(MutationTypes.REVOKE_ALL_MEDIA_URLS);
            console.log('App.vue::cleanUp done.');
        },
    },
});
</script>
