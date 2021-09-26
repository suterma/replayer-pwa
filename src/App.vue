<template>
    <NavbarTop />

    <!-- The page content -->
    <section class="section">
        <div id="content" class="content">
            <router-view />
        </div>
    </section>
    <ProgressOverlay />
    <NavbarBottom />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import NavbarTop from '@/components/NavbarTop.vue';
import NavbarBottom from '@/components/NavbarBottom.vue';
import ProgressOverlay from '@/components/ProgressOverlay.vue';

export default defineComponent({
    name: 'App',
    components: { NavbarTop, NavbarBottom, ProgressOverlay },
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
