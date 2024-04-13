/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

var __getOwnPropNames = Object.getOwnPropertyNames;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};

// package.json
var require_package = __commonJS({
  "package.json"(exports, module) {
    module.exports = {
      name: "replayer",
      version: "2.3.0",
      description: "Replayer is a free, cue-based media player for rehearsals with playback music. By the click of a button, Replayer starts to play at predefined times in the audio or video file.",
      homepage: "https://replayer.app",
      main: "./public/index.html",
      type: "module",
      private: true,
      keywords: [
        "mp3, wav, ogg, flac, aiff, aac, player, start, point, time, button, click, link, music, file, voice, choir, singer, solo, song, software, app, free, fast, simple, Spotify, YouTube, Vimeo, SoundCloud, SATB, Soprano, Alto, Tenor, Bass, drum, track, entertainer, dancer"
      ],
      author: {
        name: "Marcel Suter",
        email: "replayer.app@marcelsuter.ch",
        url: "https://marcelsuter.ch"
      },
      license: "AGPL-3.0-or-later",
      scripts: {
        "css-build": "sass --no-source-map sass/replayer.scss public/css/replayer.css",
        "css-watch": "npm run css-build -- --watch",
        start: "npm run css-watch",
        dev: "vite",
        build: "npm run type-check && npm run build-only",
        preview: "vite preview",
        "test:unit": "vitest",
        "test:e2e": "start-server-and-test preview http://localhost:4173 'cypress run --e2e'",
        "test:e2e:dev": "start-server-and-test 'vite dev --port 4173' http://localhost:4173 'cypress open --e2e'",
        "build-only": "vite build",
        "type-check": "vue-tsc --noEmit -p tsconfig.vitest.json --composite false",
        lint: "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
        format: "prettier --write src/"
      },
      dependencies: {
        "@mdi/js": "^7.4.47",
        "@simolation/vue-hotkey": "^2.0.1",
        "@vue-youtube/core": "^0.0.6",
        "@vueuse/components": "^10.7.2",
        "@vueuse/core": "^10.7.2",
        "@vueuse/integrations": "^10.7.2",
        chalk: "^5.3.0",
        "click-outside-vue3": "^4.0.1",
        "compare-versions": "^6.0.0",
        "file-saver": "^2.0.5",
        "focus-trap": "^7.5.4",
        jszip: "^3.10.1",
        konva: "^9.3.2",
        localforage: "^1.10.0",
        "lodash-es": "^4.17.21",
        "nosleep.js": "^0.12.0",
        pinia: "^2.1.7",
        "sub-events": "^1.9.0",
        uuid: "^8.3.2",
        vue: "^3.4.15",
        "vue-audio-level-meter": "^1.1.6",
        "vue-global-events": "^2.1.1",
        "vue-peaks": "^2.0.2",
        "vue-router": "^4.2.5",
        "vue-scrollto": "^2.20.0",
        "vue3-promise-dialog": "^0.3.4",
        vuedraggable: "^4.1.0",
        "waveform-data": "^4.5.0",
        xml2js: "^0.6.2"
      },
      devDependencies: {
        "@creativebulma/bulma-tooltip": "^1.2.0",
        "@rushstack/eslint-patch": "^1.7.2",
        "@tsconfig/node18": "^18.2.2",
        "@types/jsdom": "^21.1.6",
        "@types/lodash": "^4.14.202",
        "@types/node": "^18.18.5",
        "@types/uuid": "^9.0.7",
        "@types/xml2js": "^0.4.14",
        "@vitejs/plugin-vue": "^5.0.3",
        "@vue/eslint-config-prettier": "^9.0.0",
        "@vue/eslint-config-typescript": "^13.0.0",
        "@vue/test-utils": "^2.4.4",
        "@vue/tsconfig": "^0.5.1",
        bulma: "^0.9.4",
        "bulma-print": "^1.0.1",
        "bulma-slider": "^2.0.5",
        bulmaswatch: "^0.8.1",
        cypress: "^13.6.3",
        eslint: "^8.57.0",
        "eslint-plugin-cypress": "^2.15.1",
        "eslint-plugin-license-header": "^0.6.0",
        "eslint-plugin-vue": "^9.20.1",
        jsdom: "^24.0.0",
        prettier: "^3.2.4",
        "rollup-plugin-visualizer": "^5.12.0",
        sass: "^1.50.0",
        "sass-loader": "^10.2.1",
        "start-server-and-test": "^2.0.3",
        typescript: "^5.4.2",
        "typescript-eslint": "^7.3.1",
        vite: "^5.0.12",
        "vite-plugin-node-polyfills": "^0.21.0",
        "vite-plugin-pwa": "^0.17.5",
        vitest: "^1.2.2",
        "vue-tsc": "^1.8.27"
      },
      bugs: {
        url: "https://github.com/suterma/replayer-pwa/issues"
      },
      repository: {
        type: "git",
        url: "https://github.com/suterma/replayer-pwa.git"
      }
    };
  }
});

// vitest.config.ts
import { fileURLToPath as fileURLToPath2 } from "node:url";
import { mergeConfig, defineConfig as defineConfig2, configDefaults } from "file:///D:/masu-data/github-suterma/replayer-pwa/node_modules/vitest/dist/config.js";

