<template>
    <div class="container">
        <h1 class="title">About</h1>
        <div class="content">
            <p>
                <a href="https://replayer.app" target="_blank">Replayer</a> is a
                free, cue-based media player for rehearsals with playback music.
                By the click of a button, Replayer starts to play at predefined
                times in the audio file.
            </p>
            <WelcomeText />
            <p title="App info" class="has-text-right is-italic">
                <small
                    >App version: {{ version }} ({{ environment }}),
                    {{ git }}</small
                >
            </p>

            <hr />
        </div>
        <h1 class="title">Demo</h1>
        <div class="content">
            <ul>
                <li>
                    <a
                        href="/#/play/demo-compilation-featuring-lidija-roos.rez"
                        target="_blank"
                        >Demo package with a compilation featuring Lidija
                        Roos</a
                    ><br />
                    A REZ Package containing an REX compilation with 2 tracks
                    and matching mp3 files.
                </li>
                <li>
                    <a
                        href="/#/play/Demo%20Adonia%20Junior%2021.bplist"
                        target="_blank"
                        >Demo Binary Property List compilation (as from the
                        LivePlayback app)</a
                    ><br />
                    A bplist file with 21 tracks (no media files).
                </li>
            </ul>
        </div>
        <h1 class="title">Credits</h1>
        <div class="content">
            <p>This project uses</p>
            <ul>
                <li>
                    <a href="https://vuejs.org/" target="_blank">Vue.js</a>, the
                    progressive JavaScript framework. (Released under the MIT
                    License, Copyright © 2014-2021 Evan You)
                </li>
                <li>
                    <a href="https://vuex.vuejs.org/" target="_blank">Vuex</a>,
                    a state management pattern + library for Vue.js
                    applications. (Released under the MIT License, by the vuejs
                    team)
                </li>
                <li>
                    <a href="https://router.vuejs.org/" target="_blank"
                        >Vue Router</a
                    >, a the official router for Vue.js. (Released under the MIT
                    License, by the vuejs team)
                </li>
                <li>
                    <a
                        href="https://github.com/yyx990803/register-service-worker"
                        target="_blank"
                        >register-service-worker</a
                    >, a script to simplify service worker registration with
                    hooks for common events. (Released under the MIT License, by
                    Evan You)
                </li>
                <li>
                    <a
                        href="https://github.com/zloirock/core-js"
                        target="_blank"
                        >core-js</a
                    >, a modular standard library for JavaScript. (Released
                    under the MIT License, by Denis Pushkarev)
                </li>
                <li>
                    <a href="https://realfavicongenerator.net" target="_blank"
                        >RealFaviconGenerator </a
                    >Favicon Generator. For real. (free to use)
                </li>
                <li>
                    <a href="https://stuk.github.io/jszip/" target="_blank"
                        >JSZip </a
                    >JSZip is a javascript library for creating, reading and
                    editing .zip files, with a lovely and simple API. (Released
                    under the MIT License, by Stuart Knightley)
                </li>
                <li>
                    <a
                        href="https://github.com/paanSinghCoder/OutFrontJS"
                        target="_blank"
                        >OutFrontJS </a
                    >Console for mobile browsers. (Released under the MIT
                    License, by Gaurav Singh)
                </li>
                <li>
                    <a
                        href="https://github.com/Leonidas-from-XIV/node-xml2js"
                        target="_blank"
                        >node-xml2js </a
                    >Simple XML to JavaScript object converter. (Released under
                    the MIT License, by Marek Kubica)
                </li>
                <li>
                    <a
                        href="https://vuejsexamples.com/html5-basic-audio-player-with-vue-js/"
                        target="_blank"
                        >HTML5 Basic Audio Player with vue.js</a
                    >
                    Example code (modified)
                </li>
                <li>
                    <a href="https://bulma.io/" target="_blank">Bulma</a>, the
                    modern CSS framework that just works. (Released under the
                    MIT License, by Jeremy Thomas)
                </li>
                <li>
                    <a
                        href="https://jenil.github.io/bulmaswatch/"
                        target="_blank"
                        >Bulmaswatch</a
                    >, free themes for Bulma. (Released under the MIT License,
                    by Jenil Gogari)
                </li>
                <li>
                    <a
                        href="https://github.com/joeferner/node-bplist-parser"
                        target="_blank"
                        >bplist-parser</a
                    >, a binary Mac OS X Plist (property list) parser. (Released
                    under the MIT License, by Joe Ferner)
                </li>
                <li>
                    <a
                        href="https://github.com/eligrey/FileSaver.js"
                        target="_blank"
                        >FileSaver.js</a
                    >, the solution to saving files on the client-side.
                    (Released under the MIT License, by Eli Grey)
                </li>
                <li>
                    <a href="https://github.com/uuidjs/uuid" target="_blank"
                        >uuid</a
                    >, for the creation of RFC4122 UUIDs. (Released under the
                    MIT License)
                </li>
                <li>
                    <a
                        href="https://github.com/shentao/vue-global-events"
                        target="_blank"
                        >vue-global-events</a
                    >, add shortcuts by listening to events on the document,
                    anywhere. (Released under the MIT License, by Damian Dulisz)
                </li>
                <li>
                    <a
                        href="https://github.com/rigor789/vue-scrollto#readme"
                        target="_blank"
                        >vue-scrollto</a
                    >, scrolling to elements was never this easy. (Released
                    under the MIT License, by Igor Randjelovic)
                </li>
                <li>
                    <a
                        href="https://github.com/jakearchibald/idb-keyval"
                        target="_blank"
                        >IDB-Keyval</a
                    >, a super-simple-small promise-based keyval store
                    implemented with IndexedDB. (Released under the MIT License,
                    by Jake Archibald)
                </li>
                <li>
                    <a href="https://materialdesignicons.com/" target="_blank"
                        >Material Design Icons</a
                    >, the original. Following Google's Material Design
                    guidelines for system icons. (Icons released under the
                    Apache 2.0 License, by pictogrammers.com)
                </li>
                <li>
                    <a
                        href="https://github.com/craigrileyuk/vue3-slide-up-down"
                        target="_blank"
                        >vue3-slide-up-down </a
                    >, like jQuery's slideUp / slideDown, but for Vue 3!
                    (Released under the MIT License, by Craig Riley)
                </li>
                <li>
                    <a
                        href="https://github.com/goldfire/howler.js"
                        target="_blank"
                        >howler.js </a
                    >, an audio library for the modern web. (Released under the
                    MIT License, by James Simpson)
                </li>
            </ul>
        </div>
        <h1 class="title">License</h1>
        <div class="content">
            <p>
                Replayer is licensed to you under the
                <a
                    href="https://github.com/suterma/replayer-pwa/blob/main/LICENSE"
                    target="_blank"
                    >GNU General Public License v3.0</a
                >
                or any later version.
            </p>
            <p>
                The source code is availabe on
                <a
                    href="https://github.com/suterma/replayer-pwa"
                    target="_blank"
                    >GitHub</a
                >. To report an issue or submit a feature request, use the
                <a href="https://github.com/suterma/replayer-pwa/issues"
                    >issues</a
                >
                page on the GitHub repository.
            </p>
            <p>
                Created by
                <a href="https://marcelsuter.ch" target="_blank">Marcel Suter</a
                >.
            </p>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import WelcomeText from '@/components/WelcomeText.vue';

/** An About view
 */
export default defineComponent({
    name: 'About',
    components: { WelcomeText },
    computed: {
        version(): string {
            return '' + process.env.VUE_APP_VERSION;
        },

        environment(): string {
            return '' + process.env.NODE_ENV;
        },
        git(): string {
            return 'git version: ' + process.env.VUE_APP_GIT_VERSION;
        },
    },
});
</script>
