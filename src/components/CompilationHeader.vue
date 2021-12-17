<template>
    <!-- Level, also on mobile -->
    <nav class="level is-mobile">
        <!-- Left side -->
        <div class="level-left">
            <div class="level-item">
                <p class="title is-3">{{ compilation?.Title }}</p>
            </div>
        </div>
        <!-- Right side -->
        <div class="level-right">
            <div class="level-item">
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
                                class="button is-ghost"
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
                                                d="M12,16A2,2 0 0,1 14,18A2,2 0 0,1 12,20A2,2 0 0,1 10,18A2,2 0 0,1 12,16M12,10A2,2 0 0,1 14,12A2,2 0 0,1 12,14A2,2 0 0,1 10,12A2,2 0 0,1 12,10M12,4A2,2 0 0,1 14,6A2,2 0 0,1 12,8A2,2 0 0,1 10,6A2,2 0 0,1 12,4Z"
                                            />
                                        </svg>
                                    </i>
                                </span>
                            </button>
                        </div>
                        <div
                            class="dropdown-menu"
                            id="dropdown-menu"
                            role="menu"
                        >
                            <div class="dropdown-content">
                                <!-- <a
                                href="#"
                                class="dropdown-item"
                                @click="downloadXml"
                            >
                                Download as
                                <span class="has-text-weight-bold">XML</span>
                                compilation (<span class="is-family-monospace"
                                    >.rex</span
                                >), without media files
                            </a>
                            <hr class="dropdown-divider" /> -->
                                <a
                                    href="#"
                                    @click="close"
                                    class="dropdown-item"
                                >
                                    Close</a
                                >
                            </div>
                        </div>
                    </div>
                </span>
            </div>
        </div>
    </nav>
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
    name: 'CompilationHeader',
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
