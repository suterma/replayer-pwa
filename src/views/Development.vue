<template>
    <div class="block">
        <section class="hero is-danger is-small">
            <div class="hero-body">
                <p class="title">Upcoming features for evaluation</p>
                <p class="subtitle">Use with caution</p>
            </div>
        </section>
    </div>
    <h1 class="title has-text-danger">XML export</h1>
    <div class="content">
        <template v-if="hasCompilation">
            <h2 class="subtitle">See the compilation as XML</h2>
            <CompilationXmlDisplay :compilation="compilation" />
        </template>
        <template v-else>
            <p>Please load a compilation first</p>
        </template>
        <hr />
    </div>
    <h1 class="title has-text-danger">Tests</h1>

    <h2 class="subtitle has-text-danger">
        Loader component with various compilations
    </h2>
    <div class="content">
        <p>
            Try one of the various compilations to check out the various
            features:
        </p>
        <ul>
            <li>
                <a href="/#/play/demo-compilation-featuring-lidija-roos.rez"
                    >Demo package with a compilation featuring Lidija Roos</a
                ><br />
                A REZ Package containing an REX compilation with 2 tracks and
                matching mp3 files.
            </li>
            <li>
                <a href="/#/play/Demo%20Adonia%20Junior%2021.bplist"
                    >Demo Binary Property List compilation (as from the
                    LivePlayback app)</a
                ><br />
                A bplist file with 21 tracks (no media files).
            </li>
        </ul>
    </div>

    <h2 class="subtitle has-text-danger">Log test buttons</h2>
    <div class="buttons">
        <button class="button is-success" @click="this.writeDebug">
            A debug log
        </button>

        <button class="button is-info" @click="this.writeLog">A log</button>
        <button class="button is-warning" @click="this.writeWarnLog">
            A warning
        </button>
        <button class="button is-danger" @click="this.writeErrorLog">
            Something dangerous
        </button>
        <button
            class="button is-danger has-text-dark"
            @click="this.throwException"
        >
            Throw an exception
        </button>
    </div>

    <h1 class="title has-text-danger">Context Menu</h1>

    <div class="dropdown is-active">
        <!-- dropdown-trigger -->
        <button
            class="button"
            aria-haspopup="true"
            aria-controls="dropdown-menu"
        >
            <span>Dropdown button</span>
            <span class="icon is-small">
                <i class="fas fa-angle-down" aria-hidden="true"></i>
            </span>
        </button>
        <div class="dropdown-menu" id="dropdown-menu" role="menu">
            <div class="dropdown-content">
                <a href="#" class="dropdown-item"> Dropdown item </a>
                <a class="dropdown-item"> Other dropdown item </a>
                <a href="#" class="dropdown-item is-active">
                    Active dropdown item
                </a>
                <a href="#" class="dropdown-item"> Other dropdown item </a>
                <hr class="dropdown-divider" />
                <a href="#" class="dropdown-item"> With a divider </a>
            </div>
        </div>
    </div>

    <h1 class="title has-text-danger">Icons test</h1>
    <CollapsibleButton
        v-model="isExpanded"
        collapsedText="Show 11 somethings"
        expandedText="Hide all this stuff"
    />
    (Is expanded: {{ isExpanded }})
    <h3>Buttons with icons</h3>
    <p>Icons are "Inline SVG's from from https://materialdesignicons.com/</p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ICompilation } from '@/store/compilation-types';
import CompilationXmlDisplay from '@/components/CompilationXmlDisplay.vue';
import CollapsibleButton from '@/components/CollapsibleButton.vue';

export default defineComponent({
    name: 'Development',
    components: {
        CompilationXmlDisplay,
        CollapsibleButton,
    },
    data: () => ({
        isExpanded: false,
    }),
    methods: {
        writeDebug() {
            console.debug('Just a debug log with an object', { some: 'data' });
        },
        writeLog() {
            console.log('Just a log');
        },
        writeWarnLog() {
            console.warn('A warning');
        },
        writeErrorLog() {
            console.error('Something dangerous');
        },
        throwException() {
            throw 'Something bad happened!';
        },
    },
    computed: {
        compilation(): ICompilation {
            return this.$store.getters.compilation;
        },
        hasCompilation(): boolean {
            return this.$store.getters.hasCompilation;
        },
    },
});
</script>
