![License](https://img.shields.io/github/license/suterma/replayer-pwa.svg)
![GitHub All Releases](https://img.shields.io/github/downloads/suterma/replayer-pwa/total.svg)
![Release](https://img.shields.io/github/release/suterma/replayer-pwa.svg)
![Language](https://img.shields.io/github/languages/top/suterma/replayer-pwa.svg)
[![Build Status](https://dev.azure.com/suterma/replayer-pwa/_apis/build/status/suterma.replayer-pwa?branchName=main)](https://dev.azure.com/suterma/replayer-pwa/_build/latest?definitionId=1&branchName=main)

[Replayer](https://replayer.app/) is a free, cue-based media player for rehearsals with playback music.
By the click of a button, Replayer starts to play at predefined times in the audio or video file.

![Visual Functioning Overview](https://replayer.app/user/pages/06.blog/replayer-as-a-pwa-web-app/visual-function-web-horizontal-1440p.webp)

# How it works

1. Add music files (mp3, wav, ...) to create a compilation of tracks.
1. Add cues for specific points in time (e.g. intro, verse, chorus, rehearsal marks,...) in the playback file, with a name and an optional shortcut mnemonic
1. In the session, using Replayer on your portable computer, play any part of your set with the click of a cue button.
1. Additionally, you can use a (bluetooth) numeric keypad, as a remote control

Try the <a href="https://web.replayer.app/#demo" target="_blank">demo in the browser</a>.

# Latest release

-   The latest version is available live at https://web.replayer.app (official release)
    -   Test release at https://web-test.replayer.app
    -   Development release at https://web-devel.replayer.app
-   Source code is availabe at [GitHub](https://github.com/suterma/replayer-pwa)
-   Built with [Azure Build Pipeline](https://dev.azure.com/suterma/replayer-pwa/_build?definitionId=1)
-   Tested with [Browserstack](https://live.browserstack.com/dashboard?try_live_url=https%3A%2F%2Fweb.replayer.app), though their "Free Testing for Open Source". Thanks for this great service!

# Documentation

-   [Overview](https://replayer.app)
-   [App documentation](https://replayer.app/documentation)
-   [Blog](https://replayer.app/blog)
-   [Source code documentation](https://src-doc.replayer.app)

# Development

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
    - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
    - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
    - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
    - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Run Unit Tests with [Vitest](https://vitest.dev/)

```sh
npm run test:unit
```

### Run End-to-End Tests with [Cypress](https://www.cypress.io/)

```sh
npm run test:e2e:dev
```

This runs the end-to-end tests against the Vite development server.
It is much faster than the production build.

But it's still recommended to test the production build with `test:e2e` before deploying (e.g. in CI environments):

```sh
npm run build
npm run test:e2e
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```

## Bundling

Replayer uses [Vite](https://vitejs.dev/), with it's current default use of [Rollup](https://rollupjs.org/) as the [bundler for production](https://vitejs.dev/guide/why#why-bundle-for-production) builds.

This means that optimizations for production buils need to leverage Rollup's options. This [Rollup bundle visualizer plugin](https://github.com/btd/rollup-plugin-visualizer) creates visual build statistics, whenever a production build is made.

See the the latest bundle statistics in [stats.html](https://htmlpreview.github.io/?https://raw.githubusercontent.com/suterma/replayer-pwa/main/stats.html).

# Roadmap

See [Trello](https://trello.com/b/UqdfomQI/replayer-20)
