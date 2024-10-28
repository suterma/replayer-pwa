## [2.5.0](https://github.com/suterma/replayer-pwa/compare/v2.4.0...v2.5.0) (2024-10-28)

This release improves tag handling and cue display

## What's Changed

-   improved tag handling and cue display
-   improved keyboard handling
-   added experimental remarks for tracks
-   various bugfixes
-   improved internal state management
-   deprecated legacy package file support (.rez/.rex)

**Full Changelog**: https://github.com/suterma/replayer-pwa/compare/v2.3.0...v2.4.0

## [2.4.0](https://github.com/suterma/replayer-pwa/compare/v2.3.0...v2.4.0) (2023-07-03)

This release adds PDF display, improved fade- and preroll-handling, and tag-based filtering.

## What's Changed

-   Added tags for display and filtering
-   Added omittable fades and pre-roll for cues
-   No fades on loop (configurable)
-   Updated filename handling when saving compilations
-   Various bugfixes
-   minor UI improvements

**Full Changelog**: https://github.com/suterma/replayer-pwa/compare/v2.3.0...v2.4.0

## [2.3.0](https://github.com/suterma/replayer-pwa/compare/v2.1.0...v2.3.0) (2023-03-30)

This release adds a playback rate setting, fixes some storage issues and implements various UI improvements.

## What's Changed

-   Improved download dialog
-   Initial cue is optional
-   Improved time update handling
-   Improved menu display
-   Improved artist display
-   Fixed keyboard handling for menus
-   Added playback rate handling
-   Internally improved media looping
-   Improved storage handling for blobs/files, including more precise error handling
-   Removed fragment usage for blobs, due to issues on iPadOS devices
-   Improved ZIP loading progress display

**Full Changelog**: (https://github.com/suterma/replayer-pwa/compare/v2.1.0...v2.3.0)

## [2.1.0](https://github.com/suterma/replayer-pwa/compare/v2.0.2...v2.1.0) (2023-01-21)

This release mainly adds a fullscreen mode, specifically useful with video content.

## What's Changed

-   127 upgrade to newest vue environment by @suterma in https://github.com/suterma/replayer-pwa/pull/128
-   Added fullscreen mode
-   Simplified video usage
-   Set audio level meter off by default
-   Switched CI to vite
-   Improved experimental sharing

**Full Changelog**: https://github.com/suterma/replayer-pwa/compare/v2.0.2...v2.1.0

## [2.0.2](https://github.com/suterma/replayer-pwa/compare/v2.0.1...v2.0.2) (2023-11-23)

Minor bugfixes.

## [2.0.1](https://github.com/suterma/replayer-pwa/compare/v2.0.0...v2.0.1) (2023-11-19)

Audio related bugfixes.

## [2.0.0](https://github.com/suterma/replayer-pwa/compare/v1.4.3...v2.0.0) (2023-11-17)

This release adds video playback, including YouTube. It shows text files in a compilation. During editing, a waveform view and a peak level meter is available. A customizable pre-roll can be set.

### What's Changed

-   Added video playback for WebM, MP4, Ogg Theora, YouTube
-   A waveform view and a peak level meter
-   Customizable pre-roll available (per track and globally configurable)
-   Changed license to AGPLv3
-   Improved document title with playback info
-   Simplified playback (only plays during play/edit, not other views)
-   Simplified and improved Editor GUI
-   Pre-Roll and Fading is now toggleable from the GUI
-   Text files are now displayed in the top position for a compilation
-   Internally improved media playback handling
-   Removed bplist support
-   Added BPM for a track
-   Adding web audio peak meter by @suterma in https://github.com/suterma/replayer-pwa/pull/93
-   Use pinia instead of vuex by @suterma in https://github.com/suterma/replayer-pwa/pull/96
-   Add support for text files in zip compilations by @suterma in https://github.com/suterma/replayer-pwa/pull/99

## [1.4.3](https://github.com/suterma/replayer-pwa/compare/v1.4.1...v1.4.3) (2023-03-10)

-   This release contains minor UI improvements (virtual cue) and bug fixes. Also, cypress e2e tests have been introduced.

## [1.4.1](https://github.com/suterma/replayer-pwa/compare/v1.4.0...v1.4.1) (2022-12-28)

-   This release offers a streamlined UI, both for single-track and large compilations. A printable set list is available. Cue editing has been improved, together with more extensive keyboard support.

## [1.3.0](https://github.com/suterma/replayer-pwa/compare/v1.2.2...v1.3.0) (2022-05-15)

This release allows using online media sources and introduces an experimental API.

### Improvements

-   Editor allows using of online media sources, in the currently supported [formats](https://replayer.app/en/documentation/audio-formats)
-   Better [keyboard support, especially in the edit view](https://replayer.app/en/documentation/keyboard-shortcuts#playback-editing-in-the-e)
-   Experimental [API and documentation](https://replayer.app/en/documentation/track-api)
-   fading indication during playback
-   removed outfront dependency (in favor of [browserstack](https://www.browserstack.com/) usage)
-   the current [playback/loop mode](https://replayer.app/en/documentation/loop-modes) is stored over app restarts, for each track
-   minor fix when replacing a media source
-   removed external workbox dependency for better privacy

## [1.2.2](https://github.com/suterma/replayer-pwa/compare/v1.1.0...v1.2.0) (2022-04-18) More audio formats RC2

This release includes more audio formats and some fixes with the playback volume. Also, support on Apple devices has been improved. Supported audio formats (See also https://replayer.app/en/documentation/audio-formats) are:

-   [MP3](https://en.wikipedia.org/wiki/MP3) (formally MPEG-1 Audio Layer III or MPEG-2 Audio Layer III)
-   [WAV](https://en.wikipedia.org/wiki/WAV) (Waveform Audio File Format, WAVE)
-   [FLAC](https://en.wikipedia.org/wiki/FLAC) (Free Lossless Audio Codec)
-   [Ogg Vorbis](https://en.wikipedia.org/wiki/Vorbis) (Vorbis in an Ogg container)
-   [AIFF](https://en.wikipedia.org/wiki/Audio_Interchange_File_Format) (Audio Interchange File Format)
-   [AAC](https://en.wikipedia.org/wiki/Advanced_Audio_Coding) (Advanced Audio Coding)

## Earlier releases

See https://github.com/suterma/replayer-pwa/releases
