import { fileURLToPath, URL } from 'node:url';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, type PluginOption } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

//Setting the environment variables
const child_process = require('child_process');
function git(command: string) {
    return child_process
        .execSync(`git ${command}`, { encoding: 'utf8' })
        .trim();
}
process.env.VITE_APP_VERSION = require('./package.json').version;
process.env.VITE_APP_GIT_VERSION = git('describe --always');
process.env.VITE_APP_GIT_AUTHOR_DATE = git('log -1 --format=%aI');

// https://vitejs.dev/config/
export default defineConfig({
    build: {
        // Support older browser/os versions
        // See https://replayer.app/en/documentation/compatibility-known-issues
        // for officially supported versions
        target: 'es2015',
        // Since this is FOSS anyway, improve a possible debug experience
        sourcemap: true,
    },
    plugins: [
        vue(),
        // Watch and possible reduce bundle size with this visualizer:
        // https://github.com/btd/rollup-plugin-visualizer
        [visualizer() as PluginOption],
        VitePWA({
            devOptions: {
                enabled: true,
            },
            workbox: {
                // Replayer has more than just the js, css and html in the dist folder
                globPatterns: ['**/*.{js,css,html,ico,png,webp,svg}'],
            },
            manifest: {
                name: 'Replayer: Rehearse with playback music',
                short_name: 'Replayer',
                lang: 'en-US',
                description:
                    'Replayer is a free, cue-based media player for rehearsals with playback music. By the click of a button, Replayer starts to play at predefined times in the audio or video file.',
                theme_color: '#3a3f44',
                background_color: '#272b30',
                categories: ['entertainment', 'music', 'productivity'],
                icons: [
                    {
                        src: 'img/icons/android-chrome-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'img/icons/android-chrome-256x256.png',
                        sizes: '256x256',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'img/icons/android-chrome-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any',
                    },
                    {
                        src: 'img/icons/Replayer_App_Icon_maskable_x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                    {
                        src: 'img/icons/Replayer_App_Icon_maskable_x256.png',
                        sizes: '256x256',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                    {
                        src: 'img/icons/Replayer_App_Icon_maskable_x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable',
                    },
                ],
                start_url: '.',
                orientation: 'portrait',
                display: 'standalone',
                display_override: [
                    'window-controls-overlay',
                    'standalone',
                    'browser',
                ],
                protocol_handlers: [
                    {
                        protocol: 'web+music',
                        url: '/#/play?media=%s',
                    },
                ],
                file_handlers: [
                    {
                        action: '/#/edit',
                        accept: {
                            'application/zip': ['.zip', '.rez'],
                            'application/octet-stream': ['.zip', '.rez'],
                            'application/x-zip-compressed': ['.zip', '.rez'],
                            'binary/octet-stream': ['.zip', '.rez'],

                            'application/xml': ['.xml', '.rex'],
                            'text/xml': ['.xml', '.rex'],

                            'text/plain': ['.txt'],

                            'audio/mp3': ['.mp3'],
                            'audio/mpeg': ['.mp3'],
                            'audio/vnd.wave': ['.wave', '.wav'],
                            'audio/wav': ['.wave', '.wav'],
                            'audio/wave': ['.wave', '.wav'],
                            'audio/x-wav': ['.wave', '.wav'],
                            'audio/flac': ['.flac'],
                            'application/ogg': ['.ogg'],
                            'audio/ogg': ['.ogg'],
                            'audio/vorbis': ['.ogg'],
                            'audio/vorbis-config': ['.ogg'],
                            'audio/x-aiff': ['.aiff', '.aif'],
                            'audio/aiff': ['.aiff', '.aif'],
                            'audio/aac': ['.aac', '.m4a'],
                            'video/mp4': ['.mp4', '.m4v'],
                            'video/webm': ['.webm'],
                            'video/ogg': ['.ogv'],
                        },
                    },
                ],
                screenshots: [
                    {
                        label: 'A screenshot of the playback view of Replayer',
                        src: '/img/screenshot/Replayer-featured-graphic.png',
                        type: 'image/png',
                        sizes: '2048x1040',
                    },
                    {
                        label: 'A phone showing the playback view of Replayer',
                        src: '/img/screenshot/Phone-Screenshot1-iphone678plus.png',
                        type: 'image/png',
                        sizes: '1410x2862',
                        form_factor: 'narrow',
                    },
                    {
                        label: 'A phone showing the edit view of Replayer',
                        src: '/img/screenshot/Phone-Screenshot2-iphone678plus.png',
                        type: 'image/png',
                        sizes: '1410x2862',
                        form_factor: 'narrow',
                    },
                    {
                        label: 'A tablet showing the playback view of Replayer',
                        src: '/img/screenshot/Tablet-screenshot1-ipad.png',
                        type: 'image/png',
                        sizes: '2504x1752',
                        form_factor: 'wide',
                    },
                    {
                        label: 'A tablet showing the edit view of Replayer',
                        src: '/img/screenshot/Tablet-screenshot2-ipad.png',
                        type: 'image/png',
                        sizes: '2504x1752',
                        form_factor: 'wide',
                    },
                ],
                related_applications: [],
                shortcuts: [
                    {
                        name: 'Play tracks from a compilation',
                        short_name: 'Play',
                        url: '/#/play',
                        description:
                            'Allows to open a compilation and play tracks from it',
                        icons: [
                            {
                                src: '/img/icons/shortcut-play-icon-96x96.png',
                                sizes: '96x96',
                                type: 'image/png',
                                purpose: 'any',
                            },
                        ],
                    },
                ],
            },
        }),
        /** Configure the polyfills for use with vite.
         * @remarks See https://github.com/davidmyersdev/vite-plugin-node-polyfills
         * @devdoc stream is used with jszip
         */
        nodePolyfills({
            // To add only specific polyfills, add them here. If no option is passed, adds all polyfills
            include: ['stream', 'util', 'timers'],
            // Whether to polyfill specific globals.
            globals: {
                Buffer: true,
            },
        }),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
