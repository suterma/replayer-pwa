<template>
    <div class="field">
        <label class="label">REX compilation</label>
        <div class="control">
            <textarea
                class="textarea is-family-code is-small"
                rows="10"
                readonly
                v-text="xml"
            ></textarea>
        </div>
    </div>
    <div class="field">
        <div class="control">
            <button class="button is-primary" @click="downloadXml">
                Download .rez file
            </button>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Compilation } from '@/store/compilation-types';
import xml2js from 'xml2js';
import FileSaver from 'file-saver';
import { XmlCompilation } from '@/code/xml/XmlCompilation';

/** Displays the currently loaded compilation as an XML-Structure, for export to RePlayer Classic */
export default defineComponent({
    name: 'CompilationXmlDisplay',
    props: {
        compilation: Compilation,
    },
    methods: {
        downloadXml() {
            var blob = new Blob([this.xml], {
                type: 'text/xml;charset=utf-8',
            });
            FileSaver.saveAs(blob, 'ZIP-Compilation.rez');
        },
    },
    computed: {
        xml(): string {
            let obj = {
                XmlCompilation: new XmlCompilation(this.compilation),
            };
            var builder = new xml2js.Builder();
            var xml = builder.buildObject(obj);
            return xml;
        },
    },
});
</script>
