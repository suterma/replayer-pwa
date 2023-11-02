import {
    createRouter,
    createWebHashHistory,
    isNavigationFailure,
    NavigationFailureType,
    RouteLocationNormalized,
    RouteRecordRaw,
} from 'vue-router';
import Main from '../views/Main.vue';
import Reset from '../views/Reset.vue';
import Demo from '../views/Demo.vue';
import Development from '../views/Development.vue';
import { useTitle } from '@vueuse/core';
import { useAppStore } from '@/store/app';

/** A set of route names. */
export enum Route {
    Play = 'Play',
    Edit = 'Edit',
    Mix = 'Mix',
    Setlist = 'Setlist',
    Settings = 'Settings',
    Reset = 'Reset',
    Demo = 'Demo',
    About = 'About',
    Development = 'Development',
}

/** The app routes
 * @devdoc route level code-splitting is not used, because it is not supported with ES6/2015
 * Also, the views in Replayer are rather small (especially those rarely used) and would not profit from this anyway.
 */
const routes: Array<RouteRecordRaw> = [
    {
        path: '/',
        redirect: { name: Route.Play },
    },
    {
        /** The route to the playback
         * @remarks This represents the expectedly most used feature, playback of a file or compilation.
         */
        path: '/play',
        name: Route.Play,
        component: Main,
    },
    {
        /** The route to the edit mode
         * @remarks The /edit route serves as some form of alias, and supports the reuse of the playback view for editing, too.
         * A real routing alias is not used to distinguish the menu entries for these routes
         */
        path: '/edit',
        name: Route.Edit,
        component: Main,
    },
    {
        /** The route to the mix mode
         * @remarks The /mix route serves as some form of alias, and supports the reuse of the playback view for mixing, too.
         * A real routing alias is not used to distinguish the menu entries for these routes
         */
        path: '/mix',
        name: Route.Mix,
        component: Main,
    },
    {
        /** The route to the set list
         * @remarks The /setlist route serves as some form of alias.
         * A real routing alias is not used to distinguish the menu entries for these routes
         */
        path: '/setlist',
        name: Route.Setlist,
        component: Main,
    },
    {
        /** The route to the settings
         * @remarks The /setlist route serves as some form of alias.
         * A real routing alias is not used to distinguish the menu entries for these routes
         */
        path: '/settings',
        name: Route.Settings,
        component: Main,
    },
    {
        path: '/reset',
        name: Route.Reset,
        component: Reset,
    },
    {
        /** The route to about
         * @remarks The /about route serves as some form of alias.
         * A real routing alias is not used to distinguish the menu entries for these routes
         */
        path: '/about',
        name: Route.About,
        component: Main,
    },
    {
        path: '/demo',
        name: Route.Demo,
        component: Demo,
    },
    {
        path: '/dev',
        name: Route.Development,
        component: Development,
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

const title = useTitle('Starting');

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

/** Updates the document title, using the current route and compilation title */
export function updateTitle(): void {
    updateTitleForRoute(router.currentRoute.value);
}

router.afterEach((to) => {
    // Update the title, only after navigation (pinia will be installed by now)
    updateTitleForRoute(to);
});

/** Updates the document title, using the given route and compilation title */
function updateTitleForRoute(to: RouteLocationNormalized) {
    const toName = to.name?.toString();
    //on some routes, also display the compilation title
    let compilationInfo = '';
    const app = useAppStore();
    const compilationTitle = app.compilationTitle;
    if (
        compilationTitle &&
        toName &&
        ['Play', 'Edit', 'Mix', 'Setlist'].includes(toName)
    ) {
        compilationInfo = ' | ' + compilationTitle;
    }
    title.value = `${toName}${compilationInfo}`;
}

export default router;