// vite.config.ts
import { fileURLToPath, URL as URL2 } from "node:url";
import { nodePolyfills } from "file:///D:/masu-data/github-suterma/replayer-pwa/node_modules/vite-plugin-node-polyfills/dist/index.js";
import vue from "file:///D:/masu-data/github-suterma/replayer-pwa/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { VitePWA } from "file:///D:/masu-data/github-suterma/replayer-pwa/node_modules/vite-plugin-pwa/dist/index.js";
import { defineConfig } from "file:///D:/masu-data/github-suterma/replayer-pwa/node_modules/vite/dist/node/index.js";
import { visualizer } from "file:///D:/masu-data/github-suterma/replayer-pwa/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import child_process from "child_process";
var __vite_injected_original_import_meta_url = "file:///D:/masu-data/github-suterma/replayer-pwa/vite.config.ts";
function git(command) {
  return child_process.execSync(`git ${command}`, { encoding: "utf8" }).trim();
}
process.env.VITE_APP_VERSION = require_package().version;
process.env.VITE_APP_GIT_VERSION = git("describe --always");
process.env.VITE_APP_GIT_AUTHOR_DATE = git("log -1 --format=%aI");
var vite_config_default = defineConfig({
  build: {
    // Support older browser/os versions
    // See https://replayer.app/en/documentation/compatibility-known-issues
    // for officially supported versions
    target: "es2015",
    // Since this is FOSS anyway, improve a possible debug experience
    sourcemap: true,
    // NOTE: It seems that minification has resulted in parsing problems on iPadOS
    minify: true
  },
  plugins: [
    vue(),
    // Watch and possible reduce bundle size with this visualizer:
    // https://github.com/btd/rollup-plugin-visualizer
    [visualizer()],
    VitePWA({
      devOptions: {
        enabled: true
      },
      workbox: {
        // Replayer has more than just the js, css and html in the dist folder
        globPatterns: ["**/*.{js,css,html,ico,png,webp,svg}"]
      },
      manifest: {
        name: "Replayer",
        short_name: "Replayer",
        lang: "en-US",
        description: "Replayer is a free, cue-based media player for rehearsals with playback music. By the click of a button, Replayer starts to play at predefined times in the audio or video file.",
        theme_color: "#3a3f44",
        background_color: "#272b30",
        categories: ["entertainment", "music", "productivity"],
        icons: [
          {
            src: "img/icons/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "img/icons/android-chrome-256x256.png",
            sizes: "256x256",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "img/icons/android-chrome-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "img/icons/Replayer_App_Icon_maskable_x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "img/icons/Replayer_App_Icon_maskable_x256.png",
            sizes: "256x256",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "img/icons/Replayer_App_Icon_maskable_x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],
        start_url: ".",
        orientation: "portrait",
        display: "standalone",
        display_override: [
          "window-controls-overlay",
          "standalone",
          "browser"
        ],
        protocol_handlers: [
          {
            protocol: "web+music",
            url: "/#/play?media=%s"
          }
        ],
        // share_target should be implemented with 137-implement-the-web-share_target-feature
        file_handlers: [
          {
            action: "/#/edit",
            accept: {
              "application/zip": [".zip", ".rez"],
              "application/octet-stream": [".zip", ".rez"],
              "application/x-zip-compressed": [".zip", ".rez"],
              "binary/octet-stream": [".zip", ".rez"],
              "application/xml": [".xml", ".rex"],
              "text/xml": [".xml", ".rex"],
              "text/plain": [".txt"],
              "audio/mp3": [".mp3"],
              "audio/mpeg": [".mp3"],
              "audio/vnd.wave": [".wave", ".wav"],
              "audio/wav": [".wave", ".wav"],
              "audio/wave": [".wave", ".wav"],
              "audio/x-wav": [".wave", ".wav"],
              "audio/flac": [".flac"],
              "application/ogg": [".ogg"],
              "audio/ogg": [".ogg"],
              "audio/vorbis": [".ogg"],
              "audio/vorbis-config": [".ogg"],
              "audio/x-aiff": [".aiff", ".aif"],
              "audio/aiff": [".aiff", ".aif"],
              "audio/aac": [".aac", ".m4a"],
              "video/mp4": [".mp4", ".m4v"],
              "video/webm": [".webm"],
              "video/ogg": [".ogv"]
            }
          }
        ],
        screenshots: [
          {
            label: "A screenshot of the playback view of Replayer",
            src: "/img/screenshot/Replayer-featured-graphic.png",
            type: "image/png",
            sizes: "2048x1040"
          },
          {
            label: "A phone showing the playback view of Replayer",
            src: "/img/screenshot/Phone-Screenshot1-iphone678plus.png",
            type: "image/png",
            sizes: "1410x2862",
            form_factor: "narrow"
          },
          {
            label: "A phone showing the edit view of Replayer",
            src: "/img/screenshot/Phone-Screenshot2-iphone678plus.png",
            type: "image/png",
            sizes: "1410x2862",
            form_factor: "narrow"
          },
          {
            label: "A tablet showing the playback view of Replayer",
            src: "/img/screenshot/Tablet-screenshot1-ipad.png",
            type: "image/png",
            sizes: "2504x1752",
            form_factor: "wide"
          },
          {
            label: "A tablet showing the edit view of Replayer",
            src: "/img/screenshot/Tablet-screenshot2-ipad.png",
            type: "image/png",
            sizes: "2504x1752",
            form_factor: "wide"
          }
        ],
        related_applications: [],
        shortcuts: [
          {
            name: "Play tracks from a compilation",
            short_name: "Play",
            url: "/#/play",
            description: "Allows to open a compilation and play tracks from it",
            icons: [
              {
                src: "/img/icons/shortcut-play-icon-96x96.png",
                sizes: "96x96",
                type: "image/png",
                purpose: "any"
              }
            ]
          }
        ]
      }
    }),
    /** Configure the node polyfills for use with vite.
     * @remarks See https://github.com/davidmyersdev/vite-plugin-node-polyfills
     * @devdoc HINT: stream is used with JSZip
     * @devdoc HINT: Buffer is currently not used (With JSZip, Replayer uses blob)
     */
    nodePolyfills()
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL2("./src", __vite_injected_original_import_meta_url))
    }
  }
});

