<template>
    <!-- The Navbar -->
    <!-- using a fixed top navbar, see https://bulma.io/documentation/components/navbar/#fixed-navbar -->
    <nav
        class="navbar is-fixed-top"
        role="navigation"
        aria-label="main navigation"
    >
        <div class="navbar-brand">
            <a class="navbar-item" href="#">
                <!-- HINT: Provide explicit height and widht as an optimization measure -->
                <img src="../assets/logo.png" width="28" height="28" />
                <span class="tag is-danger">beta</span>
            </a>

            <!-- The Navbar burger -->
            <a
                @click="toggleBurger"
                role="button"
                class="navbar-burger"
                aria-label="menu"
                aria-expanded="false"
                data-target="navbarAppMenu"
                v-bind:class="{ 'is-active': activator }"
            >
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
                <span aria-hidden="true"></span>
            </a>
        </div>

        <div
            id="navbarAppMenu"
            class="navbar-menu"
            v-bind:class="{ 'is-active': activator }"
        >
            <div class="navbar-start">
                <router-link @click="toggleBurger" class="navbar-item" to="/"
                    >Home</router-link
                >
                <router-link
                    @click="toggleBurger"
                    class="navbar-item"
                    to="/play"
                    >Play</router-link
                >
                <router-link
                    @click="toggleBurger"
                    class="navbar-item"
                    to="/about"
                    >About</router-link
                >
                <router-link
                    @click="toggleBurger"
                    class="navbar-item"
                    to="/development"
                    >Development</router-link
                >
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
