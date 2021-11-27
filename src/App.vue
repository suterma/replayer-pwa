<template>
    <NavbarTop />

    <!-- The page content -->
    <section class="section">
        <div id="content" class="content">
            <!-- To keep the audio within the media player component running, 
            simply keep this component alive over route changes -->
            <router-view v-slot="{ Component }">
                <keep-alive include="Play">
                    <component :is="Component" />
                </keep-alive>
            </router-view>

            <ProgressOverlay />
            <WelcomeMessage />
        </div>
    </section>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import NavbarTop from '@/components/NavbarTop.vue';
import ProgressOverlay from '@/components/ProgressOverlay.vue';
import WelcomeMessage from '@/components/WelcomeMessage.vue';
import { ActionTypes } from './store/action-types';
import { MutationTypes } from './store/mutation-types';

export default defineComponent({
    name: 'App',
    components: { NavbarTop, ProgressOverlay, WelcomeMessage },
    computed: {},
    beforeCreate() {
        this.$store.dispatch(ActionTypes.RETRIEVE_COMPILATION);
        this.$store.commit(MutationTypes.INIT_APPLICATION_STATE);
    },
});
</script>
