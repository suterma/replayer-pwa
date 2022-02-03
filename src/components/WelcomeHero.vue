<template>
    <div v-if="showDialog" class="notification is-info">
        <button class="delete" @click="neverShowAgain"></button>
        <div class="content">
            <WelcomeText />
        </div>
    </div>
</template>
<script lang="ts">
import { MutationTypes } from '@/store/mutation-types';
import { defineComponent } from 'vue';
import WelcomeText from '@/components/WelcomeText.vue';
import { settingsMixin } from '@/mixins/settingsMixin';

/** A hero display with a welcome message for a new user
 * @remarks This component can be permanently dismissed
 */
export default defineComponent({
    name: 'WelcomeHero',
    components: { WelcomeText },
    mixins: [settingsMixin],
    data() {
        return {
            /** Whether to show the message this time*/
            showDialog: false,
            /** Whether the checkbox for "never show again" has been checked */
            neverShowAgainChecked: false,
        };
    },
    beforeMount() {
        //Decide whether to actually show this dialog now, before mounting it, to avoid any flicker
        this.showDialog = !this.isNeverShowAgain === true;
    },
    methods: {
        neverShowAgain(): void {
            this.showDialog = false;
            const settings = this.getSettings;

            settings.neverShowWelcomeMessageAgain = true;

            this.$store.commit(MutationTypes.UPDATE_SETTINGS, settings);
        },
    },
    computed: {
        /** Whether the welcome message has been permanently dismissed */
        isNeverShowAgain(): boolean {
            return this.getSettings.neverShowWelcomeMessageAgain;
        },
    },
});
</script>
