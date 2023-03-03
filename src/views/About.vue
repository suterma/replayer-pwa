<template v-once>
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

            <p class="">
                <a
                    href="https://replayer.app/en/documentation/keyboard-shortcuts"
                    alt="Link to the Replayer app keyboard shortcuts"
                    target="_blank"
                    >Keyboard shortcuts...</a
                >.
            </p>
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
        <CollapsiblePanel>
            <template #caption><h1 class="title is-3">API Demos</h1></template>
            <div class="contentx">
                <div class="block">
                    <h3 class="title is-5 mt-5">Track API Demo</h3>
                    <div class="content">
                        <ul>
                            <li>
                                <a
                                    href="./#/play?media=https://lib.replayer.app/your-light-by-lidija-roos.mp3&title=Your+Light&album=Not+For+Sale&artist=Lidija+Roos&0.0=Intro&17.2=Verse+1&33.98=Verse+1b&49.21=Refrain&64.87=Verse+2&82.4=Verse+2b&100.89=Refrain&112.88=Refrain+Repeat&129.65=Brigde+%2B+Solo&149.86=Refrain+Reprise&161.86=Verse+3b&178.46=Refrain+Variations&224.51=Fade+Out"
                                    target="_blank"
                                >
                                    MP3 media, Your Light by Lidija Roos</a
                                >
                            </li>
                            <li>
                                <a
                                    href="./#/edit?media=https://lib.replayer.app/your-light-by-lidija-roos.mp3&title=Your+Light&album=Not+For+Sale&artist=Lidija+Roos&0.0=Intro&17.2=Verse+1&33.98=Verse+1b&49.21=Refrain&64.87=Verse+2&82.4=Verse+2b&100.89=Refrain&112.88=Refrain+Repeat&129.65=Brigde+%2B+Solo&149.86=Refrain+Reprise&161.86=Verse+3b&178.46=Refrain+Variations&224.51=Fade+Out"
                                    target="_blank"
                                >
                                    MP3 media, Your Light by Lidija Roos (Edit
                                    Mode)</a
                                >
                            </li>
                            <li>
                                <a
                                    href="./#/play?media=https://lib.replayer.app/as-a-child-by-lidja-roos.aiff&title=As+A+Child+(AIFF)&album=Not+For+Sale&artist=Lidija+Roos&0.0="
                                    target="_blank"
                                >
                                    AIFF media, with only 1 cue</a
                                >
                            </li>
                            <li>
                                <a
                                    href="./#/play?media=https://lib.replayer.app/decisions-by-lidija-roos.ogg"
                                    target="_blank"
                                >
                                    OGG Vorbis media, without metadata</a
                                >
                            </li>
                            <li>
                                <a
                                    href="./#/play?media=https://lib.replayer.app/eyes-have-not-seen-by-lidija-roos.flac&title=Eyes+Have+Not+Seen&album=Not+For+Sale&artist=Lidija+Roos&0.0="
                                    target="_blank"
                                >
                                    FLAC media</a
                                >
                            </li>
                            <li>
                                <a
                                    href="./#/play?media=https://lib.replayer.app/psalm-4-38-by-lidija-roos.wav&title=Psalm+4.38+(WAV)&album=Not+For+Sale&artist=Lidija+Roos&0.0="
                                    target="_blank"
                                >
                                    WAV media</a
                                >
                            </li>
                            <li>
                                <a
                                    href="./#/play?media=https://lib.replayer.app/the-gift-by-lidija-roos.m4a&title=The+Gift+(AAC)&album=Not+For+Sale&artist=Lidija+Roos&0.0="
                                    target="_blank"
                                >
                                    AAC media</a
                                >
                            </li>
                        </ul>
                    </div>
                </div>
                <div class="block">
                    <h3 class="title is-5">Package API Demo</h3>
                    <div class="content">
                        <ul>
                            <li>
                                <a
                                    href="./#/play?package=https://lib.replayer.app/demo-compilation-featuring-lidija-roos.rez"
                                    target="_blank"
                                >
                                    ZIP (.rez) compressed package, with 1
                                    track</a
                                >
                            </li>
                            <li>
                                <a
                                    href="./#/play?package=https://lib.replayer.app/Demo%20Compilation%20featuring%20Lidija%20Roos%20%28online%20resources%20of%20multiple%20types%29.rex"
                                    target="_blank"
                                >
                                    XML (.rex) package, with 5 online tracks</a
                                >
                            </li>
                            <li>
                                <a
                                    href="./#/play?package=https://lib.replayer.app/Test-Compilation%20featuring%20Lidija%20Roos%20%28WAV%20files%20in%20various%20sizes%29.rez"
                                    target="_blank"
                                >
                                    Large ZIP (.rez) package (115MB), with WAV
                                    files of various sizes</a
                                >
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </CollapsiblePanel>
        <hr />

        <CollapsiblePanel>
            <template #caption><h1 class="title">Credits</h1></template>
            <div class="content">
                <ul>
                    <li>
                        <a href="https://vuejs.org/" target="_blank">Vue.js</a>,
                        the progressive JavaScript framework. (Released under
                        the MIT License, Copyright © 2014-2021 Evan You)
                    </li>
                    <li>
                        <a href="https://vuex.vuejs.org/" target="_blank"
                            >Vuex</a
                        >, a state management pattern + library for Vue.js
                        applications. (Released under the MIT License, by the
                        vuejs team)
                    </li>
                    <li>
                        <a href="https://router.vuejs.org/" target="_blank"
                            >Vue Router</a
                        >, a the official router for Vue.js. (Released under the
                        MIT License, by the vuejs team)
                    </li>
                    <li>
                        <a
                            href="https://github.com/yyx990803/register-service-worker"
                            target="_blank"
                            >register-service-worker</a
                        >, a script to simplify service worker registration with
                        hooks for common events. (Released under the MIT
                        License, by Evan You)
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
                        <a
                            href="https://realfavicongenerator.net"
                            target="_blank"
                            >RealFaviconGenerator </a
                        >Favicon Generator. For real. (free to use)
                    </li>
                    <li>
                        <a href="https://stuk.github.io/jszip/" target="_blank"
                            >JSZip </a
                        >JSZip is a javascript library for creating, reading and
                        editing .zip files, with a lovely and simple API.
                        (Released under the MIT License, by Stuart Knightley)
                    </li>
                    <li>
                        <a
                            href="https://github.com/Leonidas-from-XIV/node-xml2js"
                            target="_blank"
                            >node-xml2js </a
                        >Simple XML to JavaScript object converter. (Released
                        under the MIT License, by Marek Kubica)
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
                        <a href="https://bulma.io/" target="_blank">Bulma</a>,
                        the modern CSS framework that just works. (Released
                        under the MIT License, by Jeremy Thomas)
                    </li>
                    <li>
                        <a
                            href="https://jenil.github.io/bulmaswatch/"
                            target="_blank"
                            >Bulmaswatch</a
                        >, free themes for Bulma. (Released under the MIT
                        License, by Jenil Gogari)
                    </li>
                    <li>
                        <a
                            href="https://github.com/suterma/bulma-print"
                            target="_blank"
                            >bulma-print</a
                        >, extends the Bulma CSS framework with additional
                        classes and styles suitable for printing. (Released
                        under the MIT License, by Marcel Suter)
                    </li>
                    <li>
                        <a
                            href="https://github.com/joeferner/node-bplist-parser"
                            target="_blank"
                            >bplist-parser</a
                        >, a binary Mac OS X Plist (property list) parser.
                        (Released under the MIT License, by Joe Ferner)
                    </li>
                    <li>
                        <a
                            href="https://github.com/suterma/node-NSKeyedUnarchiver-LivePlayback"
                            target="_blank"
                            >node-nskeyedunarchiver-liveplayback</a
                        >, a simple NSKeyedUnarchiver in Javascript, to
                        unarchive iOS property lists. (Released under the MIT
                        License, by Marcel Suter)
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
                        >, for the creation of RFC4122 UUIDs. (Released under
                        the MIT License)
                    </li>
                    <li>
                        <a
                            href="https://github.com/shentao/vue-global-events"
                            target="_blank"
                            >vue-global-events</a
                        >, add shortcuts by listening to events on the document,
                        anywhere. (Released under the MIT License, by Damian
                        Dulisz)
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
                        implemented with IndexedDB. (Released under the MIT
                        License, by Jake Archibald)
                    </li>
                    <li>
                        <a
                            href="https://materialdesignicons.com/"
                            target="_blank"
                            >Material Design Icons</a
                        >, the original. Following Google's Material Design
                        guidelines for system icons. (Icons released under the
                        Apache 2.0 License, by pictogrammers.com)
                    </li>
                    <li>
                        <a
                            href="https://github.com/richtr/NoSleep.js"
                            target="_blank"
                            >NoSleep.js </a
                        >, wake lock in all Android and iOS web browsers.
                        (Released under the MIT License, by Rich Tibbett)
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
                        Editor lets you generate maskable PWA icons. (free to
                        use, by Tiger Oakes)
                    </li>
                    <li>
                        <a
                            href="https://github.com/andymark-by/click-outside-vue3"
                            target="_blank"
                        >
                            click-outside-vue3 </a
                        >, a vue3 directive to react on clicks outside an
                        element. (Released under the MIT License, by Andy Mark)
                    </li>
                    <li>
                        <a href="https://jestjs.io/" target="_blank"> Jest</a>,
                        a delightful JavaScript Testing Framework. (Released
                        under the MIT License, by Facebook)
                    </li>
                    <li>
                        <a
                            href="https://github.com/jest-community/jest-junit"
                            target="_blank"
                        >
                            jest-junit</a
                        >, a Jest reporter that creates compatible junit xml
                        files. (Released under the MIT License, by the jest
                        community)
                    </li>
                    <li>
                        <a
                            href="https://github.com/rlemaigre/vue3-promise-dialog"
                            target="_blank"
                        >
                            vue3-promise-dialog</a
                        >, dialogs meet promises in Vue 3! (Released under the
                        MIT License, by Régis Lemaigre)
                    </li>
                    <li>
                        <a
                            href="https://github.com/Simolation/vue-hotkey"
                            target="_blank"
                        >
                            vue-hotkey</a
                        >, a Vue 3 keyboard shortcut library (Released under the
                        MIT License, by Simon Osterlehner)
                    </li>
                    <li>
                        <a href="https://vueuse.org/" target="_blank"> VueUse</a
                        >, a Collection of essential Vue Composition Utilities
                        (Released under the MIT License, by the VueUse team)
                    </li>
                    <li>
                        <a
                            href="https://github.com/lodash/lodash/tree/4.0.8-npm-packages/lodash.debounce"
                            target="_blank"
                        >
                            lodash.debounce</a
                        >, rhe lodash method _.debounce exported as a Node.js
                        module. (Released under the MIT License, by the Lodash
                        team)
                    </li>
                    <li>
                        <a
                            href="https://github.com/focus-trap/focus-trap"
                            target="_blank"
                        >
                            focus-trap</a
                        >, trap focus within a DOM node. (Released under the MIT
                        License, by Stefan Cameron)
                    </li>
                    <li>
                        <a
                            href="https://github.com/slipmatio/control-knob"
                            target="_blank"
                            >control-knob</a
                        >, a fully customizable rotary control knob component
                        for Vue (Released under the MIT License, by Ville
                        Säävuori).
                    </li>
                    <li>
                        <a
                            href="https://github.com/focus-trap/focus-trap"
                            target="_blank"
                            >focus-trap</a
                        >, trap focus within a DOM node. (Released under the MIT
                        License, by Marais Rossouw).
                    </li>
                    <li>
                        <a
                            href="https://github.com/Wikiki/bulma-slider"
                            target="_blank"
                        >
                            bulma-slider</a
                        >, Bulma's extension to display sliders. (Released under
                        the MIT License, by Wikiki. Adapted by Marcel Suter).
                    </li>
                    <li>
                        <a
                            href="https://github.com/SortableJS/vue.draggable.next"
                            target="_blank"
                        >
                            vue.draggable.next</a
                        >, Vue component allowing drag-and-drop and
                        synchronization with a view model array. (Released under
                        the MIT License, by the sortable.js team).
                    </li>
                    <li>
                        Replayer has been granted a free agent for an
                        <a
                            href="https://azure.microsoft.com/en-us/products/devops/pipelines"
                            target="_blank"
                        >
                            Azure pipeline</a
                        >, to automatically build and deploy the application.
                        (Provided for free by the Microsoft Azure team). Read
                        more on my
                        <a
                            href="https://qrys.ch/how-to-build-and-deploy-a-vue3-app-from-a-github-repo-to-a-domain-using-azure-pipelines/"
                            target="_blank"
                        >
                            Blog about how to continuously build and deploy a
                            vue3 app, from a GitHub repo, using Azure
                            Pipelines</a
                        >.
                    </li>
                    <li>
                        Music from the Album "Not For Sale" by Lidija Roos
                        (Released to the public, by Lidija Roos)
                    </li>
                    <li>
                        <a
                            href="https://github.com/cypress-io/cypress"
                            target="_blank"
                        >
                            Cypress</a
                        >, fast, easy and reliable testing for anything that
                        runs in a browser. (Released under the MIT License, by
                        the cypress-io team).
                    </li>
                    <li>
                        <a
                            href="https://github.com/4teamwork/cypress-drag-drop"
                            target="_blank"
                        >
                            cypress-drag-drop</a
                        >, a Cypress child command for drag'n'drop support.
                        (Released under the GPLv3 License, by Fabasoft 4teamwork
                        AG).
                    </li>
                    <li>
                        <a
                            href="https://w3c.github.io/uievents/tools/key-event-viewer.html "
                            target="_blank"
                        >
                            Keyboard Event Viewer</a
                        >, a simple key event viewer. (Released by W3C).
                    </li>
                </ul>
            </div>
        </CollapsiblePanel>
        <hr />

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
                The source code is available on
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
import CollapsiblePanel from '@/components/CollapsiblePanel.vue';

/** An About view
 */
export default defineComponent({
    name: 'About',
    components: { WelcomeText, CollapsiblePanel },
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
