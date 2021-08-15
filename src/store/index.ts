import { TrackOpTypes } from 'vue';
import { createStore } from 'vuex';

export default createStore({
    state: {
        compilation: new Array<string>(),
        progressMessage: '',
    },
    getters: {
        tracks: (state) => {
            const tracks = state.compilation.filter((track) => track);
            console.debug('store::addTrack: ', tracks);
            return tracks;
        },
        progressMessage: (state) => {
            return state.progressMessage;
        },
    },
    mutations: {
        addTrack(state, title: string) {
            console.debug('store::addTrack: ', title);
            state.compilation.push(title);
        },
        setProgressMessage(state, message: string) {
            console.debug('store::setProgressMessage: ', message);
            state.progressMessage = message;
        },
    },
    actions: {},
    modules: {},
});
