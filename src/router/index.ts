import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router';
import Play from '../views/Play.vue';
//import TrackPlayer from '../views/TrackPlayer.vue';
//import Home from '../views/Home.vue';
//import List from '../views/List.vue';

const routes: Array<RouteRecordRaw> = [
    { path: '/', redirect: { name: 'Home' } },
    {
        path: '/home',
        name: 'Home',
        //component: Home,

        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "home" */ '../views/Home.vue'),
    },
    {
        /** The route to the playback
         * @remarks This represents the expectedly most used feature, playback of a file or compilation.
         * @devdoc The /edit alias serves as a flag and supports the reuse of the playback view for editing, too.
         * Specific this flag is passed down to components as necessary.
         */
        path: '/play',
        name: 'Play',
        component: Play,
        alias: '/edit',
    },
    {
        path: '/list',
        name: 'List',
        //component: List,

        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
            import(/* webpackChunkName: "list" */ '../views/List.vue'),
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
    // Allow loading of arbitrary files
    { path: '/play/:media*', name: 'apiMedia', component: Play },
    {
        path: '/settings',
        name: 'Settings',
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
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

export default router;
