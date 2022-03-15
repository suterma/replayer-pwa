<template>
    <div
        :class="{ modal: true, 'is-active': hasDisplayKey || hasDisplayAction }"
    >
        <div class="modal-content has-text-centered">
            <!-- Note: use a large font for good visibility of the displayed info -->
            <!-- Note2: Zero margin bottom is to avoid a visible scrollbar -->
            <div class="tags has-addons has-opacity-half is-size-1 mb-0">
                <span
                    class="tag is-large is-white is-size-1 is-family-monospace"
                    >{{ displayKey }}</span
                >
                <span class="tag is-dark is-large is-size-1">{{
                    displayAction
                }}</span>
            </div>
        </div>
    </div>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
/** A simple overlay to display handeled keyboard shortcuts */
export default defineComponent({
    name: 'KeyResponseOverlay',
    components: {},
    props: {
        /** The character representation of the currently pressed key (or keys, when handling a shortcut) */
        keyText: null,

        /** The duration of display for each updated string */
        displayTimeout: {
            type: Number,
            default: 1000,
        },
    },
    data() {
        return {
            /** The text to display for the pressed key, which is single key or a short key sequence */
            displayKey: '',
            /** The text to display for the action */
            displayAction: '',
            /** A timeout id, to handle timeout extensions for prolonged display of text in handling a quick sequence of keys
             * @devdoc This implementation only suppors the browser.
             * See https://stackoverflow.com/questions/45802988/typescript-use-correct-version-of-settimeout-node-vs-window
             */
            keyTimeoutId: 0,
        };
    },
    computed: {
        hasDisplayKey(): boolean {
            return this.displayKey != null && this.displayKey.length > 0;
        },
        hasDisplayAction(): boolean {
            return this.displayAction != null && this.displayAction.length > 0;
        },
    },
    methods: {
        /** Displays the given data and the associated action for a short duration */
        DisplayDataAndAction(key: string, action: string) {
            //Clear the probably existing timeout
            window.clearTimeout(this.keyTimeoutId);
            if (key || action) {
                this.displayKey = key;
                this.displayAction = action;
                this.keyTimeoutId = window.setTimeout(() => {
                    this.displayKey = '';
                    this.displayAction = '';
                }, this.displayTimeout);
            } else {
                this.displayKey = '';
                this.displayAction = '';
            }
        },
    },
});
</script>
