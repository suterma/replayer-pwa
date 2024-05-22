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

/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution');

module.exports = {
    root: true,
    extends: [
        //'plugin:vue/vue3-essential',
        //'plugin:vue/vue3-strongly-recommended',
        'plugin:vue/vue3-recommended',
        // NOTE: 'plugin:vue/vue3-recommended' includes also 'plugin:vue/vue3-strongly-recommended' and  'plugin:vue/vue3-essential'
        'eslint:recommended',
        '@vue/eslint-config-typescript',
        '@vue/eslint-config-prettier/skip-formatting',
    ],
    overrides: [
        {
            files: ['cypress/e2e/**/*.{cy,spec}.{js,ts,jsx,tsx}'],
            extends: ['plugin:cypress/recommended'],
        },
        {
            /** Ignore specific files for fixing with "license-header" because the fixer messes up the files */
            files: ['env.d.ts', '**/*.vue'],
            rules: {
                'license-header/header': 0,
            },
        },
    ],
    parserOptions: {
        ecmaVersion: 'latest',
    },

    plugins: ['license-header'],
    rules: {
        'license-header/header': ['error', './resources/license-header.js'],
    },
};
