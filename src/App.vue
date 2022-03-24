<template>
    <NavbarTop />

    <!-- The pages section -->
    <section class="section">
        <!-- To keep the audio within the media player component running, 
            simply keep this component alive over route changes -->
        <router-view v-slot="{ Component }">
            <keep-alive include="Play">
                <component :is="Component" />
            </keep-alive>
        </router-view>
        <CompilationLoader />
        <ProgressOverlay />
        <ErrorOverlay />
        <DialogWrapper :transition-attrs="{ name: 'dialog' }" />
    </section>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import NavbarTop from '@/components/NavbarTop.vue';
import ProgressOverlay from '@/components/ProgressOverlay.vue';
import ErrorOverlay from '@/components/ErrorOverlay.vue';
import { MutationTypes } from './store/mutation-types';
import CompilationLoader from '@/components/CompilationLoader.vue';
import { DialogWrapper } from 'vue3-promise-dialog';

export default defineComponent({
    name: 'App',
    components: {
        NavbarTop,
        CompilationLoader,
        ProgressOverlay,
        ErrorOverlay,
        DialogWrapper,
    },
    beforeCreate() {
        this.$store.commit(MutationTypes.RETRIEVE_SETTINGS);
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
