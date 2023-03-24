import {
    createRouter,
    createWebHashHistory,
    isNavigationFailure,
    NavigationFailureType,
    RouteRecordRaw,
} from 'vue-router';
import Play from '../views/Play.vue';
import Setlist from '../views/Setlist.vue';
import Settings from '../views/Settings.vue';
import Reset from '../views/Reset.vue';
import About from '../views/About.vue';
import Demo from '../views/Demo.vue';
import Development from '../views/Development.vue';
import { useTitle } from '@vueuse/core';
import { computed } from 'vue';
import { store } from '@/store/store';

/** The app routes
 * @devdoc route level code-splitting is not used, because it is not supported with ES6/2015
 * Also, the views in Replayer are rather small (especially those rarely used) and would not profit from this anyway.
 */
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: { name: 'Play' },
    },
    {
        /** The route to the playback
         * @remarks This represents the expectedly most used feature, playback of a file or compilation.
         */
        path: '/play',
        name: 'Play',
        component: Play,
    },
    {
        /** The route to the edit mode
         * @remarks The /edit route serves as some form of alias, and supports the reuse of the playback view for editing, too.
         * A real routing alias is not used to distinguish the menu entries for these routes
         */
        path: '/edit',
        name: 'Edit',
        component: Play,
    },
    {
        /** The route to the mix mode
         * @remarks The /mix route serves as some form of alias, and supports the reuse of the playback view for mixing, too.
         * A real routing alias is not used to distinguish the menu entries for these routes
         */
        path: '/mix',
        name: 'Mix',
        component: Play,
    },
    {
        path: '/setlist',
        name: 'Setlist',
        component: Setlist,
    },
    {
        path: '/settings',
        name: 'Settings',
        component: Settings,
    },
    {
        path: '/reset',
        name: 'Reset',
        component: Reset,
    },
    {
        path: '/about',
        name: 'About',
        component: About,
    },
    {
        path: '/demo',
        name: 'Demo',
        component: Demo,
    },
    {
        path: '/development',
        name: 'Development',
        component: Development,
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

/** Use the current route and compilation as the title for the document */
const title = computed(() => {
    let compilationInfo = '';
    const compilationTitle = store.getters.compilation?.Title;
    const toName = router.currentRoute.value.name?.toString();
    //on some routes, also display the compilation title
    if (
        compilationTitle &&
        toName &&
        ['Play', 'Edit', 'Mix', 'Setlist'].includes(toName)
    ) {
        compilationInfo = ' | ' + compilationTitle;
    }
    return `${toName}${compilationInfo}`;
});

/**
 *  Show title according new route
 */
useTitle(title, {
    titleTemplate: '%s | Replayer',
});

/**
 *  Log changing of the route
 */
router.afterEach((to, from, failure) => {
    if (isNavigationFailure(failure, NavigationFailureType.duplicated)) {
        // Do not report duplicates
        return;
    }

    if (isNavigationFailure(failure)) {
        console.error(
            `Route change from ${from.path?.toString()} to ${to.path?.toString()} failed`,
        );
    } else {
        console.info(
            `Changed route from ${from.path?.toString()} to ${to.path?.toString()}`,
        );
    }
});

export default router;
