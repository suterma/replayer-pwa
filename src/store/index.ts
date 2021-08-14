import { TrackOpTypes } from 'vue';
import { createStore } from 'vuex';

export default createStore({
    state: {
        compilation: new Array<string>(),
    },
    getters: {
        tracks: (state) => {
            const tracks = state.compilation.filter((track) => track);
            console.debug('store::addTrack: ', tracks);
            return tracks;
        },
    },
    mutations: {
        addTrack(state, title: string) {
            console.debug('store::addTrack: ', title);
            state.compilation.push(title);
        },
    },
    actions: {},
    modules: {},
});
