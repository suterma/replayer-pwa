<template>
    <NavbarTop />

    <!-- The page content -->
    <section class="section">
        <div id="content" class="content">
            <router-view />
        </div>
    </section>

    <NavbarBottom />
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import NavbarTop from '@/components/NavbarTop.vue'
import NavbarBottom from '@/components/NavbarBottom.vue'

export default defineComponent({
    name: 'App',
    components: { NavbarTop, NavbarBottom },
})
</script>

<style lang="scss">
#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>
