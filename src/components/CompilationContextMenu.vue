<template>
    <DropdownMenu title="Compilation context menu">
        <DropdownMenuItem
            title="Prevent screen timeout"
            subTitle="(while this compilation is open)"
            :class="{
                'is-active': isPreventingScreenTimeoutNow,
            }"
            @click="togglePreventScreenTimeoutNow"
        />
        <div class="dropdown-item" @click="downloadRezPackage">
            Download as
            <span class="has-text-weight-bold">ZIP</span><br />
            <span class="has-opacity-half is-size-7">
                (<span class="is-family-monospace">.rez</span>), including media
                files
            </span>
        </div>
        <div class="dropdown-item" @click="downloadRexFile">
            Download as
            <span class="has-text-weight-bold">XML</span><br />
            <span class="has-opacity-half is-size-7">
                (<span class="is-family-monospace">.rex</span>), without media
                files
            </span>
        </div>
        <hr class="dropdown-divider" />

        <DropdownMenuItem
            title="Close"
            subTitle="(discard the compilation)"
            @click="close"
        />
    </DropdownMenu>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import NoSleep from 'nosleep.js';
import { ActionTypes } from '@/store/action-types';
import { Compilation } from '@/store/compilation-types';
import DropdownMenu from '@/components/DropdownMenu.vue';
import DropdownMenuItem from '@/components/DropdownMenuItem.vue';
import { confirm } from '@/code/ui/dialogs';

/** A nav bar as header with a menu for a compilation
 */
export default defineComponent({
    name: 'CompilationHeader',
    components: { DropdownMenu, DropdownMenuItem },
    props: {
        compilation: {
            type: Compilation,
            required: true,
        },
    },
    data() {
        return {
            /** The wake lock fill-in that can prevent screen timeout, while a compilation is in use */
            noSleep: new NoSleep(),
        };
    },
    methods: {
        /** Closes the compilation
         */
        close(): void {
            confirm(
                'Closing compilation',
                `Do you want to close (and discard any changes to) compilation '${this.compilation.Title}'? Hint: to keep changes for later use, download a copy first.`,
            ).then((ok) => {
                if (ok) {
                    this.$store.dispatch(ActionTypes.DISCARD_COMPILATION);
                }
            });
        },
        /** Initiates the download of the current compilation as a single XML (.rex) file
         */
        async downloadRexFile(): Promise<void> {
            this.$store.dispatch(ActionTypes.DOWNLOAD_REX_FILE);
        },

        /** Initiates the download of the current compilation as a ZIP (.rez) package
         */
        async downloadRezPackage(): Promise<void> {
            this.$store.dispatch(ActionTypes.DOWNLOAD_REZ_PACKAGE);
        },
        togglePreventScreenTimeoutNow() {
            if (this.isPreventingScreenTimeoutNow) {
                this.noSleep.disable();
            } else {
                this.noSleep.enable();
            }
        },
    },
    unmounted() {
        this.noSleep.disable();
    },
    computed: {
        isPreventingScreenTimeoutNow(): boolean {
            return this.noSleep.isEnabled;
        },
    },
});
</script>
