<template>
    <!-- Shows a complete info on desktop, but a shorter and simpler text on smaller devices -->
    <div class="is-hidden-touch">
        <p>Supported media formats (desktop):</p>
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
                        ><span class="is-family-monospace">.m4a</span>)</span
                    >,&nbsp;for a track.
                </li>
            </ul>
        </div>
        <p>Compilations:</p>
        <div class="content">
            <ul>
                <li>
                    <span class="has-text-weight-bold">XML</span> (<span
                        class="is-family-monospace"
                        >.rex</span
                    >, <span class="is-family-monospace">.xml</span>), without
                    media files
                </li>
                <li>
                    <span class="has-text-weight-bold">bplist</span> (<span
                        class="is-family-monospace"
                        >.bplist</span
                    >), from the LivePlayback app, without media files
                </li>
                <li>
                    <span class="has-text-weight-bold">ZIP</span> (<span
                        class="is-family-monospace"
                        >.rez</span
                    >, <span class="is-family-monospace">.zip</span>), a
                    package, having one of the above, including media files
                </li>
            </ul>
        </div>
    </div>

    <div class="is-hidden-desktop">
        <p>Supported media formats:</p>
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
                    ,&nbsp;for a track.
                </li>
                <li>
                    <span class="has-text-weight-bold">XML</span> (without media
                    files)<br />
                    <span class="has-text-weight-bold">ZIP</span
                    >&nbsp;(including media files),&nbsp;<br />for a
                    compilation.
                </li>
            </ul>
        </div>
    </div>
</template>
