<template>
    <!-- Shows a complete info on desktop, but a shorter and simpler text on smaller devices -->
    <div class="is-hidden-touch">
        <p>Supported file formats, for tracks:</p>
        <div class="content">
            <ul>
                <li>
                    <span class="has-text-weight-bold">MP3</span>
                    <span
                        >&nbsp;(<span class="is-family-monospace">.mp3</span
                        >)</span
                    >,&nbsp;
                    <span class="has-text-weight-bold">WAV</span>
                    <span
                        >&nbsp;(<span class="is-family-monospace">.wav</span
                        ><span>,&nbsp;</span
                        ><span class="is-family-monospace">.wave</span>)</span
                    >,&nbsp;
                    <span class="has-text-weight-bold">FLAC</span>
                    <span
                        >&nbsp;(<span class="is-family-monospace">.flac</span
                        >)</span
                    >,&nbsp;
                    <span class="has-text-weight-bold">OGG</span>
                    <span
                        >&nbsp;(<span class="is-family-monospace">.ogg</span
                        >)</span
                    >,&nbsp;
                    <span class="has-text-weight-bold">AIFF</span>
                    <span
                        >&nbsp;(<span class="is-family-monospace">.aiff</span>
                        <span>,&nbsp;</span
                        ><span class="is-family-monospace">.aif</span>)</span
                    >,&nbsp;
                    <span class="has-text-weight-bold">AAC</span>
                    <span
                        >&nbsp;(<span class="is-family-monospace">.aac</span
                        ><span>,&nbsp;</span
                        ><span class="is-family-monospace">.m4a</span
                        >),&nbsp;</span
                    >

                    <span class="has-text-weight-bold">MP4</span>
                    <span
                        >&nbsp;(<span class="is-family-monospace"
                            >.mp4,.m4a,.m4p,.m4b,.m4r,.m4v</span
                        >),&nbsp;</span
                    >

                    <span class="has-text-weight-bold">WebM</span>
                    <span
                        >&nbsp;(<span class="is-family-monospace">.webm</span
                        >),&nbsp;</span
                    >

                    <span class="has-text-weight-bold">Ogg Theora</span>
                    <span
                        >&nbsp;(<span class="is-family-monospace"
                            >.ogv,.ogg</span
                        >)&nbsp;</span
                    >
                </li>
                <li>
                    <span class="has-text-weight-bold">YouTube</span>
                </li>
                <li>
                    <span class="has-text-weight-bold">TEXT</span>
                    <span
                        >&nbsp;(<span class="is-family-monospace">.txt</span
                        ><span></span>)</span
                    >,&nbsp;for additional content.
                </li>
                <li>
                    <span class="has-text-weight-bold">PDF</span>
                    <span
                        >&nbsp;(<span class="is-family-monospace">.pdf</span
                        ><span></span>)</span
                    >,&nbsp;for additional content.
                </li>
            </ul>
        </div>
        <p>Compilations files (with multiple tracks):</p>
        <div class="content">
            <ul>
                <li>
                    <span class="has-text-weight-bold">ZIP</span> (<span
                        class="is-family-monospace"
                        >.rez</span
                    >, <span class="is-family-monospace">.zip</span>), including
                    media files
                </li>
                <li>
                    <span class="has-text-weight-bold">XML</span> (<span
                        class="is-family-monospace"
                        >.rex</span
                    >, <span class="is-family-monospace">.xml</span>), with URLs
                    to online media resources
                </li>
            </ul>
        </div>
    </div>

    <div class="is-hidden-desktop">
        <p>Supported file formats:</p>
        <div class="content">
            <ul>
                <li>
                    <span class="has-text-weight-bold">MP3</span>
                    ,&nbsp;
                    <span class="has-text-weight-bold">WAV</span>
                    ,&nbsp;
                    <span class="has-text-weight-bold">FLAC</span>
                    ,&nbsp;
                    <span class="has-text-weight-bold">OGG</span>
                    ,&nbsp;
                    <span class="has-text-weight-bold">AIFF</span>
                    ,&nbsp;
                    <span class="has-text-weight-bold">AAC</span>
                    ,&nbsp;
                    <span class="has-text-weight-bold">MP4</span>
                    ,&nbsp;
                    <span class="has-text-weight-bold">WebM</span>
                    ,&nbsp;
                    <span class="has-text-weight-bold">YouTube</span>
                    ,&nbsp;for a playback track.
                </li>
                <li>
                    <span class="has-text-weight-bold">TEXT</span>
                    ,&nbsp;for additional content.
                </li>
                <li>
                    <span class="has-text-weight-bold">ZIP</span
                    >&nbsp;(including multiple tracks and files)&nbsp;<br />
                    <span class="has-text-weight-bold">XML</span> (including
                    multiple tracks with URLs to online resources),&nbsp;
                    <br />for a compilation.
                </li>
            </ul>
        </div>
    </div>
</template>
