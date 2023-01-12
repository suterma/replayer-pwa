<template>
    <!-- Main container (disabled when track is not loaded)-->
    <fieldset :disabled="disabled">
        <div class="level is-mobile">
            <!-- Left side -->
            <div class="level-left">
                <!-- Play Button -->
                <div class="level-item">
                    <div class="field has-addons">
                        <p class="control">
                            <CueButton
                                :time="cue.Time"
                                :shortcut="cue.Shortcut"
                                :duration="cue.Duration"                               
                                :isTrackPlaying="isTrackPlaying"
                                :playbackMode="playbackMode"
                                @click="cueClick()"
                                minified
                                :isCueSelected="isCueSelected"
                                :hasCuePassed="hasCuePassed"
                                :isCueAhead="isCueAhead"
                                :percentComplete="percentComplete"
                                hasAddonsRight
                            />
                        </p>
                        <!-- Cue Description -->
                        <p
                            class="control is-flex-grow-5 is-flex-shrink-1"
                            title="Description for this cue"
                        >
                            <input
                                ref="cueDescription"
                                class="input"
                                type="text"
                                inputmode="text"
                                :value="cue.Description"
                                @change="updateDescription($event)"
                                @input="updateDescription($event)"
                                :placeholder="cuePlaceholder"
                                size="60"
                            />
                        </p>
                    </div>
                </div>
                <!-- at (keep as small as possible)-->
                <div
                    class="level-item is-flex-shrink-1 is-flex-grow-0 is-hidden-mobile"
                >
                    <p class="is-single-line">
                        <span class="has-opacity-half">at</span>
                    </p>
                </div>
                <!-- A normal input for the time, with an adjustment add-on (from a bit wider screens)-->
                <div class="level-item is-flex-shrink-1">
                    <div class="field has-addons has-addons-except-mobile">
                        <p class="control">
                            <TimeInput
                                class="input has-text-right"
                                :modelValue="cueTime"
                                @change="updateCueTime"
                                size="8"
                            />
                        </p>
                        <div class="control is-hidden-mobile">
                            <AdjustCueButton
                                @adjustCue="adjustTime()"
                                :isSelectedCue="isCueSelected"
                            ></AdjustCueButton>
                        </div>
                    </div>
                </div>

                <!-- Duration (keep small and hide on touch)-->
                <!-- For performance and layout reasons, only render this when used (emulating is-hidden-touch) -->
                <IfMedia query="(min-width: 1024px)">
                    <div class="level-item is-flex-shrink-1">
                        <p
                            class="is-single-line"
                            title="Duration (until next cue)"
                        >
                            <TimeDisplay
                                class="has-opacity-half"
                                :modelValue="cue.Duration"
                            >
                            </TimeDisplay>
                        </p>
                    </div>
                    <!-- A rather slim input for the shortcut (a short mnemonic) -->
                    <div class="level-item is-flex-shrink-1">
                        <div class="field">
                            <p
                                class="control"
                                title="Mnemonic (as keyboard shortcut)"
                            >
                                <input
                                    class="input"
                                    type="text"
                                    inputmode="numeric"
                                    :value="cue.Shortcut"
                                    @change="updateShortcut($event)"
                                    @input="updateShortcut($event)"
                                    placeholder="shortcut"
                                    size="8"
                                />
                            </p>
                        </div>
                    </div>
                </IfMedia>
            </div>

            <!-- Right side -->
            <div class="level-right">
                <div class="field">
                    <p class="control" title="Trash this cue">
                        <button class="button" @click="deleteCue()">
                            <BaseIcon v-once :path="mdiTrashCanOutline" />
                        </button>
                    </p>
                </div>
            </div>
        </div>
    </fieldset>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Cue, PlaybackMode } from '@/store/compilation-types';
import { ActionTypes } from '@/store/action-types';
import CompilationHandler from '@/store/compilation-handler';
import CueButton from '@/components/buttons/CueButton.vue';
import AdjustCueButton from '@/components/buttons/AdjustCueButton.vue';
import BaseIcon from '@/components/icons/BaseIcon.vue';
import TimeDisplay from './TimeDisplay.vue';
import TimeInput from '@/components/TimeInput.vue';
import IfMedia from '@/components/IfMedia.vue';
import { mdiTrashCanOutline } from '@mdi/js';

/** An Editor for for a single cue
 * @remarks Shows a cue button with an inline progress bar, plus input fields for all properties
 * @devdoc Input value binding is not implemented with a two-way v-model binding because the incoming values are taken
 * from a property (where setting of values is not permitted).
 * Instead, the values are one-way bound via :value and changes are directly stored in the state via Vuex mutations.
 * This approach is chosen over the ...data pattern because the shortcut values can also change from a menu entry
 * in the track's dropdown menu.
 */
