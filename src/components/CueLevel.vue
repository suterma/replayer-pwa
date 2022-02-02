<template>
    <!-- Main container -->
    <div class="level">
        <!-- Left side -->
        <div class="level-left">
            <!-- Play Button -->
            <div class="level-item">
                <p class="control">
                    <button
                        :class="{
                            button: true,
                            cue: true,
                            'has-text-left': 'true',
                            'is-warning': !isCueSelected,
                            'is-success': isCueSelected,
                        }"
                        :id="'cue-' + cue.Id"
                        :title="'Play from ' + cue.Description"
                        @click="cueButtonClicked"
                    >
                        <span class="player-timeline is-fullwidth">
                            <!-- Progress -->
                            <span
                                :class="{
                                    'player-progress': true,
                                    'player-progress-full':
                                        hasCuePassed ||
                                        (percentComplete !== null &&
                                            percentComplete >= 100),
                                    'player-progress-none':
                                        isCueAhead ||
                                        (percentComplete !== null &&
                                            percentComplete <= 0),
                                }"
                                :style="progressStyle"
                            ></span>
                            <!-- PLAY/Skip-Next -->
                            <span class="icon foreground">
                                <i class="mdi mdi-24px">
                                    <svg
                                        style="width: 24px; height: 24px"
                                        viewBox="0 0 24 24"
                                    >
                                        <!-- play -->
                                        <path
                                            v-if="!isTrackPlaying"
                                            fill="currentColor"
                                            d="M8,5.14V19.14L19,12.14L8,5.14Z"
                                        />
                                        <!-- skip-next -->
                                        <path
                                            v-else
                                            fill="currentColor"
                                            d="M16,18H18V6H16M6,18L14.5,12L6,6V18Z"
                                        />
                                    </svg>
                                </i>
                            </span>
                        </span>
                    </button>
                </p>
            </div>

            <!-- Cue Description -->
            <div
                class="level-item fill-available is-flex-grow-5 is-flex-shrink-1"
            >
                <div class="field fill-available">
                    <p class="control">
                        <input
                            ref="cueDescription"
                            class="input"
                            type="text"
                            v-model="cueData.Description"
                            @change="updateDescription($event.target.value)"
                            placeholder="Cue description"
                            size="60"
                        />
                    </p>
                </div>
            </div>
            <!-- at (keep as small as possible)-->
            <div
                class="level-item is-flex-shrink-1 is-flex-grow-0 is-hidden-mobile"
            >
                <p class="has-text-nowrap">
                    <span class="has-opacity-half">at</span>
                </p>
            </div>
            <!-- A rather slim input for the time (in seconds, typically 1 decimal digit) -->
            <div class="level-item is-flex-shrink-1">
                <div class="field">
                    <p class="control">
                        <input
                            class="input"
                            type="number"
                            step="0.1"
                            v-model="cueData.Time"
                            @change="updateTime($event.target.value)"
                            placeholder="time [seconds]"
                            size="8"
                        />
                    </p>
                </div>
            </div>
            <!-- Duration (keep small)-->
            <div
                class="level-item is-flex-shrink-1 is-flex-grow-0 is-hidden-mobile"
            >
                <p class="has-text-nowrap">
                    <span class="has-opacity-half">{{
                        cueDurationDisplayTime
                    }}</span>
                </p>
            </div>
            <!-- A rather slim input for the shortcut (a short mnemonic) -->
            <div class="level-item is-flex-shrink-1">
                <div class="field">
                    <p class="control">
                        <input
                            class="input"
                            type="text"
                            v-model="cueData.Shortcut"
                            @change="updateShortcut($event.target.value)"
                            placeholder="shortcut"
                            size="8"
                        />
                    </p>
                </div>
            </div>
        </div>

        <!-- Right side -->
        <div class="level-right">
            <div class="field">
                <p class="control" title="Trash this cue">
                    <button class="button" @click="deleteCue()">
                        <!-- Trash -->
                        <span class="icon">
                            <i class="mdi mdi-24px">
                                <svg
                                    style="width: 24px; height: 24px"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        fill="currentColor"
                                        d="M9,3V4H4V6H5V19A2,2 0 0,0 7,21H17A2,2 0 0,0 19,19V6H20V4H15V3H9M7,6H17V19H7V6M9,8V17H11V8H9M13,8V17H15V8H13Z"
                                    />
                                </svg>
                            </i>
                        </span>
                    </button>
                </p>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Cue } from '@/store/compilation-types';
