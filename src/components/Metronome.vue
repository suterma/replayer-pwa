<template>
    <h1>Metronome</h1>
    <button
        @mousedown="tap"
        @keydown="tap"
        value="tap"
        data-playing="false"
        role="switch"
        aria-checked="false"
    >
        Tap
    </button>
    {{ sequnceTapCount }}{{ click }} BPM:{{ beatsPerMinute }} Running:
    {{ isRunning }}
    Sound:
    <audio src="../../audio/drumsticks.wav" id="soundelement" controls></audio>

    <input
        type="range"
        id="volume"
        min="0"
        max="2"
        @change="fade"
        v-model="volume"
        step="0.01"
    />Volume: {{ volume }}

    <p>
        Taken from https://freesound.org/people/PrimeJunt/sounds/135627/# and
        minified
    </p>
</template>

<script lang="ts">
import Vue from 'vue';
import { defineComponent } from 'vue';

//TODO this does not feel right, how to make this into the component?
let audioContext: AudioContext;
let gainNode: GainNode;
let metronomeIntervalId: any;

/** This is metronome component that allows setting or tapping in a Beats-Per-Minute speed
 * @remarks It allows to tap along the rythm for some beats to adjust the speed properly to the sound
 * @devdoc To adjust, a tap sequence is started with a first tap (after a while), then counting taps as long as the user keeps tapping in a reasonable speed
 */
export default defineComponent({
    data() {
        return {
            volume: 1,
            sequnceTapCount: 0,
            click: false,
            firstTapOfSequenceTimeStamp: 0,
            lastTapTimeStamp: 0,
            beatsPerMinute: 0,
            isRunning: false,

            //audioContext: new AudioContext()
        };
    },
    methods: {
        tap(event: Event): void {
            let thisTap = performance.now();
            console.log('tap');

            //Just in case, anything was running, cancel it
            clearTimeout(metronomeIntervalId);

            //calculate the last tap span
            let lastSpan = thisTap - this.lastTapTimeStamp;
            console.log('lastSpan:', lastSpan);
            //if the span is reasonable for a tap-in squence, start the metronome with the updated sequence span
            if (lastSpan < 2500) {
                //start a new sequence, if there is none
                if (this.sequnceTapCount === 0) {
                    console.log('NEW Sequence!');
                    this.firstTapOfSequenceTimeStamp = this.lastTapTimeStamp;
                }
                this.sequnceTapCount++;

                //Process the tap-in sequence
                console.log('Tap-In detected', {
                    firstTapOfSequenceTimeStamp:
                        this.firstTapOfSequenceTimeStamp,
                    thisTap: thisTap,
                    sequnceTapCount: this.sequnceTapCount,
                });
                var averageSpan =
                    (thisTap - this.firstTapOfSequenceTimeStamp) /
                    this.sequnceTapCount;

                console.log('running at: ', averageSpan);
                this.isRunning = true;
                metronomeIntervalId = setInterval(this.playClick, averageSpan);
                this.beatsPerMinute = 60 / (averageSpan / 1000);
            } else {
                //do not continue with the sequence for now
                this.isRunning = false;
                console.log('sequence timeout');
                this.firstTapOfSequenceTimeStamp = 0;
                this.sequnceTapCount = 0;
            }

            this.playClick();
            this.lastTapTimeStamp = thisTap;
        },
        playClick(): void {
            console.debug('Metronome::playClick');
            this.click = true;

            const audioElement = document.getElementById('soundelement');
            //console.log('AudioElement', audioElement);
            const mediaElement = audioElement as HTMLMediaElement;
            //console.log('mediaElement', mediaElement);
            //const audioCtx = new AudioContext();
            //Create the audio context (must be called after a user interaction to avoid exception)
            if (!audioContext) {
                console.log('creating AudioContext...');
                audioContext = new AudioContext();

                //Prepare the click source
                const track =
                    audioContext.createMediaElementSource(mediaElement);

                //Allow gain control
                gainNode = audioContext.createGain();

                //Wire the chain up
                track.connect(gainNode).connect(audioContext.destination);
            }
            mediaElement.play().then(() => {
                console.debug('playing done');
                this.click = false;
            });
        },
        fade(event: Event): void {
            console.debug('fade');
            gainNode.gain.value = this.volume;
        },
    },
    created() {
        console.log('Metronome::created');
        //const audioCtx = new AudioContext();
    },
    unmounted() {
        //TODO destroy audio context?
        console.log('Metronome::unmounted');
        if (audioContext && audioContext.state !== 'closed') {
            audioContext.close().then(function () {
                console.log('audio contect closed');
            });
        }
    },
});
</script>

<style scoped></style>
