# replayer-pwa (beta)

![License](https://img.shields.io/github/license/suterma/replayer-pwa.svg)
![GitHub All Releases](https://img.shields.io/github/downloads/suterma/replayer-pwa/total.svg)
![Release](https://img.shields.io/github/release/suterma/replayer-pwa.svg)
![Language](https://img.shields.io/github/languages/top/suterma/replayer-pwa.svg)

The classic [Replayer](https://github.com/suterma/replayer), as a Progressive Web App.

# Goal

It's aim is to replace the classic, Microsoft Windows based, [Replayer](https://github.com/suterma/replayer) desktop application with a progressive web app, that is locally installable on devices.

-   The latest test version is available at https://web-test.replayer.app
-   Source code is availabe at [GitHub](https://github.com/suterma/replayer-pwa)

# Glossary

-   A **package** is a zip file (\*.zip, \*.rez) which contains a set of media files and typically one compilation. The tracks reference to the media files.
-   A **compilation** is a set of tracks, usually representing a playlist for a concert or rehearsal session.
-   A **track** represents a single media file and a set of cues for it. Within a compilation, more than one track may reference the same media file, to simplify rehearsal variants e.g. for different voices or parts in large pieces.
-   A **media file** is a binary file, containing playable music. Currently only files of type [MP3](https://en.wikipedia.org/wiki/MP3) (\*.mp3) from a local file system are supported.
-   A **cue** represents a named temporal position in a track. A cue can have a (keyboard) shortcut.
-   A **shortcut** is a short mnemonic for a cue, to speed up navigation within a track or compilation, using a keyboard.

# Behaviour

-   Opening a new package removes all previously open files and compilations.
-   Opening a new / multiple compilations merges the contained tracks with the already open compilation.
-   Opening a new / multiple media files adds them to the set of currently available media files.

# Roadmap

* [x] Keyboard Shortcut support
* [ ] Fade-in / Fade-out
* [ ] Multitrack playback
* Persistence
  * [ ] Keep last open complilation loaded
  * [ ] Edit mode, along with ZIP-Package export
* Sharing
  * [ ] Sharing by link
  * [ ] Sharing by QR code
  * [ ] Sharing by link mail