import { ActionTypes } from '@/store/action-types';
import CompilationHandler from '@/store/compilation-handler';

/** A button for displaying and invoking a cue
 * @remarks Shows playback progress with an inline progress bar
 */
export default defineComponent({
    name: 'CueLevel',
    components: {},
    emits: ['click'],
    props: {
        cue: {
            type: Cue,
            required: true,
        },
        /** The playback progress in the current track, in [seconds]
         * @remarks This is used for progress display within the set of cues
         */
        currentSeconds: Number,

        /** Indicates whether the associated Track is currently playing
         * @remarks This is used to depict the expected action on button press.
         * While playing, this is pause, and vice versa.
         */
        isTrackPlaying: Boolean,
    },
    data() {
        return {
            cueData: { ...this.cue }, // clone the object
        };
    },
    mounted: function (): void {
        //Track the selection
        if (this.isCueSelected) {
            this.setFocusToDescriptionInput();
        }
    },
    methods: {
        /** Updates the set cue description */
        updateDescription(description: string) {
            const cueId = this.cue.Id;
            const shortcut = this.cueData.Shortcut;
            const time = this.cueData.Time;
            this.$store.dispatch(ActionTypes.UPDATE_CUE_DATA, {
                cueId,
                description,
                shortcut,
                time,
            });
        },
        /** Deletes the cue */
        deleteCue(): void {
            const cueId = this.cue.Id;
            this.$store.dispatch(ActionTypes.DELETE_CUE, cueId);
        },
        /** Updates the set cue time */
        updateTime(time: string) {
            const cueId = this.cue.Id;
            const shortcut = this.cueData.Shortcut;
            const description = this.cueData.Description;
            this.$store.dispatch(ActionTypes.UPDATE_CUE_DATA, {
                cueId,
                description,
                shortcut,
                time,
            });
        },
        /** Updates the set cue shortcut */
        updateShortcut(shortcut: string) {
            const cueId = this.cue.Id;
            const description = this.cueData.Description;
            const time = this.cueData.Time;
            this.$store.dispatch(ActionTypes.UPDATE_CUE_DATA, {
                cueId,
                description,
                shortcut,
                time,
            });
        },
        /** Handles the click event of the cue button */
        cueButtonClicked() {
            this.$emit('click');
            this.setFocusToDescriptionInput();
        },
        /** Sets the focus to the cue description input box */
        setFocusToDescriptionInput() {
            console.debug('focussing to cue', this.cue.Id);
            const cueDescription = this.$refs
                .cueDescription as HTMLInputElement;
            cueDescription.focus();
        },
    },
    watch: {
        /** Track updates to the selected cue and follows the focus to the matching description input.
         * @remarks This helps navigating the cues and updating the description along with it.
         */
        isCueSelected(val, oldVal) {
            if (oldVal == false && val == true) {
                this.setFocusToDescriptionInput();
            }
        },
    },
    computed: {
        /** Converts the cue's duration into a conveniently displayable hh:mm:ss.s format.
         * @remarks Omits the hour part, if not appliccable
         */
        cueDurationDisplayTime(): string {
            const duration = this.cue.Duration;
            return CompilationHandler.convertToDisplayTime(duration);
        },
        /** The playback progress within this cue, in [percent], or null if not appliccable */
        percentComplete(): number | null {
            if (this.hasCuePassed) {
                return 100; //percent
            }
            if (this.isCueAhead) {
                return 0; //percent
            }
            if (this.currentSeconds !== undefined) {
                if (
                    this.cue &&
                    this.cue.Time !== null &&
                    this.cue.Duration !== null
                ) {
                    return (
                        (100 / this.cue.Duration) *
                        (this.currentSeconds - this.cue.Time)
                    );
                }
            }
            return null;
        },
        /** Returns the progress as width style, for use as a css style set, dynamically depending on the actual progress in the cue duration
         * @devdoc max-width makes sure, the progress bar never overflows the given space.
         */
        progressStyle(): any {
            if (this.percentComplete !== null) {
                //show the progress according to the percentage available
                return {
                    width: `calc(${this.percentComplete}%)`,
                    'max-width': '100%',
                };
            } else {
                //percentage is undefined, thus hide the progress
                return {
                    display: `none`,
                };
            }
        },

        /** Determines whether this cue is currently selected
         * @remarks Note: only one cue in a compilation may be selected */
        isCueSelected(): boolean {
            return this.$store.getters.selectedCueId == this.cue?.Id;
        },
        /* Determines whether playback of this cue has already passed */
        hasCuePassed(): boolean {
            if (this.currentSeconds !== undefined) {
                if (
                    this.cue &&
                    this.cue.Time !== null &&
                    this.cue.Duration !== null
                ) {
                    return (
                        this.cue.Time + this.cue.Duration < this.currentSeconds
                    );
                }
            }
            return false;
        },
        /* Determines whether playback of this cue has not yet started */
        isCueAhead(): boolean {
            if (this.currentSeconds !== undefined) {
                if (
                    this.cue &&
                    this.cue.Time !== null &&
                    this.cue.Duration !== null
                ) {
                    return this.currentSeconds < this.cue.Time;
                }
            }
            return false;
        },
    },
});
</script>
<style lang="scss" scoped>
/* //TODO later put these into a scss file for player and progress */
.player-timeline .player-progress {
    /* Smooth progress shade, with no visible border or slider line */
    /** similar to has-opacity-third */
    background-color: rgba(0, 0, 0, 0.33);
    border-right-width: 1px;
    border-right-color: black;
    border-right-style: solid;

    /* Progress shade to appear inside button area (creates outlined style)  */
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;
}

