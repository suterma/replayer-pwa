<template>
    <Experimental>
        <NavbarTop class="is-hidden-print" />
    </Experimental>
    <section
        class="section has-background-none is-hidden-print is-pulled-right"
    >
        <AppContextMenu style="z-index: 3"></AppContextMenu>
    </section>
    <!-- The pages section -->
    <section class="section">
        <!-- To keep the audio within the media player component running, 
            simply keep this component alive over route changes -->
        <router-view v-slot="{ Component, id }">
            <keep-alive include="Play">
                <component :is="Component" :key="id" />
            </keep-alive>
        </router-view>
        <ProgressOverlay />
        <ErrorOverlay />
        <DialogWrapper :transition-attrs="{ name: 'dialog' }" />
    </section>
    <Ad class="is-print-only" />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import NavbarTop from '@/components/NavbarTop.vue';
import AppContextMenu from '@/components/AppContextMenu.vue';
import ProgressOverlay from '@/components/ProgressOverlay.vue';
import Experimental from '@/components/Experimental.vue';
import Ad from '@/components/Ad.vue';
import ErrorOverlay from '@/components/ErrorOverlay.vue';
import { MutationTypes } from './store/mutation-types';
import { DialogWrapper } from 'vue3-promise-dialog';

export default defineComponent({
    name: 'App',
    components: {
        NavbarTop,
        AppContextMenu,
        ProgressOverlay,
        ErrorOverlay,
        Experimental,
        DialogWrapper,
        Ad,
    },
    beforeMount() {
        //Handle reloads and tab/browser exits
        //Using the "unmounted" lifecycle event proved to be unreliable: Page reload in the Browser did not trigger "unmounted"
        //Using the onbeforeunload causes the cleanup to get reliably triggered at page reload
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
