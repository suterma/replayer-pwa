<template>
    <div :class="{ modal: true, 'is-active': showDialog }">
        <div class="modal-background"></div>

        <div class="modal-card">
            <header class="modal-card-head">
                <h1 class="modal-card-title title">Welcome</h1>
                <!-- <button class="delete" aria-label="close"></button> -->
            </header>
            <section class="modal-card-body">
                <p>
                    This
                    <a
                        href="https://replayer.app/"
                        alt="Link to the Replayer website"
                        target="_blank"
                        >Replayer Web App</a
                    >
                    is a player for existing compilations from
                    <a
                        href="https://replayer.app/"
                        alt="Link to the Replayer website"
                        target="_blank"
                        >Replayer Classic</a
                    >. It supports playback of locally downloaded files of these
                    types:
                </p>

                <ul>
                    <li>
                        <span class="has-text-weight-bold">XML</span> (<span
                            class="is-family-monospace"
                            >.rex</span
                        >, <span class="is-family-monospace">.xml</span>),
                        without media files
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
                        >, <span class="is-family-monospace">.zip</span>),
                        having one of the above, including media files
                    </li>
                    <li>
                        <span class="has-text-weight-bold">Media file</span>
                        (<span class="is-family-monospace">.mp3</span>), for a
                        track in one of the above. Media files are matched by
                        name. Only MP3 files are supported currently.
                    </li>
                </ul>

                <p>
                    For details about supported file types see the
                    <a
                        href="https://replayer.app/documentation"
                        alt="Link to the Replayer documentation"
                        target="_blank"
                        >documentation</a
                    >
                    or the
                    <a
                        href="https://github.com/suterma/replayer-pwa#glossary"
                        alt="GitHub doc link"
                        target="_blank"
                        >README</a
                    >.
                </p>
            </section>
            <footer class="modal-card-foot is-justify-content-flex-end">
                <div class="field is-horizontal">
                    <div class="field">
                        <div class="control">
                            <label class="checkbox field-label">
                                <input type="checkbox" />
                                Never show again
                            </label>
                        </div>
                    </div>
                    <div class="field">
                        <div class="control">
                            <button
                                class="button is-success"
                                @click="showDialog = false"
                            >
                                Ok
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
/** A simple overlay display of the latest application progress message, if any */
export default defineComponent({
    name: 'ProgressOverlay',
    components: {},
    data() {
        return {
            showDialog: true,
            //TODO get /set from store, see sunscreen
        };
    },
    computed: {},
});
</script>
