/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import type { Compilation } from '@/store/Compilation';
import type { ICue } from '@/store/ICue';
import type { ITrack } from '@/store/ITrack';
//@ts-ignore (because the vue3-promise-dialog does not provide types)
import { openDialog } from 'vue3-promise-dialog';
import ConfirmDialog from '../../components/dialogs/ConfirmDialog.vue';
import NewVersionDialog from '../../components/dialogs/NewVersionDialog.vue';
import TrackSharingDialog from '../../components/dialogs/TrackSharingDialog.vue';
import AddTextCuesDialog from '../../components/dialogs/AddTextCuesDialog.vue';
import CompilationDownloadDialog from '../../components/dialogs/CompilationDownloadDialog.vue';
import YouTubeConsentDialog from '../../components/dialogs/YouTubeConsentDialog.vue';

/** A simple confirmation function that uses the ConfirmDialog.vue component
 * @param header - What the question is about, shown in the header part of the dialog
 * @param question - The question to confirm, shown in the body part of the dialog
 * @returns A promise of type boolean, according to whether the user has confirmed.
 */
export function confirm(header: string, question: string): Promise<boolean> {
    return openDialog(ConfirmDialog, { question, header });
}

/** A new version announcement/acknowledgement function that uses the NewVersionDialog.vue component
 * @returns A promise of type boolean, according to whether the user has confirmed.
 */
export function acknowledgeVersion(
    version: string,
    updateText: string,
): Promise<boolean> {
    return openDialog(NewVersionDialog, { version, updateText });
}

/** A share action that uses the TrackSharingDialog.vue component
 * @param track - The track that will be shared
 * @returns A promise of type boolean, according to whether the user has confirmed.
 */
export function shareTrack(track: ITrack): Promise<boolean> {
    return openDialog(TrackSharingDialog, { track });
}

/** A text input that creates a cue per line, using the AddTextCuesDialog.vue component
 * @returns A promise of a set of cues that the user will provide.
 */
export function addTextCues(track: ITrack): Promise<ICue[]> {
    return openDialog(AddTextCuesDialog, { track });
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

/** A consent dialog for accessing YouTube content
 * @returns A promise of type boolean, according to whether the user has confirmed consent.
 */
export function consentYouTube(): Promise<boolean> {
    return openDialog(YouTubeConsentDialog, {});
}
