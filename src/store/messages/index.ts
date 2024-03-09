import { defineStore, storeToRefs } from 'pinia';
import { useDebounceFn, useLocalStorage } from '@vueuse/core';
import { type Ref, computed, ref, nextTick } from 'vue';
import { Store } from '..';
import { useSettingsStore } from '../settings';
import { InputFeedback } from './InputFeedback';
import { ProgressMessage } from '@/store/messages/ProgressMessage';
import chalk from 'chalk';
/** A store for messages, that are to be displayed.
 * @devdoc This follows the setup store syntax. See https://pinia.vuejs.org/core-concepts/#setup-stores
 * @devdoc The use of this separate store offloads the message handling from the other stores.
 */
export const useMessageStore = defineStore(Store.Messages, () => {
    /** A style for progress messages, simiar to UI progress display
     */
    const progressStyle = chalk.hex('#aaa').bgHex('#3a3f44');

    /** An application work message stack, used for progress indication
     * @remarks Progress messages are not persisted over app restarts
     * @remarks during ongoing work, the stack is non-empty
     */
    const progressMessageStack = ref(new Array<ProgressMessage>());

    /** An application error message stack, used for error indication
     * @remarks Error messages are not persisted over app restarts
     * @remarks during unacknowledged errors, the stack is non-empty
     */
    const errorMessageStack = ref(new Array<string>());

    /** An application success message stack, used for success indication
     */
    const successMessageStack = useLocalStorage(
        'successMessageStack',
        new Array<string>(),
    );

    /** Initiates the display of a progress message by pushing the message onto the stack of progress messages
     * @remarks Resolves at next tick, after the message had the chance to get displayed
     * in the real DOM.
     */
    function pushProgress(message: string): Promise<void> {
        return new Promise((resolve) => {
            progressMessageStack.value.push(new ProgressMessage(message));
            console.log(progressStyle('PROGRESS: ' + message));
            nextTick(() => {
                resolve();
            });
        });
    }

    /** Initiates the display of a progress message by pushing the message onto the stack of progress messages
     * @remarks Resolves at next tick, after the message had the chance to get displayed
     * in the real DOM.
     */
    function pushProgressWithPercentage(
        progress: ProgressMessage,
    ): Promise<void> {
        return new Promise((resolve) => {
            const index = progressMessageStack.value.findIndex(
                (element) => element.Message == progress.Message,
            );

            // This message was reported previously?
            if (index >= 0) {
                progressMessageStack.value[index] = progress;
            } else {
                console.log(progressStyle('PROGRESS: ' + progress.Message));
                progressMessageStack.value.push(progress);
            }

            nextTick(() => {
                resolve();
            });
        });
    }

    /** Initiates the display of an error message by pushing the message onto the stack of error messages
     * @remarks certain irrelevant or unclear messages are omitted for the display
     */
    function pushError(message: string): void {
        if (
            message !== 'null' &&
            message !== undefined &&
            message !== null &&
            message !== '' &&
            message !== 'undefined: undefined'
        ) {
            errorMessageStack.value.push(message);
        }
        console.error('ERROR: ' + message);
    }

    /** Initiates the display of a success message by pushing the message onto the stack of success messages */
    function pushSuccess(message: string): void {
        successMessageStack.value.push(message);
        console.debug('SUCCESS: ' + message);
        setTimeout(popSuccess, 900);
    }

    /** Ends the display of a previous progress message, by popping the message from the stack of progress messages */
    function popProgress(message: string = ''): void {
        if (message) {
            // remove exactly those messages
            progressMessageStack.value = progressMessageStack.value.filter(
                (e) => !(e.Message == message),
            );
            console.debug(progressStyle('POP_PROGRESS: ' + message));
        } else {
            const poppedMessage = progressMessageStack.value.pop();
            console.debug(progressStyle('POP_PROGRESS: ' + poppedMessage));
        }
    }

    /** Ends the display of a previous error message, by popping the message from the stack of error messages */
    function popError(): void {
        errorMessageStack.value.pop();
    }

    /** Ends the display of a previous success message, by popping the message from the stack of success messages */
    function popSuccess(): void {
        successMessageStack.value.pop();
    }

    /** Ends the display any previous progress message, by clearing all messages from the stack of progress messages */
    function finishProgress(): void {
        progressMessageStack.value.length = 0;
        console.debug('FINISH_PROGRESS');
    }

    /** Gets the latest (newest) progress message from the stack */
    const progressMessage = computed(() => {
        const progressMessage =
            progressMessageStack.value[progressMessageStack.value.length - 1];
        return progressMessage ?? null;
    });

    /** Gets the progress messages from the stack */
    const progressMessages = computed(() => {
        return progressMessageStack.value;
    });

    /** Whether any progress message is available */
    const hasProgressMessage = computed(() => {
        return (
            progressMessageStack.value != null &&
            progressMessageStack.value.length > 0
        );
    });

    /** Gets the latest (newest) error message from the stack */
    const errorMessage = computed(() => {
        const errorMessage =
            errorMessageStack.value[errorMessageStack.value.length - 1];
        return errorMessage ?? null;
    });

    /** Gets the error messages from the stack */
    const errorMessages = computed(() => {
        return errorMessageStack.value;
    });

    /** Whether any error message is available */

    const hasErrorMessages = computed(() => {
        return (
            errorMessageStack.value != null &&
            errorMessageStack.value.length > 0
        );
    });

    /** Gets the latest (newest) success message from the stack */
    const successMessage = computed(() => {
        const successMessage =
            successMessageStack.value[successMessageStack.value.length - 1];
        return successMessage ?? null;
    });

    /** Gets the success messages from the stack */
    const successMessages = computed(() => {
        return successMessageStack.value;
    });

    /** Whether any success message is available */
    const hasSuccessMessages = computed(() => {
        return (
            successMessageStack.value != null &&
            successMessageStack.value.length > 0
        );
    });

    /// --- input feedback ---

    /** An input feedback, used for providing feedback about the input
     * @remarks Input feedbacks are not persisted over app restarts
     */
    const inputFeedback: Ref<InputFeedback | null> = ref(null);

    /** Initiates the presentation of an input feedback
     * @remarks Maintains the given data for a short duration
     * These items are not stacked.
     * @param data The input data. Typically a single or multiple letters, representing received keyboard input.
     * @param action A very short description of the action that the input data represents
     * or what the system expects next, like a terminating key.
     */
    function pushInputFeedback(data: string, action: string): void {
        inputFeedback.value = new InputFeedback(data, action);
        debouncedFn();
    }

    const settings = useSettingsStore();
    const { keyboardShortcutTimeout } = storeToRefs(settings);

    const debouncedFn = useDebounceFn(() => {
        inputFeedback.value = null;
    }, keyboardShortcutTimeout);

    /** Whether any input feedback is available */
    const hasInputFeedback = computed(() => {
        return inputFeedback.value !== null;
    });

    /** Whether the application is busy while updating the route
     * @remarks This is used to visually indicate the busy routing state.
     * It's different from the progress state, visually and technically
     */
    const isBusyRouting = ref(false);

    return {
        pushProgress,
        pushProgressWithPercentage,
        pushError,
        pushSuccess,
        pushInputFeedback,
        popProgress,
        popError,
        popSuccess,
        finishProgress,

        progressMessage,
        progressMessages,
        hasProgressMessage,
        errorMessage,
        errorMessages,
        hasErrorMessages,
        successMessage,
        successMessages,
        hasSuccessMessages,
        inputFeedback,
        hasInputFeedback,
        isBusyRouting,
    };
});
