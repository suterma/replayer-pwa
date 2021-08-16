import { GetterTree } from 'vuex'
import { State } from './state'

export type Getters = {
    tracks(state: State): Array<string>,
    progressMessage(state: State): string
}

export const getters: GetterTree<State, State> & Getters = {
        tracks: (state) => {
            const tracks = state.compilation.filter((track) => track);
            console.debug('store::addTrack: ', tracks);
            return tracks;
        },
        progressMessage: (state) => {
            return state.progressMessage;
        },
      }