<template>
    <!-- The Navbar -->
    <!-- using a fixed navbar, see https://bulma.io/documentation/components/navbar/#fixed-navbar -->
    <nav
        class="navbar is-fixed-top is-light"
        role="navigation"
        aria-label="main navigation"
    >
        <div class="navbar-brand">
            <a class="navbar-item" href="https://replayer.ch">
                <!-- HINT: Provide explicit height and widht as an optimization measure -->
                <img src="./assets/logo.png" width="28" height="28" />
            </a>

            <!-- The Navbar burger -->
            <!-- //TODO implement the burger function, see https://bulma.io/documentation/components/navbar/#navbar-menu -->
            <a
                role="button"
                class="navbar-burger"
                aria-label="menu"
                aria-expanded="false"
                data-target="navbarAppMenu"
            >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <div id="navbarAppMenu" class="navbar-menu is-active">
            <div class="navbar-start">
                <router-link class="navbar-item" to="/">Home</router-link>
                <router-link class="navbar-item" to="/about">About</router-link>
                <router-link class="navbar-item" to="/development"
                    >Development</router-link
                >
            </div>

            <!-- //TODO later use these as style selector -->
            <!-- <div class="navbar-end">
                <div class="navbar-item">
                    <div class="buttons">
                        <a class="button is-primary"> Play </a>
                        <a class="button is-light">Edit</a>
                    </div>
                </div>
            </div> -->
        </div>
    </nav>

    <!-- The page content -->
    <section class="section">
        <div id="content" class="content">
            <router-view />
        </div>
    </section>

    <!-- The footer (as fixed navbar) -->
    <nav
        class="navbar is-fixed-bottom is-light"
        role="footer"
        aria-label="footer"
    >
        <div class="navbar-start">
            <div class="navbar-item">
                <div class="field">
                    <ProgressText />
                </div>
            </div>
        </div>
        <div class="navbar-end">
            <div class="navbar-item">
                <div class="field">
                    Replayer by
                    <a href="https://marcelsuter.ch">Marcel Suter</a>
                </div>
            </div>
        </div>
    </nav>
</template>
<script lang="ts">
import { defineComponent } from 'vue'
import ProgressText from '@/components/ProgressText.vue'

export default defineComponent({
    name: 'App',
    components: { ProgressText },
})
</script>

<style lang="scss">
#app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}
</style>
