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
                <Hotkey :keys="['ctrl', 'p']" v-slot="{ clickRef }">
                    <router-link
                        title="Switch to play view [CTRL+P]"
                        @click="toggleBurger"
                        :ref="clickRef"
                        class="navbar-item"
                        to="/play"
                        >Play</router-link
                    >
                </Hotkey>
                <Hotkey :keys="['ctrl', 'e']" v-slot="{ clickRef }">
                    <router-link
                        title="Switch to edit view [CTRL+E]"
                        @click="toggleBurger"
                        :ref="clickRef"
                        class="navbar-item"
                        to="/edit"
                        >Edit</router-link
                    >
                </Hotkey>

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
                <Experimental>
                    <div class="navbar-item has-dropdown is-hoverable">
                        <a class="navbar-link"> Experimental </a>

                        <div class="navbar-dropdown">
                            <router-link
                                @click="toggleBurger"
                                class="navbar-item"
                                to="/development"
                                >Development
                            </router-link>
                            <router-link
                                @click="toggleBurger"
                                class="navbar-item"
                                to="/list"
                                >List</router-link
                            >
                            <router-link
                                @click="toggleBurger"
                                class="navbar-item"
                                to="/setlist"
                                >Setlist</router-link
                            >
                        </div>
                    </div>
                </Experimental>
            </div>
        </div>
    </nav>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Experimental from '@/components/Experimental.vue';
import { Hotkey } from '@simolation/vue-hotkey';

/** A top navbar for the application*/
export default defineComponent({
    name: 'NavbarTop',
    components: { Experimental, Hotkey },

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
