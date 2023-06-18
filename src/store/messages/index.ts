import { defineStore } from 'pinia';
import { useLocalStorage } from '@vueuse/core';
import { computed, ref } from 'vue';
import { Store } from '..';

/** A store for messages, that are to be displayed.
 * @devdoc This follows the setup store syntax. See https://pinia.vuejs.org/core-concepts/#setup-stores
 * @devdoc The use of this separate store offloads the message handling from the other stores.
 */
export const useMessageStore = defineStore(Store.Messages, () => {
    /** An application work message stack, used for progress indication
     * @remarks during ongoing work, the stack is non-empty
     */
    const progressMessageStack = useLocalStorage(
        'progressMessageStack',
        new Array<string>(),
    );
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

    /** Initiates the display of a progress message by pushing the message onto the stack of progress messages */
    function pushProgress(message: string): void {
        progressMessageStack.value.push(message);
        console.log('PROGRESS: ' + message);
    }

    /** Initiates the display of an error message by pushing the message onto the stack of error messages */
    function pushError(message: string): void {
        errorMessageStack.value.push(message);
        console.error('ERROR: ' + message);
    }
    /** Ends the display of a previous progress message, by popping the message from the stack of progress messages */
    function popProgress(): void {
        const message = progressMessageStack.value.pop();
        console.debug('POP_PROGRESS: ' + message);
    }

    /** Ends the display of a previous error message, by popping the message from the stack of error messages */
    function popError(): void {
        errorMessageStack.value.pop();
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
        return errorMessageStack.value;
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

    return {
        pushProgress,
        pushError,
        popProgress,
        popError,
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
    };
});
