<template>
    <h1 class="title">
        <span>
            {{ compilation?.Title }}

            <span class="is-pulled-right ml-3">
                <!-- <div
                    :class="{
                        dropdown: true,
                        'is-right': true,
                        'is-hoverable': false,
                        'is-active': isDropdownExpanded,
                    }"
                    @click="toggleDropdownExpanded()"
                    @blur="collapseDropdown()"
                > -->
                <div
                    :class="{
                        dropdown: true,
                        'is-right': true,
                        'is-hoverable': true,
                    }"
                >
                    <div class="dropdown-trigger">
                        <button
                            class="button"
                            aria-haspopup="true"
                            aria-controls="dropdown-menu"
                            title="Compilation context menu"
                        >
                            <span class="icon">
                                <i class="mdi mdi-24px">
                                    <svg
                                        style="width: 24px; height: 24px"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            fill="currentColor"
                                            d="M3,6H21V8H3V6M3,11H21V13H3V11M3,16H21V18H3V16Z"
                                        />
                                    </svg>
                                </i>
                            </span>
                        </button>
                    </div>
                    <div class="dropdown-menu" id="dropdown-menu" role="menu">
                        <div class="dropdown-content">
                            <a
                                href="#"
                                class="dropdown-item"
                                @click="downloadXml"
                            >
                                Download
                                <span class="has-text-weight-bold">XML</span>
                                (<span class="is-family-monospace">.rex</span>),
                                without media files
                            </a>
                            <hr class="dropdown-divider" />
                            <a href="#" @click="close" class="dropdown-item">
                                Close</a
                            >
                        </div>
                    </div>
                </div>
            </span>
        </span>
    </h1>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Compilation } from '@/store/compilation-types';
import { MutationTypes } from '@/store/mutation-types';
import FileSaver from 'file-saver';
import { XmlCompilation } from '@/code/xml/XmlCompilation';
import xml2js from 'xml2js';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationDropdownHeader',
    components: {},
    props: {
        compilation: Compilation,
    },
    data() {
        return {
            /** Whether the dropdown menu is shown as expanded.
             */
            // isDropdownExpanded: false,
        };
    },
    methods: {
        /** Closes the compilation
         */
        close(): void {
            this.$store.commit(MutationTypes.CLOSE_COMPILATION);
        },

        downloadXml() {
            var blob = new Blob([this.xml], {
                type: 'text/xml;charset=utf-8',
            });
            FileSaver.saveAs(blob, 'ZIP-Compilation.rex');
        },
        // toggleDropdownExpanded() {
        //     this.isDropdownExpanded = !this.isDropdownExpanded;
        // },
        // collapseDropdown() {
        //     this.isDropdownExpanded = false;
        // },
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
