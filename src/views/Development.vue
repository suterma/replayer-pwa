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

    <h2 class="subtitle has-text-danger">API tests</h2>
    <div class="content">
        <p>These API calls should work (if CORS is disabled)</p>
        <ul>
            <li>
                Loading a media URL (downloading the media file, creating a
                track):
                <a
                    href="http://localhost:8080/https%3A%2F%2Fwww.christoffankhauser.ch%2Fapp%2Fdownload%2F15906779025%2FGwBl15_I%2520danke%2520Dir-Pb.mp3%3Ft%3D1496741278"
                >
                    CF Media link
                </a>
                Why does it not work?
            </li>
        </ul>
    </div>

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
                <a href="/#/edit/demo-compilation-featuring-lidija-roos.rez"
                    >Demo package with a compilation featuring Lidija Roos</a
                ><br />
                A REZ Package containing an REX compilation with 2 tracks and
                matching mp3 files.
            </li>
            <li>
                <a href="/#/edit/Demo%20Adonia%20Junior%2021.bplist"
                    >Demo Binary Property List compilation (as from the
                    LivePlayback app)</a
                ><br />
                A bplist file with 21 tracks (no media files).
            </li>
        </ul>
    </div>

    <h2 class="subtitle has-text-danger">Editable input</h2>
    <div class="">
        <EditableInput placeholder="Add text..." v-model="editableInputText" />
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

    <h1 class="title has-text-danger">Icons test</h1>
    <NavButton
        iconPathData="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"
        title="some test title"
    />
    <CollapsibleButton
        v-model="isExpanded"
        collapsedText="Show 11 somethings"
        expandedText="Hide all this stuff"
    />
    (Is expanded: {{ isExpanded }})
    <nav>
        <ToggleButton v-model="isOn" onText="On" offText="Off" />
    </nav>
    (Is on: {{ isOn }})
    <h3>Buttons with icons</h3>
    <p>Icons are "Inline SVG's from from https://materialdesignicons.com/</p>

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
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ICompilation } from '@/store/compilation-types';
import CompilationXmlDisplay from '@/components/CompilationXmlDisplay.vue';
import CollapsibleButton from '@/components/CollapsibleButton.vue';
import ToggleButton from '@/components/ToggleButton.vue';
import EditableInput from '@/components/EditableInput.vue';
import NavButton from '@/components/NavButton.vue';

export default defineComponent({
    name: 'Development',
    components: {
        CompilationXmlDisplay,
        CollapsibleButton,
        ToggleButton,
        EditableInput,
        NavButton,
    },
    data: () => ({
        isExpanded: false,
        isOn: false,
        editableInputText: 'some input text',
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