// vitest.config.ts
var __vite_injected_original_import_meta_url2 = "file:///D:/masu-data/github-suterma/replayer-pwa/vitest.config.ts";
var vitest_config_default = mergeConfig(
  vite_config_default,
  defineConfig2({
    test: {
      environment: "jsdom",
      exclude: [...configDefaults.exclude, "e2e/*"],
      root: fileURLToPath2(new URL("./", __vite_injected_original_import_meta_url2))
    }
  })
);
export {
  vitest_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsicGFja2FnZS5qc29uIiwgInZpdGVzdC5jb25maWcudHMiLCAidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIntcclxuICAgIFwibmFtZVwiOiBcInJlcGxheWVyXCIsXHJcbiAgICBcInZlcnNpb25cIjogXCIyLjMuMFwiLFxyXG4gICAgXCJkZXNjcmlwdGlvblwiOiBcIlJlcGxheWVyIGlzIGEgZnJlZSwgY3VlLWJhc2VkIG1lZGlhIHBsYXllciBmb3IgcmVoZWFyc2FscyB3aXRoIHBsYXliYWNrIG11c2ljLiBCeSB0aGUgY2xpY2sgb2YgYSBidXR0b24sIFJlcGxheWVyIHN0YXJ0cyB0byBwbGF5IGF0IHByZWRlZmluZWQgdGltZXMgaW4gdGhlIGF1ZGlvIG9yIHZpZGVvIGZpbGUuXCIsXHJcbiAgICBcImhvbWVwYWdlXCI6IFwiaHR0cHM6Ly9yZXBsYXllci5hcHBcIixcclxuICAgIFwibWFpblwiOiBcIi4vcHVibGljL2luZGV4Lmh0bWxcIixcclxuICAgIFwidHlwZVwiOiBcIm1vZHVsZVwiLFxyXG4gICAgXCJwcml2YXRlXCI6IHRydWUsXHJcbiAgICBcImtleXdvcmRzXCI6IFtcclxuICAgICAgICBcIm1wMywgd2F2LCBvZ2csIGZsYWMsIGFpZmYsIGFhYywgcGxheWVyLCBzdGFydCwgcG9pbnQsIHRpbWUsIGJ1dHRvbiwgY2xpY2ssIGxpbmssIG11c2ljLCBmaWxlLCB2b2ljZSwgY2hvaXIsIHNpbmdlciwgc29sbywgc29uZywgc29mdHdhcmUsIGFwcCwgZnJlZSwgZmFzdCwgc2ltcGxlLCBTcG90aWZ5LCBZb3VUdWJlLCBWaW1lbywgU291bmRDbG91ZCwgU0FUQiwgU29wcmFubywgQWx0bywgVGVub3IsIEJhc3MsIGRydW0sIHRyYWNrLCBlbnRlcnRhaW5lciwgZGFuY2VyXCJcclxuICAgIF0sXHJcbiAgICBcImF1dGhvclwiOiB7XHJcbiAgICAgICAgXCJuYW1lXCI6IFwiTWFyY2VsIFN1dGVyXCIsXHJcbiAgICAgICAgXCJlbWFpbFwiOiBcInJlcGxheWVyLmFwcEBtYXJjZWxzdXRlci5jaFwiLFxyXG4gICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9tYXJjZWxzdXRlci5jaFwiXHJcbiAgICB9LFxyXG4gICAgXCJsaWNlbnNlXCI6IFwiQUdQTC0zLjAtb3ItbGF0ZXJcIixcclxuICAgIFwic2NyaXB0c1wiOiB7XHJcbiAgICAgICAgXCJjc3MtYnVpbGRcIjogXCJzYXNzIC0tbm8tc291cmNlLW1hcCBzYXNzL3JlcGxheWVyLnNjc3MgcHVibGljL2Nzcy9yZXBsYXllci5jc3NcIixcclxuICAgICAgICBcImNzcy13YXRjaFwiOiBcIm5wbSBydW4gY3NzLWJ1aWxkIC0tIC0td2F0Y2hcIixcclxuICAgICAgICBcInN0YXJ0XCI6IFwibnBtIHJ1biBjc3Mtd2F0Y2hcIixcclxuICAgICAgICBcImRldlwiOiBcInZpdGVcIixcclxuICAgICAgICBcImJ1aWxkXCI6IFwibnBtIHJ1biB0eXBlLWNoZWNrICYmIG5wbSBydW4gYnVpbGQtb25seVwiLFxyXG4gICAgICAgIFwicHJldmlld1wiOiBcInZpdGUgcHJldmlld1wiLFxyXG4gICAgICAgIFwidGVzdDp1bml0XCI6IFwidml0ZXN0XCIsXHJcbiAgICAgICAgXCJ0ZXN0OmUyZVwiOiBcInN0YXJ0LXNlcnZlci1hbmQtdGVzdCBwcmV2aWV3IGh0dHA6Ly9sb2NhbGhvc3Q6NDE3MyAnY3lwcmVzcyBydW4gLS1lMmUnXCIsXHJcbiAgICAgICAgXCJ0ZXN0OmUyZTpkZXZcIjogXCJzdGFydC1zZXJ2ZXItYW5kLXRlc3QgJ3ZpdGUgZGV2IC0tcG9ydCA0MTczJyBodHRwOi8vbG9jYWxob3N0OjQxNzMgJ2N5cHJlc3Mgb3BlbiAtLWUyZSdcIixcclxuICAgICAgICBcImJ1aWxkLW9ubHlcIjogXCJ2aXRlIGJ1aWxkXCIsXHJcbiAgICAgICAgXCJ0eXBlLWNoZWNrXCI6IFwidnVlLXRzYyAtLW5vRW1pdCAtcCB0c2NvbmZpZy52aXRlc3QuanNvbiAtLWNvbXBvc2l0ZSBmYWxzZVwiLFxyXG4gICAgICAgIFwibGludFwiOiBcImVzbGludCAuIC0tZXh0IC52dWUsLmpzLC5qc3gsLmNqcywubWpzLC50cywudHN4LC5jdHMsLm10cyAtLWZpeCAtLWlnbm9yZS1wYXRoIC5naXRpZ25vcmVcIixcclxuICAgICAgICBcImZvcm1hdFwiOiBcInByZXR0aWVyIC0td3JpdGUgc3JjL1wiXHJcbiAgICB9LFxyXG4gICAgXCJkZXBlbmRlbmNpZXNcIjoge1xyXG4gICAgICAgIFwiQG1kaS9qc1wiOiBcIl43LjQuNDdcIixcclxuICAgICAgICBcIkBzaW1vbGF0aW9uL3Z1ZS1ob3RrZXlcIjogXCJeMi4wLjFcIixcclxuICAgICAgICBcIkB2dWUteW91dHViZS9jb3JlXCI6IFwiXjAuMC42XCIsXHJcbiAgICAgICAgXCJAdnVldXNlL2NvbXBvbmVudHNcIjogXCJeMTAuNy4yXCIsXHJcbiAgICAgICAgXCJAdnVldXNlL2NvcmVcIjogXCJeMTAuNy4yXCIsXHJcbiAgICAgICAgXCJAdnVldXNlL2ludGVncmF0aW9uc1wiOiBcIl4xMC43LjJcIixcclxuICAgICAgICBcImNoYWxrXCI6IFwiXjUuMy4wXCIsXHJcbiAgICAgICAgXCJjbGljay1vdXRzaWRlLXZ1ZTNcIjogXCJeNC4wLjFcIixcclxuICAgICAgICBcImNvbXBhcmUtdmVyc2lvbnNcIjogXCJeNi4wLjBcIixcclxuICAgICAgICBcImZpbGUtc2F2ZXJcIjogXCJeMi4wLjVcIixcclxuICAgICAgICBcImZvY3VzLXRyYXBcIjogXCJeNy41LjRcIixcclxuICAgICAgICBcImpzemlwXCI6IFwiXjMuMTAuMVwiLFxyXG4gICAgICAgIFwia29udmFcIjogXCJeOS4zLjJcIixcclxuICAgICAgICBcImxvY2FsZm9yYWdlXCI6IFwiXjEuMTAuMFwiLFxyXG4gICAgICAgIFwibG9kYXNoLWVzXCI6IFwiXjQuMTcuMjFcIixcclxuICAgICAgICBcIm5vc2xlZXAuanNcIjogXCJeMC4xMi4wXCIsXHJcbiAgICAgICAgXCJwaW5pYVwiOiBcIl4yLjEuN1wiLFxyXG4gICAgICAgIFwic3ViLWV2ZW50c1wiOiBcIl4xLjkuMFwiLFxyXG4gICAgICAgIFwidXVpZFwiOiBcIl44LjMuMlwiLFxyXG4gICAgICAgIFwidnVlXCI6IFwiXjMuNC4xNVwiLFxyXG4gICAgICAgIFwidnVlLWF1ZGlvLWxldmVsLW1ldGVyXCI6IFwiXjEuMS42XCIsXHJcbiAgICAgICAgXCJ2dWUtZ2xvYmFsLWV2ZW50c1wiOiBcIl4yLjEuMVwiLFxyXG4gICAgICAgIFwidnVlLXBlYWtzXCI6IFwiXjIuMC4yXCIsXHJcbiAgICAgICAgXCJ2dWUtcm91dGVyXCI6IFwiXjQuMi41XCIsXHJcbiAgICAgICAgXCJ2dWUtc2Nyb2xsdG9cIjogXCJeMi4yMC4wXCIsXHJcbiAgICAgICAgXCJ2dWUzLXByb21pc2UtZGlhbG9nXCI6IFwiXjAuMy40XCIsXHJcbiAgICAgICAgXCJ2dWVkcmFnZ2FibGVcIjogXCJeNC4xLjBcIixcclxuICAgICAgICBcIndhdmVmb3JtLWRhdGFcIjogXCJeNC41LjBcIixcclxuICAgICAgICBcInhtbDJqc1wiOiBcIl4wLjYuMlwiXHJcbiAgICB9LFxyXG4gICAgXCJkZXZEZXBlbmRlbmNpZXNcIjoge1xyXG4gICAgICAgIFwiQGNyZWF0aXZlYnVsbWEvYnVsbWEtdG9vbHRpcFwiOiBcIl4xLjIuMFwiLFxyXG4gICAgICAgIFwiQHJ1c2hzdGFjay9lc2xpbnQtcGF0Y2hcIjogXCJeMS43LjJcIixcclxuICAgICAgICBcIkB0c2NvbmZpZy9ub2RlMThcIjogXCJeMTguMi4yXCIsXHJcbiAgICAgICAgXCJAdHlwZXMvanNkb21cIjogXCJeMjEuMS42XCIsXHJcbiAgICAgICAgXCJAdHlwZXMvbG9kYXNoXCI6IFwiXjQuMTQuMjAyXCIsXHJcbiAgICAgICAgXCJAdHlwZXMvbm9kZVwiOiBcIl4xOC4xOC41XCIsXHJcbiAgICAgICAgXCJAdHlwZXMvdXVpZFwiOiBcIl45LjAuN1wiLFxyXG4gICAgICAgIFwiQHR5cGVzL3htbDJqc1wiOiBcIl4wLjQuMTRcIixcclxuICAgICAgICBcIkB2aXRlanMvcGx1Z2luLXZ1ZVwiOiBcIl41LjAuM1wiLFxyXG4gICAgICAgIFwiQHZ1ZS9lc2xpbnQtY29uZmlnLXByZXR0aWVyXCI6IFwiXjkuMC4wXCIsXHJcbiAgICAgICAgXCJAdnVlL2VzbGludC1jb25maWctdHlwZXNjcmlwdFwiOiBcIl4xMy4wLjBcIixcclxuICAgICAgICBcIkB2dWUvdGVzdC11dGlsc1wiOiBcIl4yLjQuNFwiLFxyXG4gICAgICAgIFwiQHZ1ZS90c2NvbmZpZ1wiOiBcIl4wLjUuMVwiLFxyXG4gICAgICAgIFwiYnVsbWFcIjogXCJeMC45LjRcIixcclxuICAgICAgICBcImJ1bG1hLXByaW50XCI6IFwiXjEuMC4xXCIsXHJcbiAgICAgICAgXCJidWxtYS1zbGlkZXJcIjogXCJeMi4wLjVcIixcclxuICAgICAgICBcImJ1bG1hc3dhdGNoXCI6IFwiXjAuOC4xXCIsXHJcbiAgICAgICAgXCJjeXByZXNzXCI6IFwiXjEzLjYuM1wiLFxyXG4gICAgICAgIFwiZXNsaW50XCI6IFwiXjguNTcuMFwiLFxyXG4gICAgICAgIFwiZXNsaW50LXBsdWdpbi1jeXByZXNzXCI6IFwiXjIuMTUuMVwiLFxyXG4gICAgICAgIFwiZXNsaW50LXBsdWdpbi1saWNlbnNlLWhlYWRlclwiOiBcIl4wLjYuMFwiLFxyXG4gICAgICAgIFwiZXNsaW50LXBsdWdpbi12dWVcIjogXCJeOS4yMC4xXCIsXHJcbiAgICAgICAgXCJqc2RvbVwiOiBcIl4yNC4wLjBcIixcclxuICAgICAgICBcInByZXR0aWVyXCI6IFwiXjMuMi40XCIsXHJcbiAgICAgICAgXCJyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXJcIjogXCJeNS4xMi4wXCIsXHJcbiAgICAgICAgXCJzYXNzXCI6IFwiXjEuNTAuMFwiLFxyXG4gICAgICAgIFwic2Fzcy1sb2FkZXJcIjogXCJeMTAuMi4xXCIsXHJcbiAgICAgICAgXCJzdGFydC1zZXJ2ZXItYW5kLXRlc3RcIjogXCJeMi4wLjNcIixcclxuICAgICAgICBcInR5cGVzY3JpcHRcIjogXCJeNS40LjJcIixcclxuICAgICAgICBcInR5cGVzY3JpcHQtZXNsaW50XCI6IFwiXjcuMy4xXCIsXHJcbiAgICAgICAgXCJ2aXRlXCI6IFwiXjUuMC4xMlwiLFxyXG4gICAgICAgIFwidml0ZS1wbHVnaW4tbm9kZS1wb2x5ZmlsbHNcIjogXCJeMC4yMS4wXCIsXHJcbiAgICAgICAgXCJ2aXRlLXBsdWdpbi1wd2FcIjogXCJeMC4xNy41XCIsXHJcbiAgICAgICAgXCJ2aXRlc3RcIjogXCJeMS4yLjJcIixcclxuICAgICAgICBcInZ1ZS10c2NcIjogXCJeMS44LjI3XCJcclxuICAgIH0sXHJcbiAgICBcImJ1Z3NcIjoge1xyXG4gICAgICAgIFwidXJsXCI6IFwiaHR0cHM6Ly9naXRodWIuY29tL3N1dGVybWEvcmVwbGF5ZXItcHdhL2lzc3Vlc1wiXHJcbiAgICB9LFxyXG4gICAgXCJyZXBvc2l0b3J5XCI6IHtcclxuICAgICAgICBcInR5cGVcIjogXCJnaXRcIixcclxuICAgICAgICBcInVybFwiOiBcImh0dHBzOi8vZ2l0aHViLmNvbS9zdXRlcm1hL3JlcGxheWVyLXB3YS5naXRcIlxyXG4gICAgfVxyXG59XHJcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRDpcXFxcbWFzdS1kYXRhXFxcXGdpdGh1Yi1zdXRlcm1hXFxcXHJlcGxheWVyLXB3YVwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRDpcXFxcbWFzdS1kYXRhXFxcXGdpdGh1Yi1zdXRlcm1hXFxcXHJlcGxheWVyLXB3YVxcXFx2aXRlc3QuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9tYXN1LWRhdGEvZ2l0aHViLXN1dGVybWEvcmVwbGF5ZXItcHdhL3ZpdGVzdC5jb25maWcudHNcIjsvKipcclxuICogQ29weXJpZ2h0IChjKSAyMDI0IE1hcmNlbCBTdXRlciAtIFJlcGxheWVyXHJcbiAqXHJcbiAqIFRoaXMgc291cmNlIGNvZGUgaXMgbGljZW5zZWQgdW5kZXIgdGhlIEFHUEwgbGljZW5zZSBmb3VuZCBpbiB0aGVcclxuICogTElDRU5TRSBmaWxlIGluIHRoZSByb290IG9mIHRoaXMgcHJvamVjdHMgc291cmNlIHRyZWUuXHJcbiAqL1xyXG5cclxuaW1wb3J0IHsgZmlsZVVSTFRvUGF0aCB9IGZyb20gJ25vZGU6dXJsJztcclxuaW1wb3J0IHsgbWVyZ2VDb25maWcsIGRlZmluZUNvbmZpZywgY29uZmlnRGVmYXVsdHMgfSBmcm9tICd2aXRlc3QvY29uZmlnJztcclxuaW1wb3J0IHZpdGVDb25maWcgZnJvbSAnLi92aXRlLmNvbmZpZyc7XHJcblxyXG5leHBvcnQgZGVmYXVsdCBtZXJnZUNvbmZpZyhcclxuICAgIHZpdGVDb25maWcsXHJcbiAgICBkZWZpbmVDb25maWcoe1xyXG4gICAgICAgIHRlc3Q6IHtcclxuICAgICAgICAgICAgZW52aXJvbm1lbnQ6ICdqc2RvbScsXHJcbiAgICAgICAgICAgIGV4Y2x1ZGU6IFsuLi5jb25maWdEZWZhdWx0cy5leGNsdWRlLCAnZTJlLyonXSxcclxuICAgICAgICAgICAgcm9vdDogZmlsZVVSTFRvUGF0aChuZXcgVVJMKCcuLycsIGltcG9ydC5tZXRhLnVybCkpLFxyXG4gICAgICAgIH0sXHJcbiAgICB9KSxcclxuKTtcclxuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxtYXN1LWRhdGFcXFxcZ2l0aHViLXN1dGVybWFcXFxccmVwbGF5ZXItcHdhXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxtYXN1LWRhdGFcXFxcZ2l0aHViLXN1dGVybWFcXFxccmVwbGF5ZXItcHdhXFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9tYXN1LWRhdGEvZ2l0aHViLXN1dGVybWEvcmVwbGF5ZXItcHdhL3ZpdGUuY29uZmlnLnRzXCI7LyoqXHJcbiAqIENvcHlyaWdodCAoYykgMjAyNCBNYXJjZWwgU3V0ZXIgLSBSZXBsYXllclxyXG4gKlxyXG4gKiBUaGlzIHNvdXJjZSBjb2RlIGlzIGxpY2Vuc2VkIHVuZGVyIHRoZSBBR1BMIGxpY2Vuc2UgZm91bmQgaW4gdGhlXHJcbiAqIExJQ0VOU0UgZmlsZSBpbiB0aGUgcm9vdCBvZiB0aGlzIHByb2plY3RzIHNvdXJjZSB0cmVlLlxyXG4gKi9cclxuXHJcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGgsIFVSTCB9IGZyb20gJ25vZGU6dXJsJztcclxuaW1wb3J0IHsgbm9kZVBvbHlmaWxscyB9IGZyb20gJ3ZpdGUtcGx1Z2luLW5vZGUtcG9seWZpbGxzJztcclxuaW1wb3J0IHZ1ZSBmcm9tICdAdml0ZWpzL3BsdWdpbi12dWUnO1xyXG5pbXBvcnQgeyBWaXRlUFdBIH0gZnJvbSAndml0ZS1wbHVnaW4tcHdhJztcclxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCB0eXBlIFBsdWdpbk9wdGlvbiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgeyB2aXN1YWxpemVyIH0gZnJvbSAncm9sbHVwLXBsdWdpbi12aXN1YWxpemVyJztcclxuXHJcbi8vU2V0dGluZyB0aGUgZW52aXJvbm1lbnQgdmFyaWFibGVzXHJcbmltcG9ydCBjaGlsZF9wcm9jZXNzIGZyb20gJ2NoaWxkX3Byb2Nlc3MnO1xyXG5mdW5jdGlvbiBnaXQoY29tbWFuZDogc3RyaW5nKSB7XHJcbiAgICByZXR1cm4gY2hpbGRfcHJvY2Vzc1xyXG4gICAgICAgIC5leGVjU3luYyhgZ2l0ICR7Y29tbWFuZH1gLCB7IGVuY29kaW5nOiAndXRmOCcgfSlcclxuICAgICAgICAudHJpbSgpO1xyXG59XHJcbnByb2Nlc3MuZW52LlZJVEVfQVBQX1ZFUlNJT04gPSByZXF1aXJlKCcuL3BhY2thZ2UuanNvbicpLnZlcnNpb247XHJcbnByb2Nlc3MuZW52LlZJVEVfQVBQX0dJVF9WRVJTSU9OID0gZ2l0KCdkZXNjcmliZSAtLWFsd2F5cycpO1xyXG5wcm9jZXNzLmVudi5WSVRFX0FQUF9HSVRfQVVUSE9SX0RBVEUgPSBnaXQoJ2xvZyAtMSAtLWZvcm1hdD0lYUknKTtcclxuXHJcbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgICBidWlsZDoge1xyXG4gICAgICAgIC8vIFN1cHBvcnQgb2xkZXIgYnJvd3Nlci9vcyB2ZXJzaW9uc1xyXG4gICAgICAgIC8vIFNlZSBodHRwczovL3JlcGxheWVyLmFwcC9lbi9kb2N1bWVudGF0aW9uL2NvbXBhdGliaWxpdHkta25vd24taXNzdWVzXHJcbiAgICAgICAgLy8gZm9yIG9mZmljaWFsbHkgc3VwcG9ydGVkIHZlcnNpb25zXHJcbiAgICAgICAgdGFyZ2V0OiAnZXMyMDE1JyxcclxuICAgICAgICAvLyBTaW5jZSB0aGlzIGlzIEZPU1MgYW55d2F5LCBpbXByb3ZlIGEgcG9zc2libGUgZGVidWcgZXhwZXJpZW5jZVxyXG4gICAgICAgIHNvdXJjZW1hcDogdHJ1ZSxcclxuXHJcbiAgICAgICAgLy8gTk9URTogSXQgc2VlbXMgdGhhdCBtaW5pZmljYXRpb24gaGFzIHJlc3VsdGVkIGluIHBhcnNpbmcgcHJvYmxlbXMgb24gaVBhZE9TXHJcbiAgICAgICAgbWluaWZ5OiB0cnVlLFxyXG4gICAgfSxcclxuICAgIHBsdWdpbnM6IFtcclxuICAgICAgICB2dWUoKSxcclxuICAgICAgICAvLyBXYXRjaCBhbmQgcG9zc2libGUgcmVkdWNlIGJ1bmRsZSBzaXplIHdpdGggdGhpcyB2aXN1YWxpemVyOlxyXG4gICAgICAgIC8vIGh0dHBzOi8vZ2l0aHViLmNvbS9idGQvcm9sbHVwLXBsdWdpbi12aXN1YWxpemVyXHJcbiAgICAgICAgW3Zpc3VhbGl6ZXIoKSBhcyBQbHVnaW5PcHRpb25dLFxyXG4gICAgICAgIFZpdGVQV0Eoe1xyXG4gICAgICAgICAgICBkZXZPcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgICBlbmFibGVkOiB0cnVlLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB3b3JrYm94OiB7XHJcbiAgICAgICAgICAgICAgICAvLyBSZXBsYXllciBoYXMgbW9yZSB0aGFuIGp1c3QgdGhlIGpzLCBjc3MgYW5kIGh0bWwgaW4gdGhlIGRpc3QgZm9sZGVyXHJcbiAgICAgICAgICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyx3ZWJwLHN2Z30nXSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgbWFuaWZlc3Q6IHtcclxuICAgICAgICAgICAgICAgIG5hbWU6ICdSZXBsYXllcicsXHJcbiAgICAgICAgICAgICAgICBzaG9ydF9uYW1lOiAnUmVwbGF5ZXInLFxyXG4gICAgICAgICAgICAgICAgbGFuZzogJ2VuLVVTJyxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgICAgICAgICAgICdSZXBsYXllciBpcyBhIGZyZWUsIGN1ZS1iYXNlZCBtZWRpYSBwbGF5ZXIgZm9yIHJlaGVhcnNhbHMgd2l0aCBwbGF5YmFjayBtdXNpYy4gQnkgdGhlIGNsaWNrIG9mIGEgYnV0dG9uLCBSZXBsYXllciBzdGFydHMgdG8gcGxheSBhdCBwcmVkZWZpbmVkIHRpbWVzIGluIHRoZSBhdWRpbyBvciB2aWRlbyBmaWxlLicsXHJcbiAgICAgICAgICAgICAgICB0aGVtZV9jb2xvcjogJyMzYTNmNDQnLFxyXG4gICAgICAgICAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyMyNzJiMzAnLFxyXG4gICAgICAgICAgICAgICAgY2F0ZWdvcmllczogWydlbnRlcnRhaW5tZW50JywgJ211c2ljJywgJ3Byb2R1Y3Rpdml0eSddLFxyXG4gICAgICAgICAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogJ2ltZy9pY29ucy9hbmRyb2lkLWNocm9tZS0xOTJ4MTkyLnBuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnYW55JyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiAnaW1nL2ljb25zL2FuZHJvaWQtY2hyb21lLTI1NngyNTYucG5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZXM6ICcyNTZ4MjU2JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdhbnknLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6ICdpbWcvaWNvbnMvYW5kcm9pZC1jaHJvbWUtNTEyeDUxMi5wbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ2FueScsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogJ2ltZy9pY29ucy9SZXBsYXllcl9BcHBfSWNvbl9tYXNrYWJsZV94MTkyLnBuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVzOiAnMTkyeDE5MicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBwdXJwb3NlOiAnbWFza2FibGUnLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6ICdpbWcvaWNvbnMvUmVwbGF5ZXJfQXBwX0ljb25fbWFza2FibGVfeDI1Ni5wbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplczogJzI1NngyNTYnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaW1hZ2UvcG5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ21hc2thYmxlJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiAnaW1nL2ljb25zL1JlcGxheWVyX0FwcF9JY29uX21hc2thYmxlX3g1MTIucG5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZXM6ICc1MTJ4NTEyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHB1cnBvc2U6ICdtYXNrYWJsZScsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBzdGFydF91cmw6ICcuJyxcclxuICAgICAgICAgICAgICAgIG9yaWVudGF0aW9uOiAncG9ydHJhaXQnLFxyXG4gICAgICAgICAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxyXG4gICAgICAgICAgICAgICAgZGlzcGxheV9vdmVycmlkZTogW1xyXG4gICAgICAgICAgICAgICAgICAgICd3aW5kb3ctY29udHJvbHMtb3ZlcmxheScsXHJcbiAgICAgICAgICAgICAgICAgICAgJ3N0YW5kYWxvbmUnLFxyXG4gICAgICAgICAgICAgICAgICAgICdicm93c2VyJyxcclxuICAgICAgICAgICAgICAgIF0sXHJcbiAgICAgICAgICAgICAgICBwcm90b2NvbF9oYW5kbGVyczogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcHJvdG9jb2w6ICd3ZWIrbXVzaWMnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6ICcvIy9wbGF5P21lZGlhPSVzJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIC8vIHNoYXJlX3RhcmdldCBzaG91bGQgYmUgaW1wbGVtZW50ZWQgd2l0aCAxMzctaW1wbGVtZW50LXRoZS13ZWItc2hhcmVfdGFyZ2V0LWZlYXR1cmVcclxuICAgICAgICAgICAgICAgIGZpbGVfaGFuZGxlcnM6IFtcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjdGlvbjogJy8jL2VkaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBhY2NlcHQ6IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhcHBsaWNhdGlvbi96aXAnOiBbJy56aXAnLCAnLnJleiddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL29jdGV0LXN0cmVhbSc6IFsnLnppcCcsICcucmV6J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXBwbGljYXRpb24veC16aXAtY29tcHJlc3NlZCc6IFsnLnppcCcsICcucmV6J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYmluYXJ5L29jdGV0LXN0cmVhbSc6IFsnLnppcCcsICcucmV6J10sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2FwcGxpY2F0aW9uL3htbCc6IFsnLnhtbCcsICcucmV4J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAndGV4dC94bWwnOiBbJy54bWwnLCAnLnJleCddLFxyXG5cclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd0ZXh0L3BsYWluJzogWycudHh0J10sXHJcblxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2F1ZGlvL21wMyc6IFsnLm1wMyddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2F1ZGlvL21wZWcnOiBbJy5tcDMnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhdWRpby92bmQud2F2ZSc6IFsnLndhdmUnLCAnLndhdiddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2F1ZGlvL3dhdic6IFsnLndhdmUnLCAnLndhdiddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2F1ZGlvL3dhdmUnOiBbJy53YXZlJywgJy53YXYnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhdWRpby94LXdhdic6IFsnLndhdmUnLCAnLndhdiddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2F1ZGlvL2ZsYWMnOiBbJy5mbGFjJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXBwbGljYXRpb24vb2dnJzogWycub2dnJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXVkaW8vb2dnJzogWycub2dnJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXVkaW8vdm9yYmlzJzogWycub2dnJ10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAnYXVkaW8vdm9yYmlzLWNvbmZpZyc6IFsnLm9nZyddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2F1ZGlvL3gtYWlmZic6IFsnLmFpZmYnLCAnLmFpZiddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2F1ZGlvL2FpZmYnOiBbJy5haWZmJywgJy5haWYnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICdhdWRpby9hYWMnOiBbJy5hYWMnLCAnLm00YSddLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3ZpZGVvL21wNCc6IFsnLm1wNCcsICcubTR2J10sXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAndmlkZW8vd2VibSc6IFsnLndlYm0nXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICd2aWRlby9vZ2cnOiBbJy5vZ3YnXSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIHNjcmVlbnNob3RzOiBbXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0Egc2NyZWVuc2hvdCBvZiB0aGUgcGxheWJhY2sgdmlldyBvZiBSZXBsYXllcicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogJy9pbWcvc2NyZWVuc2hvdC9SZXBsYXllci1mZWF0dXJlZC1ncmFwaGljLnBuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpbWFnZS9wbmcnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzaXplczogJzIwNDh4MTA0MCcsXHJcbiAgICAgICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgICAgICB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiAnQSBwaG9uZSBzaG93aW5nIHRoZSBwbGF5YmFjayB2aWV3IG9mIFJlcGxheWVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiAnL2ltZy9zY3JlZW5zaG90L1Bob25lLVNjcmVlbnNob3QxLWlwaG9uZTY3OHBsdXMucG5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVzOiAnMTQxMHgyODYyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybV9mYWN0b3I6ICduYXJyb3cnLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0EgcGhvbmUgc2hvd2luZyB0aGUgZWRpdCB2aWV3IG9mIFJlcGxheWVyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgc3JjOiAnL2ltZy9zY3JlZW5zaG90L1Bob25lLVNjcmVlbnNob3QyLWlwaG9uZTY3OHBsdXMucG5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVzOiAnMTQxMHgyODYyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybV9mYWN0b3I6ICduYXJyb3cnLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogJ0EgdGFibGV0IHNob3dpbmcgdGhlIHBsYXliYWNrIHZpZXcgb2YgUmVwbGF5ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6ICcvaW1nL3NjcmVlbnNob3QvVGFibGV0LXNjcmVlbnNob3QxLWlwYWQucG5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVzOiAnMjUwNHgxNzUyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybV9mYWN0b3I6ICd3aWRlJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6ICdBIHRhYmxldCBzaG93aW5nIHRoZSBlZGl0IHZpZXcgb2YgUmVwbGF5ZXInLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzcmM6ICcvaW1nL3NjcmVlbnNob3QvVGFibGV0LXNjcmVlbnNob3QyLWlwYWQucG5nJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNpemVzOiAnMjUwNHgxNzUyJyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgZm9ybV9mYWN0b3I6ICd3aWRlJyxcclxuICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICAgIHJlbGF0ZWRfYXBwbGljYXRpb25zOiBbXSxcclxuICAgICAgICAgICAgICAgIHNob3J0Y3V0czogW1xyXG4gICAgICAgICAgICAgICAgICAgIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgbmFtZTogJ1BsYXkgdHJhY2tzIGZyb20gYSBjb21waWxhdGlvbicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3J0X25hbWU6ICdQbGF5JyxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAnLyMvcGxheScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJ0FsbG93cyB0byBvcGVuIGEgY29tcGlsYXRpb24gYW5kIHBsYXkgdHJhY2tzIGZyb20gaXQnLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBpY29uczogW1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNyYzogJy9pbWcvaWNvbnMvc2hvcnRjdXQtcGxheS1pY29uLTk2eDk2LnBuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2l6ZXM6ICc5Nng5NicsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcHVycG9zZTogJ2FueScsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgICAgICBdLFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgIH0pLFxyXG4gICAgICAgIC8qKiBDb25maWd1cmUgdGhlIG5vZGUgcG9seWZpbGxzIGZvciB1c2Ugd2l0aCB2aXRlLlxyXG4gICAgICAgICAqIEByZW1hcmtzIFNlZSBodHRwczovL2dpdGh1Yi5jb20vZGF2aWRteWVyc2Rldi92aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxsc1xyXG4gICAgICAgICAqIEBkZXZkb2MgSElOVDogc3RyZWFtIGlzIHVzZWQgd2l0aCBKU1ppcFxyXG4gICAgICAgICAqIEBkZXZkb2MgSElOVDogQnVmZmVyIGlzIGN1cnJlbnRseSBub3QgdXNlZCAoV2l0aCBKU1ppcCwgUmVwbGF5ZXIgdXNlcyBibG9iKVxyXG4gICAgICAgICAqL1xyXG4gICAgICAgIG5vZGVQb2x5ZmlsbHMoKSxcclxuICAgIF0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgYWxpYXM6IHtcclxuICAgICAgICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXHJcbiAgICAgICAgfSxcclxuICAgIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQSxNQUNJLE1BQVE7QUFBQSxNQUNSLFNBQVc7QUFBQSxNQUNYLGFBQWU7QUFBQSxNQUNmLFVBQVk7QUFBQSxNQUNaLE1BQVE7QUFBQSxNQUNSLE1BQVE7QUFBQSxNQUNSLFNBQVc7QUFBQSxNQUNYLFVBQVk7QUFBQSxRQUNS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LGNBQ0g7QUFBQSxnQkFDSSxLQUFLO0FBQUEsZ0JBQ0wsT0FBTztBQUFBLGdCQUNQLE1BQU07QUFBQSxnQkFDTixTQUFTO0FBQUEsY0FDYjtBQUFBLFlBQ0o7QUFBQSxVQUNKO0FBQUEsUUFDSjtBQUFBLE1BQ0o7QUFBQSxJQUNKLENBQUM7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFNRCxjQUFjO0FBQUEsRUFDbEI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNMLE9BQU87QUFBQSxNQUNILEtBQUssY0FBYyxJQUFJQyxLQUFJLFNBQVMsd0NBQWUsQ0FBQztBQUFBLElBQ3hEO0FBQUEsRUFDSjtBQUNKLENBQUM7OztBRHZOZ00sSUFBTUMsNENBQTJDO0FBV2xQLElBQU8sd0JBQVE7QUFBQSxFQUNYO0FBQUEsRUFDQUMsY0FBYTtBQUFBLElBQ1QsTUFBTTtBQUFBLE1BQ0YsYUFBYTtBQUFBLE1BQ2IsU0FBUyxDQUFDLEdBQUcsZUFBZSxTQUFTLE9BQU87QUFBQSxNQUM1QyxNQUFNQyxlQUFjLElBQUksSUFBSSxNQUFNRix5Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNKLENBQUM7QUFDTDsiLAogICJuYW1lcyI6IFsiZmlsZVVSTFRvUGF0aCIsICJkZWZpbmVDb25maWciLCAiVVJMIiwgIlVSTCIsICJfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsIiwgImRlZmluZUNvbmZpZyIsICJmaWxlVVJMVG9QYXRoIl0KfQo=
