<template>
    <NavbarTop />

    <!-- The page content -->
    <section class="section">
        <div id="content" class="content">
            <router-view />
            <ProgressOverlay />
            <WelcomeOverlay />
        </div>
    </section>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import NavbarTop from '@/components/NavbarTop.vue';
import ProgressOverlay from '@/components/ProgressOverlay.vue';
import WelcomeOverlay from '@/components/WelcomeOverlay.vue';

export default defineComponent({
    name: 'App',
    components: { NavbarTop, ProgressOverlay, WelcomeOverlay },
    computed: {
        progressMessage(): string {
            return this.$store.getters.progressMessage;
        },
        hasProgressMessage(): boolean {
            return (
                this.progressMessage != null && this.progressMessage.length > 0
            );
        },
    },
});
</script>
