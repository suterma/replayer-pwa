<template>
    <h1 class="title has-text-danger">Upcoming features for evaluation</h1>
    <h2 class="subtitle has-text-danger">XML export</h2>

    <template v-if="hasCompilation">
        <h2 class="subtitle">See the compilation as XML</h2>
        <CompilationXmlDisplay :compilation="compilation" />
    </template>
    <template v-else>
        <p>Please load a compilation first</p>
    </template>
    <hr />
    <h1 class="title has-text-danger">Tests</h1>
    <h2 class="subtitle has-text-danger">
        Loader component with various compilations
    </h2>
    <p>
        Try one of the various compilations to check out the various features:
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
                >Demo Binary Property List compilation (as from the LivePlayback
                app)</a
            ><br />
            A bplist file with 21 tracks (no media files).
        </li>
    </ul>
    <h2 class="subtitle has-text-danger">Track with Visualization</h2>
    <p>This SHOULD work with 2 visualizations</p>
    <p>
        <TrackAudioMeterPlayer
            ref="player"
            :title="trackFileUrl?.fileName"
            src="your-light-by-lidija-roos.mp3"
            v-on:timeupdate="updateTime"
            v-on:trackLoaded="calculateCueDurations"
        ></TrackAudioMeterPlayer>
    </p>
    <h2 class="subtitle has-text-danger">Icons test</h2>
    <p>Buttons with icons</p>
    <p class="buttons">
        <button class="button">
            <span class="icon">
                <i class="mdi mdi-24px">
                    <svg style="width: 24px; height: 24px">
                        <path
                            fill="currentColor"
                            d="M14,19H18V5H14M6,19H10V5H6V19Z"
                        />
                    </svg>
                </i>
            </span>
            <span>GitHub</span>
        </button>
        <button class="button" v-on:click.prevent="stop" title="Stop">
            <span class="icon">
                <i>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path
                            fill="currentColor"
                            d="M16,4.995v9.808C16,15.464,15.464,16,14.804,16H4.997C4.446,16,4,15.554,4,15.003V5.196C4,4.536,4.536,4,5.196,4h9.808C15.554,4,16,4.446,16,4.995z"
                        /></svg
                ></i>
            </span>
            <span>Stop</span>
        </button>
        <button class="button">
            <span class="icon is-small">
                <i class="fas fa-italic"></i>
            </span>
        </button>
        <button class="button">
            <span class="icon is-small">
                <i class="fas fa-underline"></i>
            </span>
        </button>
    </p>
    <p class="buttons">
        <button class="button">
            <span class="icon">
                <i class="fab fa-github"></i>
            </span>
            <span>GitHub</span>
        </button>
        <button class="button is-primary">
            <span class="icon">
                <i class="fab fa-twitter"></i>
            </span>
            <span>@jgthms</span>
        </button>
        <button class="button is-success">
            <span class="icon is-small">
                <i class="fas fa-check"></i>
            </span>
            <span>Save</span>
        </button>
        <button class="button is-danger is-outlined">
            <span>Delete</span>
            <span class="icon is-small">
                <i class="fas fa-times"></i>
            </span>
        </button>
    </p>
    <p class="buttons">
        <button class="button is-small">
            <span class="icon is-small">
                <i class="fab fa-github"></i>
            </span>
            <span>GitHub</span>
        </button>
        <button class="button">
            <span class="icon">
                <i class="fab fa-github"></i>
            </span>
            <span>GitHub</span>
        </button>
        <button class="button is-medium">
            <span class="icon">
                <i class="fab fa-github"></i>
            </span>
            <span>GitHub</span>
        </button>
        <button class="button is-large">
            <span class="icon is-medium">
                <i class="fab fa-github"></i>
            </span>
            <span>GitHub</span>
        </button>
    </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { ICompilation } from '@/store/compilation-types';
import CompilationXmlDisplay from '@/components/CompilationXmlDisplay.vue';
import TrackAudioMeterPlayer from '@/components/TrackAudioMeterPlayer.vue';

export default defineComponent({
    name: 'Development',
    components: {
        CompilationXmlDisplay,
        TrackAudioMeterPlayer,
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
