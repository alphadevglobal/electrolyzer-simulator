import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://127.0.0.1:4173',
    supportFile: 'cypress/support/e2e.js',
    video: false,
    retries: {
      runMode: 2,
      openMode: 0,
    },
    viewportWidth: 1280,
    viewportHeight: 720,
  },
});
