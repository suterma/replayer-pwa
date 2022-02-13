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
                                :cue="cue"
                                :isTrackPlaying="isPlaying"
                                :currentSeconds="currentSeconds"
                                @click="cueClick(cue)"
                                :isMinified="true"
                                :hasAddonsRight="true"
                            />
                        </p>
                        <!-- Cue Description -->
                        <p
                            class="control fill-available is-flex-grow-5 is-flex-shrink-1"
                        >
                            <input
                                ref="cueDescription"
                                class="input"
                                type="text"
                                v-model="cueData.Description"
                                @change="updateDescription($event.target.value)"
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
                <!-- Duration (keep small and hide on touch)-->
                <div class="level-item is-flex-shrink-1 is-hidden-touch">
                    <p class="has-text-nowrap">
                        <span class="has-opacity-half">{{
                            cueDurationDisplayTime
                        }}</span>
                    </p>
                </div>
                <!-- A rather slim input for the shortcut (a short mnemonic) -->
                <div class="level-item is-flex-shrink-1 is-hidden-touch">
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
    </fieldset>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Cue } from '@/store/compilation-types';
import { ActionTypes } from '@/store/action-types';
import CompilationHandler from '@/store/compilation-handler';
import CueButton from '@/components/CueButton.vue';

/** A button for displaying and invoking a cue
 * @remarks Shows playback progress with an inline progress bar
 */
export default defineComponent({
    name: 'CueLevel',
    components: { CueButton },
    emits: ['click'],
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
        cueClick() {
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

        /** Determines whether this cue is currently selected
         * @remarks Note: only one cue in a compilation may be selected */
        isCueSelected(): boolean {
            return this.$store.getters.selectedCueId == this.cue?.Id;
        },

        /** Gets a cue placeholder denoting the cue's position */
        cuePlaceholder(): string {
            return `Cue at ${CompilationHandler.convertToDisplayTime(
                this.cue.Time,
            )}`;
        },
    },
});
</script>
<style lang="scss" scoped>
/*************************************************************
 * Specific Cue edit level layout
**************************************************************
*/

/** Apply a very small gap between cues */
.levels .level {
    margin-bottom: 1px;
    margin-top: 1px;
}

/** In Edit mode, cue buttons should be gradually be wider on larger screens, to better represent the cue progress */
@media screen and (max-width: 480px) {
    .cue.button {
        /* very narrow on very small screens */
        padding-left: 0;
        padding-right: 0;
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
