<template>
    <NavbarTop />

    <!-- The page content -->
    <section class="section">
        <div id="content" class="content">
            <router-view />
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
import { MutationTypes } from './store/mutation-types';

export default defineComponent({
    name: 'App',
    components: { NavbarTop, ProgressOverlay, WelcomeMessage },
    computed: {},
    beforeCreate() {
        this.$store.commit(MutationTypes.INIT_STORE);
    },
});
</script>
