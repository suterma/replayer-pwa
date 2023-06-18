# [Replayer](https://replayer.app/) technical store documentation

## Purpose

Replayer internally uses Pinia for storing state. The complete Replayer state consists of these parts:

-   The **APP** store, with all the currently available playback metadata (including tracks with cues). Technically, all properties are stored in the _Local Storage_. It also includes the **currently selected cue or track**'s GUID, which can represent any single cue or track, or none, of a compilation. The key used are _selectedCueId_ or _selectedTrackId_, respectively. Note: This is not equal to a playback position.
-   The **SETTINGS** store, with individual _Local Storage_ items.
-   The **audio environment** in the **AUDIO** store, consisting of the Web Audio API context and the individual media elements.
-   A set of **media files**, as BLOBs, for playback with the compilation's tracks. Technically, it's stored in the _IndexedDB_, with the key referencing a track's media URL.

To learn more about the terms, see the [glossary](https://replayer.app/documentation/glossary).

## Store access

Most components typically do not access the store directly, following the [dumb component pattern](https://namingconvention.org/vuejs/smart-dumb-naming.html).

The following picture gives an overview:

![Store overview](/doc/store/store.svg)
