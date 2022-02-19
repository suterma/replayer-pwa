<template>
    <!-- The Navbar -->

    <!-- For Laptop and larger, using a fixed top navbar, see https://bulma.io/documentation/components/navbar/#fixed-navbar -->
    <nav
        class="navbar is-fixed-top-laptop is-unselectable"
        role="navigation"
        aria-label="main navigation"
    >
        <!-- The brand -->
        <div class="navbar-brand">
            <a
                class="navbar-item"
                href="#"
                title="Replayer is a free, cue-based media player for rehearsals with playback music.
By the click of a button, Replayer starts to play at predefined times in the audio file."
            >
                <!-- HINT: Provide explicit height and widht as an optimization measure -->
                <img
                    src="../assets/logo.png"
                    width="28"
                    height="28"
                    alt="application icon"
                />
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
                    to="/track-player"
                    >Track-Player</router-link
                >
                <router-link
                    @click="toggleBurger"
                    class="navbar-item"
                    to="/edit"
                    >Edit</router-link
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
