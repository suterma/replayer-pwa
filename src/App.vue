<template>
    <NavbarTop />

    <!-- The page content -->
    <section class="section">
        <div id="content" class="content">
            <router-view />
        </div>
    </section>

    <!-- The progress modal -->
    <ProgressModal />
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import NavbarTop from '@/components/NavbarTop.vue';
import ProgressModal from '@/components/ProgressModal.vue';

export default defineComponent({
    name: 'App',
    components: { NavbarTop, ProgressModal },
});
</script>
