## [2.0.0 NEXT RELEASE](https://github.com/suterma/replayer-pwa/compare/v1.4.3...v2.0.0)

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
