import { MutationTree } from 'vuex';
import {
    Compilation,
    CompilationType,
    ICompilation,
    ITrack,
    Track,
    ICue,
    Cue,
} from './compilation-types';
import { MutationTypes } from './mutation-types';
import { State } from './state';
import { MediaFile } from './state-types';
import { v4 as uuidv4 } from 'uuid';
import { PersistentStorage } from './persistent-storage';

export type Mutations<S = State> = {
    [MutationTypes.SET_PROGRESS_MESSAGE](state: S, payload: string): void;
    [MutationTypes.END_PROGRESS](state: S): void;
    [MutationTypes.ADD_FILE_URL](state: S, payload: MediaFile): void;
    /** @devdoc //TODO the playload should be of a to be defined compilation type */
    [MutationTypes.UPDATE_COMPILATION_FROM_XML](state: S, payload: any): void;
    [MutationTypes.UPDATE_COMPILATION_FROM_PLIST](state: S, payload: any): void;
    [MutationTypes.UPDATE_CURRENT_CUE](state: S, payload: Cue): void;
    [MutationTypes.CLOSE_COMPILATION](state: S): void;
    [MutationTypes.UPDATE_NEVER_SHOW_WELCOME_MESSAGE_AGAIN](
        state: S,
        neverShowWelcomeMessageAgain: boolean,
    ): void;
    [MutationTypes.INIT_STORE](state: S): void;
};

/** @devdoc The XML type contains all properties as arrays, even the singe item ones. This is a limitation of the used XML-To-JS converter */
function UpdateFromXmlCompilation(
    stateCompilation: ICompilation,
    xmlCompilation: any,
) {
    if (!stateCompilation) {
        stateCompilation = new Compilation();
    }
    stateCompilation.Type = CompilationType.XML;
    stateCompilation.MediaPath = xmlCompilation.MediaPath;
    stateCompilation.Title = FirstStringOf(xmlCompilation.Title);
    stateCompilation.Url = ''; //TODO from ZIP filename
    stateCompilation.Id = FirstStringOf(xmlCompilation.Id);
    const xmlTracks = xmlCompilation.Tracks[0].Track;
    UpdateFromXmlTracks(stateCompilation.Tracks, xmlTracks);

    PersistentStorage.storeCompilation(stateCompilation);
}

/** @devdoc The PList contains an array of all tracks */
function UpdateFromPListCompilation(
    stateCompilation: ICompilation,
    plistCompilation: any,
) {
    if (!stateCompilation) {
        stateCompilation = new Compilation();
    }
    //NOTE: the plist compilation type does not have all data corresponding to a Replayer compilation. Thus some of the information like the GUID, is just made up    .
    //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
    stateCompilation.Type = CompilationType.XML; //TODO do we need a type here at all?
    stateCompilation.MediaPath = ''.normalize(); //TODO from ZIP filename
    stateCompilation.Title = 'Imported from LivePlayback'.normalize(); //TODO from ZIP filename
    stateCompilation.Url = ''.normalize(); //TODO from ZIP filename
    stateCompilation.Id = uuidv4();
    UpdateFromPlistTracks(stateCompilation.Tracks, plistCompilation);

    PersistentStorage.storeCompilation(stateCompilation);
}

/** Return the first item in the array, if defined. Otherwise, the empty string is returned as a default. */
function FirstStringOf(array: string[]): string {
    if (array) {
        return array[0] === undefined ? '' : array[0];
    }
    return '';
}
/** Return the first item in the array, if defined. Otherwise, the number 0 is returned as a default. */
function FirstNumberOf(array: number[]): number {
    if (array) {
        return Number(array[0] === undefined ? 0 : array[0]);
    }
    return 0;
}

