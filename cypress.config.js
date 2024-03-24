/**
 * Copyright (c) 2024 Marcel Suter - Replayer
 *
 * This source code is licensed under the AGPL license found in the
 * LICENSE file in the root of this projects source tree.
 */

// NOTE: using the .js ending (instead of .ts) solves this issue
// with referencing modules:
// https://github.com/cypress-io/cypress/issues/23552#issuecomment-1456477053
import { defineConfig } from 'cypress';

export default defineConfig({
    e2e: {
        specPattern: 'cypress/e2e/**/*.{cy,spec}.{js,jsx,ts,tsx}',
        baseUrl: 'http://localhost:4173',
        // Allows to run all specs at once from the UI
        experimentalRunAllSpecs: true,
        // Only wait 15 secs for page load timeout
        pageLoadTimeout: 15000,
    },
});
