<!--
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
-->
<template v-once>
    <div>
        <div class="block">
            <ReplayerAd />
        </div>
        <div class="block">
            <p>
                <FooterLinks />
            </p>
            <p
                title="App info"
                class="has-text-right is-italic has-opacity-half"
            >
                <small
                    ><span>App version: {{ version }} &#8212; </span
                    ><span> {{ git }}</span></small
                >
            </p>
            <hr />
        </div>
        <CollapsiblePanel>
            <template #caption>
                <h1 id="api-demos" class="title is-3">API Demos</h1></template
            >
            <template #default="{ modelValue }">
                <Transition name="item-expand">
                    <div v-if="modelValue">
                        <div class="block">
                            <!-- NOTE: These links use the blank target, to actually cause a reload. Just changing the URL does not trigger a track/package API reload -->
                            <h2 class="title is-4 mt-4">Track API Demo</h2>
                            <h3 class="title is-5 mt-5">
                                Various media types (from the Replayer library)
                            </h3>
                            <div class="content">
                                <ul>
                                    <li>
                                        <a
                                            href="./#/play?media=https://lib.replayer.app/demo/your-light-by-lidija-roos.mp3&title=Your+Light&album=Not+For+Sale&artist=Lidija+Roos&0.0=Intro&17.2=Verse+1&33.98=Verse+1b&49.21=Refrain&64.87=Verse+2&82.4=Verse+2b&100.89=Refrain&112.88=Refrain+Repeat&129.65=Brigde+%2B+Solo&149.86=Refrain+Reprise&161.86=Verse+3b&178.46=Refrain+Variations&224.51=Fade+Out"
                                            target="_blank"
                                        >
                                            MP3 audio, Your Light by Lidija
                                            Roos</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/edit?media=https://lib.replayer.app/demo/your-light-by-lidija-roos.mp3&title=Your+Light&album=Not+For+Sale&artist=Lidija+Roos&0.0=Intro&17.2=Verse+1&33.98=Verse+1b&49.21=Refrain&64.87=Verse+2&82.4=Verse+2b&100.89=Refrain&112.88=Refrain+Repeat&129.65=Brigde+%2B+Solo&149.86=Refrain+Reprise&161.86=Verse+3b&178.46=Refrain+Variations&224.51=Fade+Out"
                                            target="_blank"
                                        >
                                            MP3 audio, Your Light by Lidija Roos
                                            (Edit Mode)</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?media=https://lib.replayer.app/demo/as-a-child-by-lidja-roos.aiff&title=As+A+Child+(AIFF)&album=Not+For+Sale&artist=Lidija+Roos&0.0="
                                            target="_blank"
                                        >
                                            AIFF audio, with only 1 cue</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?media=https://lib.replayer.app/demo/decisions-by-lidija-roos.ogg"
                                            target="_blank"
                                        >
                                            OGG Vorbis audio, without
                                            metadata</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?media=https://lib.replayer.app/demo/eyes-have-not-seen-by-lidija-roos.flac&title=Eyes+Have+Not+Seen&album=Not+For+Sale&artist=Lidija+Roos&0.0="
                                            target="_blank"
                                        >
                                            FLAC audio</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?media=https://lib.replayer.app/demo/psalm-4-38-by-lidija-roos.wav&title=Psalm+4.38+(WAV)&album=Not+For+Sale&artist=Lidija+Roos&0.0="
                                            target="_blank"
                                        >
                                            WAV audio</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?media=https://lib.replayer.app/demo/the-gift-by-lidija-roos.m4a&title=The+Gift+(AAC)&album=Not+For+Sale&artist=Lidija+Roos&0.0="
                                            target="_blank"
                                        >
                                            AAC audio</a
                                        >
                                    </li>

                                    <li>
                                        <a
                                            href="./#/play?media=https://lib.replayer.app/nasa-4k/13537_Apollo13ViewsMoon4K_YouTube4K.mp4&title=Apollo+13+Views+of+the+Moon+in+4K+(online,+715+MB)&album=https://svs.gsfc.nasa.gov/13537&artist=NASA's+Goddard+Space+Flight+Center&0.755=Intro&12.771=Sunrise&18.875=Lunar+terrain&39.065=Craters&65.374=Crater&83.432=Crater+2&96.431=Earth+rise&120.341=Trajectory&133.114=Full+moon+%26+outro"
                                            target="_blank"
                                        >
                                            MP4 video</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?media=https://lib.replayer.app/nasa-4k/2023_Moon_Phase_North_Up_YouTubeHD.webm&title=Moon+Phases+2023+(North+Up,+YouTubeHD)&album=&artist=NASA's+Scientific+Visualization+Studio&0.0=January&25.1=February&47.383=March&72.085=April&96.058=May&120.798=June&144.763=July&169.755=August&194.203=September&218.403=October&243.082=November&267.325=December"
                                            target="_blank"
                                        >
                                            WebM video</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?media=https://lib.replayer.app/nasa-4k/JPL-20170404-CASSINf-0001-1280x540.ogv&title=Cassini's+Grand+Finale(1280x540)&album=&artist=NASA/Jet+Propulsion+Laboratory-Caltech&0.0=Intro&46.9=Launch+and+Lift-Off&62.2=Arrival+at+Saturn&76.057=Arrival+at+Titian&117.128=The+last+assignment&166.273=Final+orbit"
                                            target="_blank"
                                        >
                                            Ogg Theora video</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?media=https://download-media.srf.ch/world/video/sayhi/2023/10/sayhi_20231003_145252_2069202_v_webcast_h264_q60.mp4&title=%23SayHi2023+-+Tanz-Tutorial+zu+%C2%ABMier+fl%C3%BCged+los%C2%BB+von+Remo+Forrer&album=Play+SRF+%23SayHi&artist=Joram+Weber+%26+Lisa+Perissinotto&7.283=Begr%C3%BCssung&32.419=Verse+1a+Tutorial&64.406=Verse+1a+Music&85.982=Verse+1b+Tutorial&112.7=Verse+1b+Music&130.262=Verse+1c+Tutorial&151.823=Verse+1c+Music&170.194=Chorus+Tutorial&190.142=Chorus+Music&209.938=2nd+Verse+Tutorial&232.837=2nd+Verse+Music"
                                            target="_blank"
                                        >
                                            SRF (MP3 video): #SayHi2023 -
                                            Tanz-Tutorial zu «Mier flüged los»
                                            von Remo Forrer</a
                                        >
                                    </li>

                                    <li>
                                        <a
                                            href="./#/play?media=https://lib.replayer.app/nasa-4k/13537_Apollo13ViewsMoon4K_YouTube4K.mp4&t=96.431"
                                            target="_blank"
                                        >
                                            MP4 video: at earth rise position
                                            (Credit: NASA's Goddard Space Flight
                                            Center)</a
                                        >
                                    </li>
                                </ul>
                            </div>
                            <h3 class="title is-5 mt-5">
                                Various media types (from other sources)
                            </h3>
                            <div class="content">
                                <ul>
                                    <li>
                                        <a
                                            href="./#/play?media=https://www.youtube.com/watch?v=tR9FAtxBxUU&title=F%C3%BCr+immer+uf+di&album=Jodelcover&artist=Jodelklub+Edelweiss&3.581=Intro&24.206=Uf+Mueter's+Seel&70.078=Es+Glas...&99.315=Jodel&123.036=Zyt+wo+mir+no+blyybt..."
                                            target="_blank"
                                        >
                                            YouTube video</a
                                        >
                                        Jodelklub Edelweiss yodeling Für Immer
                                        Uf Di (Patent Ochsner Cover)
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?media=https://www.youtube.com/watch?v=USetyquP_dU&title=Crawling+Back+To+You+(Tom+Petty+Cover)&album=TELEFUNKEN+Live+From+The+Lab&artist=Szlachetka&0.0=Announcement&10.455=Piano+intro&63.697=Intro+Part+II&79.605=Verse+&112.158=Verse+2&143.779=Bridge&162.299=Instrumental&263.228=Verse+3&295.321=Refrain+(variation)&326.042=Guitar+solo&445.456=Refrain&477.8=Outro+%2B+Credits"
                                            target="_blank"
                                        >
                                            YouTube video</a
                                        >
                                        Szlachetka playing Crawling Back To You
                                        (Tom Petty Cover)
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?media=https://previews.cambridge-mt.com/ImAlright_Full_Preview.mp3&title=I'm+Allright&album='Mixing+Secrets'+Free+Multitrack+Download+Library+by+Mike+Senior&artist=Angels+in+Amplifiers"
                                            target="_blank"
                                        >
                                            Angels In Amplifiers, Full Preview
                                            Mix</a
                                        >, from the 'Mixing Secrets' Free
                                        Multitrack Download Library by Mike
                                        Senior - has no CORS headers
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?media=https://lib.replayer.app/demo/Lidja%20Roos%20-%20Not%20For%20Sale%20-%20Booklet.pdf&title=Not%20for%20Sale%20Booklet"
                                            target="_blank"
                                        >
                                            CD Booklet (PDF)</a
                                        >, from the Album "Not for Sale" by
                                        Lidija Roos
                                    </li>
                                </ul>
                            </div>
                            <h3 class="title is-5 mt-5">
                                Various storage vendors
                            </h3>
                            <div class="content">
                                <ul>
                                    <li>
                                        <a
                                            href="./#/play?media=https%3A%2F%2Fdl.dropboxusercontent.com%2Fscl%2Ffi%2Flh4jw17lw5s0i847ogvzw%2Fyour-light-by-lidija-roos.mp3%3Frlkey%3Dznfw0etm3jqlne5q8lmr6a59l&title=Your+Light&album=Not+For+Sale&artist=Lidija+Roos&17.5=Verse"
                                            target="_blank"
                                        >
                                            MP3 on Dropbox</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?media=https%3A%2F%2Fdrive.google.com%2Fuc%3Fexport%3Ddownload%26id%3D12pLN-awFxp1r-t5lBWNqCGFXoaCKI_eJ&title=Your+Light&album=Not+For+Sale&artist=Lidija+Roos&17.5=Verse"
                                            target="_blank"
                                        >
                                            MP3 on Google Drive</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?media=https%3A%2F%2Fonedrive.live.com%2Fdownload%3Fresid%3D3DB905138F2203AA%25211420%26authkey%3D!ABKQ8jbDgCvjopg&title=Your+Light&album=Not+For+Sale&artist=Lidija+Roos&17.5=Verse"
                                            target="_blank"
                                        >
                                            MP3 on Microsoft OneDrive</a
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
                                            href="./#/play?package=https://lib.replayer.app/demo/demo-compilation-featuring-lidija-roos.zip"
                                            target="_blank"
                                        >
                                            ZIP (.zip) compressed package, with
                                            1 track</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?package=https://lib.replayer.app/demo/Demo%20Compilation%20featuring%20Lidija%20Roos%20%28online%20resources%20of%20multiple%20types%29.xml"
                                            target="_blank"
                                        >
                                            XML (.xml) package, with 5 online
                                            tracks</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?package=https://lib.replayer.app/demo/Test-Compilation%20featuring%20Lidija%20Roos%20%28WAV%20files%20in%20various%20sizes%29.zip"
                                            target="_blank"
                                        >
                                            Large ZIP (.zip) package (115MB),
                                            with WAV files of various sizes</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?package=https://lib.replayer.app/nasa-4k/13537_Apollo13ViewsMoon4K_YouTube4K.xml"
                                            target="_blank"
                                        >
                                            Small XML (.xml) package (4k), with
                                            one large linked video (.mp4, 715MB)
                                            and a small linked text file.</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?package=https://lib.replayer.app/nasa-4k/Moonlight%20%28Clair%20de%20Lune%29.zip"
                                            target="_blank"
                                        >
                                            Large ZIP (.zip) package (327MB),
                                            with one large included video (.mp4,
                                            327MB) and a small included text
                                            file.</a
                                        >
                                    </li>
                                    <li>
                                        <a
                                            href="./#/play?package=https://lib.replayer.app/test/audio-test-tracks.zip"
                                            target="_blank"
                                        >
                                            Small ZIP (.zip) package (28k), with
                                            22 audio test tracks, including sine
                                            chirps and noise.</a
                                        >
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </Transition>
            </template>
        </CollapsiblePanel>
        <hr />

        <CollapsiblePanel expanded>
            <template #caption
                ><h1 id="credits" class="title">Credits</h1></template
            >
            <div class="content">
                <ul>
                    <li>
                        <a href="https://vuejs.org/" target="_blank">Vue.js</a>,
                        the progressive JavaScript framework. (Released under
                        the MIT License, Copyright © 2014-2021 Evan You)
                    </li>
                    <li>
                        <a href="https://router.vuejs.org/" target="_blank"
                            >Vue Router</a
                        >, a the official router for Vue.js. (Released under the
                        MIT License, by the vuejs team)
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
                            href="https://github.com/localForage/localForage"
                            target="_blank"
                            >localForage</a
                        >, a fast and simple storage library for JavaScript.
                        (Released under the Apache-2.0 license, by Matthew Riley
                        MacPherson and Thodoris Greasidis)
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
                        <a href="https://lodash.com/" target="_blank"> Lodash</a
                        >, a modern JavaScript utility library. (Released under
                        the MIT License, by the Lodash team)
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
                        Replayer has been granted a free account on
                        <a
                            href="https://www.browserstack.com/live"
                            target="_blank"
                        >
                            BrowserStack</a
                        >, for live app testing.
                    </li>
                    <li>
                        Music from the Album "Not For Sale" by Lidija Roos
                        (Released to the public, by Lidija Roos)
                    </li>
                    <li>
                        Video content from the echo conference. (Released under
                        the MIT License, by
                        <a href="http://j.hn/">John Dyer</a> & Nathan Smith)
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
                            href="https://w3c.github.io/uievents/tools/key-event-viewer.html"
                            target="_blank"
                        >
                            Keyboard Event Viewer</a
                        >, a simple key event viewer. (Released by W3C).
                    </li>
                    <li>
                        <a
                            href="https://github.com/suterma/vue-audio-level-meter"
                            target="_blank"
                        >
                            vue-audio-level-meter</a
                        >, a simple audio (peak) level meter for Vue.js.
                        (Released under the MIT License, by Marcel Suter)
                    </li>
                    <li>
                        <a
                            href="https://github.com/omichelsen/compare-versions"
                            target="_blank"
                        >
                            compare-versions</a
                        >, compare semver version strings to find greater, equal
                        or lesser. (Released under the MIT License, by Ole Bjørn
                        Michelsen)
                    </li>
                    <li>
                        <a
                            href="https://vitaly-t.github.io/sub-events/"
                            target="_blank"
                        >
                            sub-events</a
                        >, Lightweight, strongly-typed events, with monitored
                        subscriptions. (Released under the MIT License, by
                        Vitaly Tomilov)
                    </li>
                    <li>
                        <a
                            href="https://vue-youtube.github.io/docs/"
                            target="_blank"
                        >
                            VueYoutube</a
                        >, Integrate the YouTube Iframe Player into your Vue 2/3
                        app. (Released under the MIT License, by Techassi)
                    </li>
                    <li>
                        <a
                            href="https://github.com/davidmyersdev/vite-plugin-node-polyfills"
                            target="_blank"
                        >
                            vite-plugin-node-polyfills</a
                        >, a Vite plugin to polyfill Node's Core Modules for
                        browser environments. (Released under the MIT License,
                        by David Myers)
                    </li>
                    <li>
                        <a
                            href="https://vite-pwa-org.netlify.app/"
                            target="_blank"
                        >
                            PWA Vite Plugin</a
                        >, PWA integrations for Vite and the ecosystem.
                        (Released under the MIT License, by the vite-pwa team)
                    </li>
                    <li>
                        <a
                            href="https://github.com/btd/rollup-plugin-visualizer"
                            target="_blank"
                            >Rollup Plugin Visualizer</a
                        >, visualize and analyze your Rollup bundle to see which
                        modules are taking up space. (Released under the MIT
                        License, by Denis Bardadym)
                    </li>
                    <li>
                        <a
                            href="https://github.com/focus-trap/focus-trap"
                            target="_blank"
                            >focus-trap</a
                        >, trap focus within a DOM node. (Released under the MIT
                        License, by Stefan Cameron)
                    </li>
                    <li>
                        <a
                            href="https://github.com/CreativeBulma/bulma-tooltip"
                            target="_blank"
                            >bulma-tooltip </a
                        >, easily display a tooltip. (Released under the MIT
                        License, by CreativeBulma)
                    </li>
                    <li>
                        <a href="https://pdfobject.com/" target="_blank"
                            >PDFObject </a
                        >, a lightweight JavaScript utility for dynamically
                        embedding PDFs in HTML documents. (Released under an
                        MIT-style License, by Philip Hutchison)
                    </li>
                    <li>
                        <a
                            href="https://mozilla.github.io/pdf.js/"
                            target="_blank"
                            >PDF.js</a
                        >, a general-purpose, web standards-based platform for
                        parsing and rendering PDFs. (Released under the Apache
                        License 2.0, by Mozilla and individual contributors)
                    </li>
                    <li>
                        <a href="https://typedoc.org/" target="_blank"
                            >TypeDoc</a
                        >, a documentation generator for TypeScript projects.
                        (Released under the Apache-2.0 license, by the
                        TypeStrong team)
                    </li>
                    <li>
                        <a
                            href="https://github.com/fullstack-build/tslog"
                            target="_blank"
                            >tslog</a
                        >, a beautiful logging experience for TypeScript and
                        JavaScript. (Released under the MIT License, by
                        fullstack-build)
                    </li>
                    <li>
                        <a
                            href="https://github.com/sindresorhus/slugify"
                            target="_blank"
                            >slugify</a
                        >, useful for URLs, filenames, and IDs. (Released under
                        the MIT License, by Sindre Sorhus)
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
                    >GNU Affero General Public License v3.0</a
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
import FooterLinks from '@/components/FooterLinks.vue';
import CollapsiblePanel from '@/components/CollapsiblePanel.vue';
import ReplayerAd from '@/components/ReplayerAd.vue';

/** An About view
 */
export default defineComponent({
    name: 'AboutView',
    components: { FooterLinks, CollapsiblePanel, ReplayerAd },
    computed: {
        version(): string {
            return '' + import.meta.env.VITE_APP_VERSION;
        },

        git(): string {
            return 'git version: ' + import.meta.env.VITE_APP_GIT_VERSION;
        },
    },
});
</script>
