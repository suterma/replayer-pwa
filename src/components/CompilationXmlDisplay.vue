<template>
    <div class="control">
        <textarea
            class="textarea is-family-code is-size-7"
            readonly
            v-text="xml"
        ></textarea>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Compilation } from '@/store/compilation-types';
import xml2js from 'xml2js';
import { XmlCompilation } from '@/code/xml/XmlCompilation';

/** Displays the currently loaded compilation as an XML-Structure, for export to RePlayer Classic */
export default defineComponent({
    name: 'CompilationXmlDisplay',
    props: {
        compilation: Compilation,
    },
    methods: {},
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
