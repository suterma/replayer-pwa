import { openDialog } from 'vue3-promise-dialog';
import ConfirmDialog from '../../components/ConfirmDialog.vue';

/** A simple confirmation function that uses the ConfirmDialog.vue component
 * @param header - What the question is about, shown in the header part of the dialog
 * @param text - The question to confirm, shown in the body part of the dialog
 * @returns A promise of type boolean, according to whether the user has confirmed.
 */
export function confirm(header: string, question: string): Promise<boolean> {
    return openDialog(ConfirmDialog, { question, header });
}