/** @devdoc The XML type contains all properties as arrays, even the singe item ones. This is a limitation of the used XML-To-JS converter */
function UpdateFromXmlTracks(stateTracks: ITrack[], xmlTracks: any) {
    if (!stateTracks) {
        stateTracks = new Array<ITrack>();
    }

    xmlTracks.forEach((xmlTrack: any) => {
        //console.debug('parsed: ', xmlTrack);
        //TODO Update instead of push, if exists
        const track = new Track();
        track.Album = FirstStringOf(xmlTrack.Album);
        track.Artist = FirstStringOf(xmlTrack.Artist);
        track.Id = FirstStringOf(xmlTrack.Id);
        track.Measure = FirstNumberOf(xmlTrack.Measure);
        track.Name = FirstStringOf(xmlTrack.Name);
        track.Url = FirstStringOf(xmlTrack.Url);
        stateTracks.push(track);

        const xmlCues = xmlTrack.Cues[0].Cue;
        UpdateFromXmlCues(track.Cues, xmlCues);
    });
}

function UpdateFromPlistTracks(stateTracks: ITrack[], plistTracks: any[]) {
    if (!stateTracks) {
        stateTracks = new Array<ITrack>();
    }

    plistTracks.forEach((plistTrack: any) => {
        //Only for tracks with real data (LivePlayback may have empty slots in the tracks list)
        if (plistTrack.Duration && plistTrack.Name && plistTrack.Path) {
            //NOTE: the plist compilation type does not have all data corresponding to a Replayer compilation. Thus some of the information like the GUID, is just made up    .
            //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
            //TODO Update instead of push, if exists
            const track = new Track();
            track.Album = ''.normalize();
            track.Artist = ''.normalize();
            track.Id = uuidv4();
            track.Measure = 0;
            track.Name = plistTrack.Name.normalize();
            //URL-Decode because LivePlayback stores file names as URIs
            track.Url = decodeURI(plistTrack.Path).normalize();
            stateTracks.push(track);

            const plistCues = plistTrack.Markers;
            UpdateFromPlistCues(track.Cues, plistCues);
        }
    });
}

/** @devdoc The XML type contains all properties as arrays, even the singe item ones. This is a limitation of the used XML-To-JS converter */
function UpdateFromXmlCues(stateCues: ICue[], xmlCues: any) {
    if (!stateCues) {
        stateCues = new Array<ICue>();
    }

    xmlCues.forEach((xmlCue: any) => {
        //console.debug('parsed: ', xmlCue);
        //TODO Update instead of push, if exists
        //See https://stackoverflow.com/questions/69177720/javascript-compare-two-strings-with-actually-different-encoding about normalize
        const cue = new Cue();
        cue.Description = FirstStringOf(xmlCue.Description).normalize();
        cue.Time = FirstNumberOf(xmlCue.Time);
        cue.Id = FirstStringOf(xmlCue.Id);
        cue.Shortcut = FirstStringOf(xmlCue.Shortcut).normalize();
        stateCues.push(cue);
    });
}

function UpdateFromPlistCues(stateCues: ICue[], plistCues: any[]) {
    if (!stateCues) {
        stateCues = new Array<ICue>();
    }

    plistCues.forEach((plistCue: any) => {
        //NOTE: the plist compilation type does not have all data corresponding to a Replayer compilation. Thus some of the information like the GUID, is just made up    .
        //TODO Update instead of push, if exists
        const cue = new Cue();
        cue.Description = plistCue.Name;
        cue.Time = plistCue.Position;
        cue.Id = uuidv4();
        cue.Shortcut = plistCue.ShortCut;
        stateCues.push(cue);
    });
}

