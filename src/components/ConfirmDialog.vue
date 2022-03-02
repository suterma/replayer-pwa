<template>
    <div class="modal is-active">
        <div class="modal-background"></div>

        <div class="modal-card">
            <header class="modal-card-head">
                <h1 class="modal-card-title title">{{ header }}</h1>
            </header>
            <section class="modal-card-body">
                {{ question }}
            </section>
            <footer class="modal-card-foot is-justify-content-flex-end">
                <div class="field is-grouped">
                    <p class="control">
                        <button class="button" @click="$close(this, false)">
                            Cancel
                        </button>
                    </p>
                    <p class="control">
                        <button class="button is-success" @click="$close(this)">
                            Ok
                        </button>
                    </p>
                </div>
            </footer>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    props: {
        question: String,
        header: String,
    },
    setup() {
        function returnValue() {
            return true;
        }
        return {
            returnValue,
        };
    },
});
</script>

<style scoped></style>
