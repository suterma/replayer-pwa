<template>
    <!-- The Navbar -->

    <!-- For Mobiles, using a non-fixed top navbar, see https://bulma.io/documentation/components/navbar/#fixed-navbar -->
    <nav
        class="navbar is-unselectable"
        role="navigation"
        aria-label="main navigation"
    >
        <!-- The brand -->
        <div class="navbar-brand">
            <a class="navbar-item" href="#">
                <!-- HINT: Provide explicit height and widht as an optimization measure -->
                <img src="../assets/logo.png" width="28" height="28" />
            </a>

            <!-- The Navbar burger -->
            <a
                @click="toggleBurger"
                role="button"
                class="navbar-burger"
                aria-label="menu"
                aria-expanded="false"
                data-target="navbarMobileAppMenu"
                v-bind:class="{ 'is-active': activator }"
            >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <!-- The App menu -->
        <div
            id="navbarMobileAppMenu"
            class="navbar-menu"
            v-bind:class="{ 'is-active': activator }"
        >
            <div class="navbar-start">
                <router-link
                    @click="toggleBurger"
                    class="navbar-item"
                    to="/play"
                    >Play</router-link
                >
                <router-link
                    @click="toggleBurger"
                    class="navbar-item"
                    to="/settings"
                    >Settings</router-link
                >
                <router-link
                    @click="toggleBurger"
                    class="navbar-item"
                    to="/about"
                    >About</router-link
                >
                <router-link
                    @click="toggleBurger"
                    class="navbar-item has-text-danger"
                    to="/development"
                    >BETA
                </router-link>
            </div>
        </div>
    </nav>

    <!-- For Desktop, using a fixed top navbar, see https://bulma.io/documentation/components/navbar/#fixed-navbar -->
    <nav
        class="navbar is-fixed-top is-unselectable"
        role="navigation"
        aria-label="main navigation"
    >
        <!-- The brand -->
        <div class="navbar-brand">
            <a class="navbar-item" href="#">
                <!-- HINT: Provide explicit height and widht as an optimization measure -->
                <img src="../assets/logo.png" width="28" height="28" />
            </a>

            <!-- The Navbar burger -->
            <a
                @click="toggleBurger"
                role="button"
                class="navbar-burger"
                aria-label="menu"
                aria-expanded="false"
                data-target="navbarDesktopAppMenu"
                v-bind:class="{ 'is-active': activator }"
            >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <!-- The App menu -->
        <div
            id="navbarDesktopAppMenu"
            class="navbar-menu"
            v-bind:class="{ 'is-active': activator }"
        >
            <div class="navbar-start">
                <router-link
                    @click="toggleBurger"
                    class="navbar-item"
                    to="/play"
                    >Play</router-link
                >
                <router-link
                    @click="toggleBurger"
                    class="navbar-item"
                    to="/settings"
                    >Settings</router-link
                >
                <router-link
                    @click="toggleBurger"
                    class="navbar-item"
                    to="/about"
                    >About</router-link
                >
                <router-link
                    @click="toggleBurger"
                    class="navbar-item has-text-danger"
                    to="/development"
                    >BETA
                </router-link>
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

/** A top navbar for the application*/
export default defineComponent({
    name: 'NavbarTop',

    data() {
        return {
            msg: '',
            activator: false,
        };
    },
    methods: {
        toggleBurger() {
            this.activator = !this.activator;
            return this.activator;
        },
    },
});
</script>
