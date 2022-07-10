# [Replayer](https://replayer.app/) technical store documentation

## Purpose

The Replayer store consists of these parts

-   The _compilation_, in JSON , with all the currently available playback metadata (including tracks with cues). Technically, it's stored in the _Local Storage_, with the _COMPILATION_ key.
-   The _currently selected cue_ GUID, which can represent any single cue, or none, of a compilation. Technically, it's stored in the _Local Storage_, with the _SELECTED_CUE_ID_ key. Note: This is not equal to a playback position.
-   A set of _media files_, as BLOBs, for playback with the compilation's tracks. Technically, it's stored in the _IndexedDB_, with the key referencing a track's media URL.
-   The _settings_ for the application in JSON

To learn more about the terms, see the [glossary](https://replayer.app/documentation/glossary).

## Store access

Most components typically do not access the store directly, following the [dumb component pattern](https://namingconvention.org/vuejs/smart-dumb-naming.html).

The following picture gives an overview:

![Store overview](/doc/store/store.svg)
