import { Settings } from '@/store/state-types';
import { mapGetters } from 'vuex';

export const settingsMixin = {
    computed: {
        /** Get the application settings */
        getSettings(): Settings {
            return this.settings as unknown as Settings;
        },

        ...mapGetters(['settings']),
        //TODO how to get typed settings in the first place?
    },
};
