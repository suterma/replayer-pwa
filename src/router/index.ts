import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Play from '../views/Play.vue';
import { useTitle } from '@vueuse/core';
import { store } from '@/store/store';
import { computed } from 'vue';

//import TrackPlayer from '../views/TrackPlayer.vue';
//import List from '../views/List.vue';

const routes: Array<RouteRecordRaw> = [
    { path: '/', redirect: { name: 'Play' } },
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
         * @remarks The /edit route serves as some form of alias, as a flag, and supports the reuse of the playback view for editing, too.
         * This flag is passed down to components as necessary.
         * A real alias for the play route is not used to distinguish the menu entries for /play and /edit
         */
        path: '/edit',
        name: 'Edit',
        component: Play,
    },
    {
        path: '/playlist',
        name: 'Playlist',
        //component: Playlist,

        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "playlist" */ '../views/Playlist.vue'),
    },
    {
        path: '/setlist',
        name: 'Setlist',
        //component: Setlist,

        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "setlist" */ '../views/Setlist.vue'),
    },
    {
        //HINT: The track player is not accessible from the menu
        path: '/track-player/:id*',
        name: 'Track-Player',

        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(
                /* webpackChunkName: "/track-player/:id*" */ '../views/TrackPlayer.vue'
            ),
    },
    {
        path: '/settings',
        name: 'Settings',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this routeF
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "settings" */ '../views/Settings.vue'),
    },
    {
        path: '/about',
        name: 'About',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "about" */ '../views/About.vue'),
    },
    {
        path: '/demo',
        name: 'Demo',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "demo" */ '../views/Demo.vue'),
    },
    {
        path: '/development',
        name: 'Development',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(
                /* webpackChunkName: "development" */ '../views/Development.vue'
            ),
    },
];

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

/** Use the current route and complilation as the title for the document */
const title = computed(() => {
    let compilationInfo = '';
    const compilationTitle = store.getters.compilation.Title;
    const toName = router.currentRoute.value.name?.toString();
    //on some routes, also display the compilation title
    if (
        compilationTitle &&
        toName &&
        ['Play', 'Edit', 'Setlist'].includes(toName)
    ) {
        compilationInfo = ' | ' + compilationTitle;
    }
    return `${toName}${compilationInfo}`;
});
useTitle(title, {
    titleTemplate: '%s | Replayer',
});

export default router;