.player-timeline .player-progress.player-progress-full {
    /* 100% Progress shade to appear inside button area (creates outlined style)  */
    border-top-right-radius: 3px;
    border-bottom-right-radius: 3px;
    border-right: none;
}
.player-timeline .player-progress.player-progress-none {
    border-right: none;
}

.player-timeline {
    /** dont use a relative position */
    position: unset;
}

/** Allows to show elements in front of the player-progress background span
   * @devdoc Otherwise, due to unknown reasons, these elements would be shown behind the progress shade, regardless of that they are defined after the progress shade.
   */
.player-timeline .foreground {
    /* //TODO maybe use a similar css directly on the the audio player progress to have the progress bar behind the text there, too */
    position: relative;
    z-index: 2;
}

/*************************************************************
 * Specific Cue edit level layout
**************************************************************
*/

/** Apply a very small gap between cues */
.levels .level {
    margin-bottom: 1px;
    margin-top: 1px;
}

/** In Edit mode, cue buttons should be wider,to better represent the cue progress */
.cue.button {
    padding-left: 3rem;
    padding-right: 3rem;
}

/** Custom modification for the level in the context of a track.
* @remarks Allow the title text (on the left) to break between words, 
* and keep the context items (on the right) as close as reasonably possible */
.level {
    .level-left {
        word-break: break-word;
        /* This basis is set empirically to fit for two elements on the right */
        flex-basis: calc(100% - 80px);

        /* These items should grow, and shrink */
        .level-item {
            flex-shrink: 1;
            flex-grow: 1;
            text-align: left;
            /* Title, always justify left */
            justify-content: left;
        }
    }

    .level-right {
        min-width: 0;

        /* Keep the right hand items (play indicator, expander) as small as possible */
        flex-basis: 0;

        /* These items should keep their size */
        .level-item {
            flex-shrink: 0;
            flex-grow: 0;
            text-align: right;
        }
    }
}
</style>