export default defineComponent({
    name: 'CueLevelEditor',
    components: {
        CueButton,
        AdjustCueButton,
        BaseIcon,
        TimeDisplay,
        TimeInput,
        IfMedia,
    },
    emits: ['click', 'play'],
    props: {
        cue: {
            type: Cue,
            required: true,
        },
        disabled: {
            type: Boolean,
            required: false,
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
        /** The playback mode
         * @devdoc casting the type for ts, see https://github.com/kaorun343/vue-property-decorator/issues/202#issuecomment-931484979
         */
        playbackMode: {
            type: String as () => PlaybackMode,
            required: true,
        },
    },
    data() {
        return {         
            /** Icons from @mdi/js */
            mdiTrashCanOutline: mdiTrashCanOutline,
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
        updateDescription(event: Event) {
            const cueId = this.cue.Id;
            const shortcut = this.cue.Shortcut;
            const time = this.cue.Time;
            const description = (event.target as HTMLInputElement).value;
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
        updateCueTime(time: number | null) {
            const cueId = this.cue.Id;
            const shortcut = this.cue.Shortcut;
            const description = this.cue.Description;
            this.$store.dispatch(ActionTypes.UPDATE_CUE_DATA, {
                cueId,
                description,
                shortcut,
                time,
            });

            //Also , for user convenience, to simplify adjusting cues, play at change
            //(while keeping the focus at the number spinner)
            if (Number.isFinite(time)) {
                this.$emit('play');
            }
        },
        /** Adjusts the time of the cue to the current playback time */
        adjustTime() {
            if (
                this.currentSeconds !== undefined &&
                Number.isFinite(this.currentSeconds)
            ) {
                const time = CompilationHandler.roundTime(this.currentSeconds);
                const cueId = this.cue.Id;
                const shortcut = this.cue.Shortcut;
                const description = this.cue.Description;
                this.$store.dispatch(ActionTypes.UPDATE_CUE_DATA, {
                    cueId,
                    description,
                    shortcut,
                    time,
                });
            }
        },
        /** Updates the set cue shortcut */
        updateShortcut(event: Event) {
            const cueId = this.cue.Id;
            const description = this.cue.Description;
            const time = this.cue.Time;
            const shortcut = (event.target as HTMLInputElement).value;
            this.$store.dispatch(ActionTypes.UPDATE_CUE_DATA, {
                cueId,
                description,
                shortcut,
                time,
            });
        },
        /** Handles the click event of the cue button */
        cueClick() {
            this.$emit('click');
        },

        /** Sets the focus to the cue description input box
         */
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
                    this.cueTime !== null &&
                    this.cue.Duration !== null &&
                    Number.isFinite(this.cueTime) &&
                    Number.isFinite(this.cue.Duration)
                ) {
                    return (
                        this.cueTime + this.cue.Duration <= this.currentSeconds
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
                    this.cueTime !== null &&
                    Number.isFinite(this.cueTime)
                ) {
                    return this.currentSeconds < this.cueTime;
                }
            }
            return false;
        },
        /** The playback progress within this cue, in [percent], or zero if not applicable */
        percentComplete(): number | null {
            if (this.currentSeconds !== undefined) {
                if (
                    this.cue &&
                    this.cueTime !== null &&
                    this.cue.Duration !== null &&
                    Number.isFinite(this.cueTime) &&
                    Number.isFinite(this.cue.Duration) &&
                    !this.isCueAhead &&
                    !this.hasCuePassed
                ) {
                    return (
                        (100 / this.cue.Duration) *
                        (this.currentSeconds - this.cueTime)
                    );
                }
                return null;
            }
            return null;
        },

        /** Gets a cue placeholder denoting the cue's position */
        cuePlaceholder(): string {
            return `Cue description`;
        },
        /** Gets the cue's time
         * @devdoc provided as performance optimization, to allow render checks directly on this value, not via the cue object
         */
        cueTime(): number | null {
            return this.cue.Time;
        },
    },
});
</script>
<style lang="scss" scoped>
/*************************************************************
 * Specific Cue edit level layout
**************************************************************
*/

/** Apply a very small vertical gap between cues */
.levels .level {
    margin-bottom: 1px;
    margin-top: 1px;
}

/** In Edit mode, cue buttons should be gradually be wider on larger screens, to better represent the cue progress */
@media screen and (max-width: 480px) {
    .cue.button {
        /* very narrow on very small screens */
        padding-left: 3px;
        padding-right: 3px;
    }
}

@media screen and (min-width: 769px) {
    .cue.button {
        padding-left: 3rem;
        padding-right: 3rem;
    }
}
@media screen and (min-width: 1024px) {
    .cue.button {
        padding-left: 4rem;
        padding-right: 4rem;
    }
}

/** Modifies a component with addons, when the addons are hidden on mobile viewport width (using .has-addons-except-mobile) */
.field.has-addons.has-addons-except-mobile
    .control:first-child:not(:only-child)
    .button,
.field.has-addons.has-addons-except-mobile
    .control:first-child:not(:only-child)
    .input,
.field.has-addons.has-addons-except-mobile
    .control:first-child:not(:only-child)
    .select
    select {
    border-bottom-right-radius: 4px;
    border-top-right-radius: 4px;
}

/** Custom modification for the cue level.
*/
.level {
    .level-left {
        /* This basis is set empirically to fit for one button element, plus 0.75rem margin, on the right */
        flex-basis: calc(100% - 40px - 0.75rem);

        /* These items should grow, and shrink */
        .level-item {
            flex-shrink: 1;
            flex-grow: 1;
            /* Items always justify left */
            justify-content: left;
        }
    }

    .level-right {
        /* Keep the right hand items small */
        flex-basis: 0;
    }
}
</style>
