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
1. Add cues for specific points in time (e.g. intro, verse, chorus,...) in the playback file, with a name and an optional shortcut mnemonic
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

# Tests

## End-to-end (with cypress)

Run the [Cypress End-To-End regression tests](/cypress/e2e/regression)

## Unit tests

Run the vitest unit tests with:

    npm run test:unit

# Build

This package currently runs best with node version 16. (node version 18 fails because of some dependencies that are not working with it.)

    npm install -g n
    n 16
    npm install
    npm run build

NOTE: For node v18 on Windows, use the Workaround "Number 2" by https://sebhastian.com/error-0308010c-digital-envelope-routines-unsupported/

When using VSCode, in the Terminal (Powershell) do

    # Windows PowerShell:
    $env:NODE_OPTIONS="--openssl-legacy-provider"

once before building.

## Bundling

Replayer uses [Vite](https://vitejs.dev/), with it's current default use of [Rollup](https://rollupjs.org/) as the [bundler for production](https://vitejs.dev/guide/why#why-bundle-for-production) builds.

This means that optimizations for production buils need to leverage Rollup's options. This [Rollup bundle visualizer plugin](https://github.com/btd/rollup-plugin-visualizer) creates visual build statistics, whenever a production build is made.

See the the latest bundle statistics in [stats.html](https://htmlpreview.github.io/?https://raw.githubusercontent.com/suterma/replayer-pwa/main/stats.html).

# Roadmap

See [Trello](https://trello.com/b/UqdfomQI/replayer-20)
