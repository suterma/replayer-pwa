import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';
import vue from '@vitejs/plugin-vue';

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
    plugins: [
        vue(),
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
