# [Replayer](https://replayer.app/) uses pdfjs

To support PDF display on mobile devices, the [legacy build of pdfjs](https://github.com/mozilla/pdf.js/wiki/Frequently-Asked-Questions#legacy-build) is included, and used as a fallback, in combination with the [PdfObject library](https://pdfobject.com/).

The [prebuilt, stable release](https://mozilla.github.io/pdf.js/getting_started/#download), [version 4.2.67](https://github.com/mozilla/pdf.js/releases/download/v4.2.67/pdfjs-4.2.67-legacy-dist.zip) has been used, and slightly adapted for optimal use with Replayer.

The minified JS files have been taken from the [pre-built version, v3.4.120](https://github.com/mozilla/pdfjs-dist).

-   The viewer.html and it's supporting files are all provided from this folder.
-   The viewer.html has been slightly simplified.
