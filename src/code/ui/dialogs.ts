import { Compilation, Track } from '@/store/compilation-types';
import { openDialog } from 'vue3-promise-dialog';
import ConfirmDialog from '../../components/ConfirmDialog.vue';
import TrackSharingDialog from '../../components/TrackSharingDialog.vue';
import CompilationDownloadDialog from '../../components/CompilationDownloadDialog.vue';

/** A simple confirmation function that uses the ConfirmDialog.vue component
 * @param header - What the question is about, shown in the header part of the dialog
 * @param question - The question to confirm, shown in the body part of the dialog
 * @returns A promise of type boolean, according to whether the user has confirmed.
 */
export function confirm(header: string, question: string): Promise<boolean> {
    return openDialog(ConfirmDialog, { question, header });
}

/** A share action that uses the TrackSharingDialog.vue component
 * @param track - The track that will be shared
 * @returns A promise of type boolean, according to whether the user has confirmed.
 */
export function shareTrack(track: Track): Promise<boolean> {
    return openDialog(TrackSharingDialog, { track });
}

/** A download action that uses the CompilationDownloadDialog.vue component
 * @param compilation - The compilation that will be downloaded
 * @returns A promise of type boolean, according to whether the user has confirmed.
 */
export function downloadCompilation(
    compilation: Compilation,
): Promise<boolean> {
    return openDialog(CompilationDownloadDialog, { compilation });
}