export const mutations: MutationTree<State> & Mutations = {
    [MutationTypes.SET_PROGRESS_MESSAGE](state: State, message: string) {
        state.progressMessageStack.push(message);
        console.log('PROGRESS: ' + message);
    },
    [MutationTypes.END_PROGRESS](state: State) {
        const message = state.progressMessageStack.pop();
        console.debug('END_PROGRESS: ' + message);
    },
    [MutationTypes.ADD_FILE_URL](state: State, payload: MediaFile) {
        //Remove any previously matching
        const matchingFile = state.fileUrls.get(payload.fileName);
        if (matchingFile) {
            console.debug(
                'mutations::ADD_FILE_URL:removing item for key:',
                payload.fileName,
            );
            URL.revokeObjectURL(matchingFile.objectUrl);
            state.fileUrls.delete(payload.fileName);
        }

        //Keep the others and add the new one
        console.debug(
            'mutations::ADD_FILE_URL:adding item for key:',
            payload.fileName,
        );
        state.fileUrls.set(payload.fileName, payload);

        //TODO maybe replace this very simplictic local storage approach with in a more generic way
        //Use file storage api as described here https://stackoverflow.com/a/13983150
        localStorage.setItem(
            'mediafile-' + payload.fileName,
            JSON.stringify(payload),
        );
    },
    /** @devdoc //TODO the playload should be of a to be defined compilation type */
    [MutationTypes.UPDATE_COMPILATION_FROM_XML](state: State, payload: any) {
        console.debug(
            'mutations::UPDATE_COMPILATION_FROM_XML:payload',
            payload,
        );

        //TODO this parsing code should go into a mapping component
        const xmlCompilation = payload.XmlCompilation;
        UpdateFromXmlCompilation(state.compilation, xmlCompilation);
    },
    /** @devdoc //TODO the payload should be of a to be defined compilation type */
    [MutationTypes.UPDATE_COMPILATION_FROM_PLIST](state: State, payload: any) {
        console.debug(
            'mutations::UPDATE_COMPILATION_FROM_PLIST:payload',
            payload,
        );

        //TODO this parsing code should go into a mapping component
        UpdateFromPListCompilation(state.compilation, payload);
    },
    [MutationTypes.UPDATE_CURRENT_CUE](state: State, payload: Cue) {
        state.selectedCue = payload;
        PersistentStorage.storeSelectedCue(payload);
    },

    [MutationTypes.CLOSE_COMPILATION](state: State) {
        PersistentStorage.clearCompilation();

        //File blobs
        //TODO maybe replace this very simplictic local storage approach with in a more generic way
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('mediafile-')) {
                localStorage.removeItem(key);
            }
        }

        state.selectedCue = new Cue();
        state.compilation = new Compilation();

        state.fileUrls.forEach((file) => {
            URL.revokeObjectURL(file.objectUrl);
        });
        state.fileUrls.clear();
    },
    /** Sets whether to never show the welcome message ever again
     * @param state - The vuex state
     * @param neverShowWelcomeMessageAgain - The value for neverShowWelcomeMessageAgain
     */
    [MutationTypes.UPDATE_NEVER_SHOW_WELCOME_MESSAGE_AGAIN](
        state: State,
        neverShowWelcomeMessageAgain: boolean,
    ) {
        console.debug(
            'mutations::UPDATE_NEVER_SHOW_WELCOME_MESSAGE_AGAIN:neverShowWelcomeMessageAgain',
            neverShowWelcomeMessageAgain,
        );
        //TODO maybe replace this very simplictic local storage approach with in a more generic way
        localStorage.setItem(
            'neverShowWelcomeMessageAgain',
            neverShowWelcomeMessageAgain?.toString(),
        );
        state.neverShowWelcomeMessageAgain = neverShowWelcomeMessageAgain;
    },
    [MutationTypes.INIT_STORE](state: State) {
        console.debug('mutations::INIT_STORE:state', state);
        //TODO maybe replace this very simplictic local storage approach with in a more generic way
        const storedNeverShowWelcomeMessageAgain = localStorage.getItem(
            'neverShowWelcomeMessageAgain',
        );
        console.debug(
            'mutations::INIT_STORE:storedNeverShowWelcomeMessageAgain',
            storedNeverShowWelcomeMessageAgain,
        );

        if (storedNeverShowWelcomeMessageAgain) {
            state.neverShowWelcomeMessageAgain =
                storedNeverShowWelcomeMessageAgain == 'true';
        }

        state.compilation = PersistentStorage.retrieveCompilation();
        state.selectedCue = PersistentStorage.retrieveSelectedCue();

        //File blobs
        //TODO maybe replace this very simplictic local storage approach with in a more generic way
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('mediafile-')) {
                const itemx = localStorage.getItem(key);
                if (itemx) {
                    const mediafile = JSON.parse(itemx) as MediaFile;
                    state.fileUrls.set(mediafile.fileName, mediafile);
                }
            }
        }
    },
};
