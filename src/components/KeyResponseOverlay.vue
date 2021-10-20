<template>
    <div
        :class="{ modal: true, 'is-active': hasDisplayKey || hasDisplayAction }"
    >
        <!-- <div class="modal-background"></div> -->
        <div class="modal-content has-text-centered">
            <!-- <h1 class="has-text-centered">Key</h1> -->

            <!-- <div class="has-text-centered">
                <span class="tag is-dark is-large"> {{ displayText }}</span>
            </div> -->
            <div class="tags has-addons has-opacity-half is-size-mega">
                <span class="tag is-large is-white is-size-mega">{{
                    displayKey
                }}</span>
                <span class="tag is-dark is-large is-size-mega">{{
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
    },
    data() {
        return {
            /** The text to display for the pressed key, which is single key or a short key sequence */
            displayKey: '',
            /** The text to display for the action */
            displayAction: '',
            /** A timeout id, to handle timeout extensions for prolonged display of text in handling a quick sequence of keys*/
            keyTimeoutId: new Object() as ReturnType<typeof setTimeout>,
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
    watch: {},
    methods: {
        /** Displays the given data and the associated action for a short duration */
        DisplayDataAndAction(key: string, action: string) {
            //Clear the probably existing timeout
            clearTimeout(this.keyTimeoutId);
            if (key || action) {
                this.displayKey = key;
                this.displayAction = action;
                this.keyTimeoutId = setTimeout(() => {
                    this.displayKey = '';
                    this.displayAction = '';
                }, 500);
            } else {
                this.displayKey = '';
                this.displayAction = '';
            }
        },
    },
});
</script>
<style scoped>
.is-size-mega {
    font-size: 3rem !important;
    /** very large */
    /* font-size: 10vw !important; */
}

.tags:last-child {
    /* Avoid scrollbar */
    margin-bottom: 0;
}
</style>
