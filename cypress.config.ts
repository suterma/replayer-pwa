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
