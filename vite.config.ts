/**
 * @licstart The following is the entire license notice for the
 * JavaScript code in this page
 *
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 *
 * @licend The above is the entire license notice for the
 * JavaScript code in this page
 */

import { fileURLToPath, URL } from 'node:url';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig, type PluginOption } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

//Setting the environment variables
import child_process from 'child_process';
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
    /** Use the modern preprocessor over the default "lecacy" one */
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler', // or "modern"
            },
        },
    },
    build: {
        // Support older browser/os versions
        // See https://replayer.app/en/documentation/compatibility-known-issues
        // for officially supported versions
        target: 'es2015',
        // Since this is FOSS anyway, improve a possible debug experience
        sourcemap: true,

        // NOTE: It seems that minification has resulted in parsing problems on iPadOS
        minify: true,
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
                globPatterns: [
                    /* Replayer VueJs app, including images*/
                    /* For PdfJs, also mjs is included */
                    '**/*.{js,mjs,css,html,ico,png,webp,svg}',
                ],
                /** PdfJs: using the large pdfjs/build/pdf.worker.mjs with precache */
                maximumFileSizeToCacheInBytes: 2500000,
                /** PdfJs: ignoring the file parameter. Otherwise, workbox ends up with reloading index.html */
                /** Cache-busting: ignoring the v parameter. */
                ignoreURLParametersMatching: [/^file$/, /^v$/],
            },
            manifest: {
                name: 'Replayer',
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
                orientation: 'any',
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
                // share_target should be implemented with 137-implement-the-web-share_target-feature
                file_handlers: [
                    {
                        action: '/#/edit',
                        accept: {
                            'application/zip': ['.zip'],
                            'application/octet-stream': ['.zip'],
                            'application/x-zip-compressed': ['.zip'],
                            'binary/octet-stream': ['.zip'],

                            'application/xml': ['.xml'],
                            'text/xml': ['.xml'],

                            'text/plain': ['.txt'],
                            'application/pdf': ['.pdf'],

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
        /** Configure the node polyfills for use with vite.
         * @remarks See https://github.com/davidmyersdev/vite-plugin-node-polyfills
         * @devdoc HINT: stream is used with JSZip
         * @devdoc HINT: Buffer is currently not used (With JSZip, Replayer uses blob)
         */
        nodePolyfills(),
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
