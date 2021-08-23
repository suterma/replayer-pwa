import { MutationTree } from 'vuex';
import {
    Compilation,
    CompilationType,
    ICompilation,
    ITrack,
    Track,
    ICue,
    Cue
} from './compilation-types';
import { MutationTypes } from './mutation-types';
import { State } from './state';
import { MediaFile } from './state-types';

export type Mutations<S = State> = {
    [MutationTypes.SET_PROGRESS_MESSAGE](state: S, payload: string): void;
    [MutationTypes.ADD_TRACK](state: S, payload: string): void;
    [MutationTypes.ADD_FILE_URL](state: S, payload: MediaFile): void;
    /** @devdoc //TODO the playload should be of a to be defined compilation type */
    [MutationTypes.UPDATE_COMPILATION](state: S, payload: any): void;
};

/** @devdoc The XML type contains all properties as arrays, even the singe item ones. This is a limitation of the used XML-To-JS converter */
function UpdateFromXmlCompilation(
    stateCompilation: ICompilation,
    xmlCompilation: any
) {
    if (!stateCompilation) {
        stateCompilation = new Compilation();
    }
    stateCompilation.Type = CompilationType.XML;
    stateCompilation.MediaPath = ''; //TODO from ZIP filename
    stateCompilation.Title = FirstStringOf(xmlCompilation.Title);
    stateCompilation.Url = ''; //TODO from ZIP filename
    stateCompilation.Id = FirstStringOf(xmlCompilation.Id);
    const xmlTracks = xmlCompilation.Tracks[0].Track;
    UpdateFromXmlTracks(stateCompilation.Tracks, xmlTracks);
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
        return array[0] === undefined ? 0 : array[0];
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
        UpdateFromXmlCues(track.Cues,xmlCues);
    });
}


/** @devdoc The XML type contains all properties as arrays, even the singe item ones. This is a limitation of the used XML-To-JS converter */
function UpdateFromXmlCues(stateCues: ICue[], xmlCues: any) {
    if (!stateCues) {
        stateCues = new Array<ICue>();
    }

    xmlCues.forEach((xmlCue: any) => {
        console.debug('parsed: ', xmlCue);
        //TODO Update instead of push, if exists
        const cue = new Cue();
        cue.Description = FirstStringOf(xmlCue.Description);
        cue.Time = FirstNumberOf(xmlCue.Time);
        cue.Id = FirstStringOf(xmlCue.Id);
        cue.Shortcut = FirstStringOf(xmlCue.Shortcut);
        stateCues.push(cue);
    });
}
export const mutations: MutationTree<State> & Mutations = {
    [MutationTypes.SET_PROGRESS_MESSAGE](state, message: string) {
        state.progressMessage = message;
        console.log(message);
    },
    [MutationTypes.ADD_TRACK](state, payload: string) {
        //TODO remove this mutation
        //state.compilation.push(payload);
    },
    [MutationTypes.ADD_FILE_URL](state, payload: MediaFile) {
        state.fileUrls.push(payload);
    },
    /** @devdoc //TODO the playload should be of a to be defined compilation type */
    [MutationTypes.UPDATE_COMPILATION](state, payload: any) {
        //TODO add compilation properties
        console.debug('mutations::UPDATE_COMPILATION:payload', payload);

        //TODO this parsing code should go into a mapping component
        const xmlCompilation = payload.XmlCompilation;
        UpdateFromXmlCompilation(state.compilation, xmlCompilation);
    },
};
