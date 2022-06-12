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
            <p
                title="App info"
                class="has-text-right is-italic has-opacity-half"
            >
                <small
                    ><span>App version: {{ version }} ({{ environment }}),</span
                    ><span> {{ git }}</span></small
                >
            </p>
            <hr />
        </div>

        <Experimental>
            <h1 class="title">Track API Demo</h1>
            <div class="content">
                <ul>
                    <li>
                        <a
                            href="./#/play?media=https://web.replayer.app/music/your-light-by-lidija-roos.mp3&title=Your+Light&album=Not+For+Sale&artist=Lidija+Roos&0.0=Intro&17.2=Verse+1&33.98=Verse+1b&49.21=Refrain&64.87=Verse+2&82.4=Verse+2b&100.89=Refrain&112.88=Refrain+Repeat&129.65=Brigde+%2B+Solo&149.86=Refrain+Reprise&161.86=Verse+3b&178.46=Refrain+Variations&224.51=Fade+Out"
                            target="_blank"
                        >
                            MP3 media, Your Light by Lidija Roos</a
                        >
                    </li>
                    <li>
                        <a
                            href="./#/edit?media=https://web.app/music/your-light-by-lidija-roos.mp3&title=Your+Light&album=Not+For+Sale&artist=Lidija+Roos&0.0=Intro&17.2=Verse+1&33.98=Verse+1b&49.21=Refrain&64.87=Verse+2&82.4=Verse+2b&100.89=Refrain&112.88=Refrain+Repeat&129.65=Brigde+%2B+Solo&149.86=Refrain+Reprise&161.86=Verse+3b&178.46=Refrain+Variations&224.51=Fade+Out"
                            target="_blank"
                        >
                            MP3 media, Your Light by Lidija Roos (Edit Mode)</a
                        >
                    </li>
                    <li>
                        <a
                            href="./#/play?media=https://web.replayer.app/music/as-a-child-by-lidja-roos.aiff&title=As+A+Child+(AIFF)&album=Not+For+Sale&artist=Lidija+Roos&0.0="
                            target="_blank"
                        >
                            AIFF media, with only 1 cue</a
                        >
                    </li>
                    <li>
                        <a
                            href="./#/play?media=https://web.replayer.app/music/decisions-by-lidija-roos.ogg"
                            target="_blank"
                        >
                            OGG Vorbis media, without metadata</a
                        >
                    </li>
                    <li>
                        <a
                            href="./#/play?media=https://web.replayer.app/music/eyes-have-not-seen-by-lidija-roos.flac&title=Eyes+Have+Not+Seen&album=Not+For+Sale&artist=Lidija+Roos&0.0="
                            target="_blank"
                        >
                            FLAC media</a
                        >
                    </li>
                    <li>
                        <a
                            href="./#/play?media=https://web.replayer.app/music/psalm-4-38-by-lidija-roos.wav&title=Psalm+4.38+(WAV)&album=Not+For+Sale&artist=Lidija+Roos&0.0="
                            target="_blank"
                        >
                            WAV media</a
                        >
                    </li>
                    <li>
                        <a
                            href="./#/play?media=https://web.replayer.app/music/the-gift-by-lidija-roos.m4a&title=The+Gift+(AAC)&album=Not+For+Sale&artist=Lidija+Roos&0.0="
                            target="_blank"
                        >
                            AAC media</a
                        >
                    </li>
                </ul>
            </div>
            <h1 class="title">Package API Demo</h1>
            <div class="content">
                <ul>
                    <li>
                        <a
                            href="./#/play?package=https://web.replayer.app/demo-compilation-featuring-lidija-roos.rez"
                            target="_blank"
                        >
                            ZIP (.rez) compressed package, with 1 track</a
                        >
                    </li>
                    <li>
                        <a
                            href="./#/play?package=https://web.replayer.app/demo-compilation-with-online-resources-of-multiple-types.rex"
                            target="_blank"
                        >
                            XML (.rex) package, with 5 tracks</a
                        >
                    </li>
                </ul>
            </div>
        </Experimental>

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
                        href="https://github.com/suterma/node-NSKeyedUnarchiver-LivePlayback"
                        target="_blank"
                        >node-nskeyedunarchiver-liveplayback</a
                    >, a simple NSKeyedUnarchiver in Javascript, to unarchive
                    iOS property lists. (Released under the MIT License, by
                    Marcel Suter)
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
                        href="https://github.com/richtr/NoSleep.js"
                        target="_blank"
                        >NoSleep.js </a
                    >, wake lock in all Android and iOS web browsers. (Released
                    under the MIT License, by Rich Tibbett)
                </li>
                <li>
                    The app icon is a derivative work from the
                    <a
                        href="https://commons.wikimedia.org/wiki/Category:Crystal_icons"
                        target="_blank"
                        >Crystal icon set</a
                    >. (Released under the LGPL License, by Everaldo Coelho)
                </li>
                <li>
                    <a href="https://maskable.app" target="_blank"
                        >Maskable.app</a
                    >
                    Editor lets you generate maskable PWA icons. (free to use,
                    by Tiger Oakes)
                </li>
                <li>
                    <a
                        href="https://github.com/andymark-by/click-outside-vue3"
                        target="_blank"
                    >
                        click-outside-vue3 </a
                    >, a vue3 directive to react on clicks outside an element.
                    (Released under the MIT License, by Andy Mark)
                </li>
                <li>
                    <a href="https://jestjs.io/" target="_blank"> Jest</a>, a
                    delightful JavaScript Testing Framework. (Released under the
                    MIT License, by Facebook)
                </li>
                <li>
                    <a
                        href="https://github.com/jest-community/jest-junit"
                        target="_blank"
                    >
                        jest-junit</a
                    >, a Jest reporter that creates compatible junit xml files.
                    (Released under the MIT License, by the jest community)
                </li>
                <li>
                    <a
                        href="https://github.com/rlemaigre/vue3-promise-dialog"
                        target="_blank"
                    >
                        vue3-promise-dialog</a
                    >, dialogs meet promises in Vue 3! (Released under the MIT
                    License, by Régis Lemaigre)
                </li>
                <li>
                    <a
                        href="https://github.com/Simolation/vue-hotkey"
                        target="_blank"
                    >
                        vue-hotkey</a
                    >, a Vue 3 keyboard shortcut library (Released under the MIT
                    License, by Simon Osterlehner)
                </li>
                <li>
                    <a href="https://vueuse.org/" target="_blank"> VueUse</a>, a
                    Collection of essential Vue Composition Utilities (Released
                    under the MIT License, by the VueUse team)
                </li>
                <li>
                    <a
                        href="https://github.com/slipmatio/control-knob"
                        target="_blank"
                        >Vue Control Knob</a
                    >, a Rotary control knob component for Vue 3 that behaves
                    like native audio app controls in Logic Pro or Ableton Live.
                    (Released under the MIT License, by Slipmat.io)
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
                <a
                    href="https://github.com/suterma/replayer-pwa/issues"
                    target="_blank"
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
import Experimental from '@/components/Experimental.vue';

/** An About view
 */
export default defineComponent({
    name: 'About',
    components: { WelcomeText, Experimental },
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
