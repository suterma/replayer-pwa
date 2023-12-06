![License](https://img.shields.io/github/license/suterma/replayer-pwa.svg)
![GitHub All Releases](https://img.shields.io/github/downloads/suterma/replayer-pwa/total.svg)
![Release](https://img.shields.io/github/release/suterma/replayer-pwa.svg)
![Language](https://img.shields.io/github/languages/top/suterma/replayer-pwa.svg)
[![Build Status](https://dev.azure.com/suterma/replayer-pwa/_apis/build/status/suterma.replayer-pwa?branchName=main)](https://dev.azure.com/suterma/replayer-pwa/_build/latest?definitionId=1&branchName=main)

[Replayer](https://replayer.app/) is a free, cue-based media player for rehearsals with playback music.
By the click of a button, Replayer starts to play at predefined times in the audio or video file.

![Visual Functioning Overview](/public/img/screenshot/web-app-on-phone-stand.png)

# How it works

1. First, create a compilation of music files (mp3, wav, flac, ogg, aiff, acc, ...) as tracks and cues
1. Each cue represents a point in time (e.g. intro, verse, chorus,...) in the playback file, with a name and an optional shortcut mnemonic
1. In the session, using Replayer on your portable computer, play any part of your set with the click of a cue button.
1. Additionally, you can use a (bluetooth) numeric keypad, as a remote control

Try the [demo in the browser](https://web.replayer.app/#demo)

# Latest release

-   The latest version is available at https://web.replayer.app (official release)
    -   Test release at https://web-test.replayer.app
    -   Development release at https://web-devel.replayer.app
-   Source code is availabe at [GitHub](https://github.com/suterma/replayer-pwa)
-   Built with [Azure Build Pipeline](https://dev.azure.com/suterma/replayer-pwa/_build?definitionId=1)
-   Tested with [Browserstack](https://live.browserstack.com/dashboard?try_live_url=https%3A%2F%2Fweb.replayer.app), though their "Free Testing for Open Source". Thanks for this great service!

# Documentation

The full documentation is available at https://replayer.app/en/documentation

# Tests

-   Run the [Cypress End-To-End regression tests](/cypress/e2e/regression)

    # Manually

    npm run test:e2e:dev

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

# Roadmap

See [Trello](https://trello.com/b/UqdfomQI/replayer-20)
