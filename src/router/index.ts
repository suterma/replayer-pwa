/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

import {
    createRouter,
    createWebHashHistory,
    isNavigationFailure,
    NavigationFailureType,
    type RouteRecordRaw,
} from 'vue-router';
import MainView from '../views/MainView.vue';
import ResetView from '../views/ResetView.vue';
import DemoView from '../views/DemoView.vue';
import DevelopmentView from '../views/DevelopmentView.vue';

/** A set of route names. */
export enum Route {
    Play = 'play',
    Edit = 'edit',
    Mix = 'mix',
    Setlist = 'setlist',
    Settings = 'settings',
    Reset = 'reset',
    Demo = 'demo',
    About = 'about',
    Development = 'dev',
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
        component: MainView,
    },
    {
        /** The route to the edit mode
         * @remarks The /edit route serves as some form of alias, and supports the reuse of the playback view for editing, too.
         * A real routing alias is not used to distinguish the menu entries for these routes
         */
        path: '/edit',
        name: Route.Edit,
        component: MainView,
    },
    {
        /** The route to the mix mode
         * @remarks The /mix route serves as some form of alias, and supports the reuse of the playback view for mixing, too.
         * A real routing alias is not used to distinguish the menu entries for these routes
         */
        path: '/mix',
        name: Route.Mix,
        component: MainView,
    },
    {
        /** The route to the set list
         * @remarks The /setlist route serves as some form of alias.
         * A real routing alias is not used to distinguish the menu entries for these routes
         */
        path: '/setlist',
        name: Route.Setlist,
        component: MainView,
    },
    {
        /** The route to the settings
         * @remarks The /settings route serves as some form of alias.
         * A real routing alias is not used to distinguish the menu entries for these routes
         */
        path: '/settings',
        name: Route.Settings,
        component: MainView,
    },
    {
        path: '/reset',
        name: Route.Reset,
        component: ResetView,
    },
    {
        /** The route to about
         * @remarks The /about route serves as some form of alias.
         * A real routing alias is not used to distinguish the menu entries for these routes
         */
        path: '/about',
        name: Route.About,
        component: MainView,
    },
    {
        path: '/demo',
        name: Route.Demo,
        component: DemoView,
    },
    {
        path: '/dev',
        name: Route.Development,
        component: DevelopmentView,
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
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
