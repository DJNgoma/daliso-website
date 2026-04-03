import { defineConfig } from '@playwright/test';

const npmCommand = process.env.NPM_BIN ?? '/opt/homebrew/bin/npm';
const nodeBinDir = process.env.NODE_BIN_DIR ?? '/opt/homebrew/bin';
const playwrightPort = process.env.PLAYWRIGHT_PORT ?? '4173';

export default defineConfig({
  testDir: './tests',
  testIgnore: ['tests/blog-generator.spec.mjs'],
  timeout: 15000,
  workers: 2,
  use: {
    baseURL: `http://127.0.0.1:${playwrightPort}`,
  },
  webServer: {
    command: `PORT=${playwrightPort} PATH=${nodeBinDir}:$PATH ${npmCommand} run dev`,
    port: Number(playwrightPort),
    reuseExistingServer: true,
  },
  projects: [
    {
      name: 'desktop',
      use: { viewport: { width: 1280, height: 800 } },
    },
    {
      name: 'mobile',
      use: { viewport: { width: 375, height: 812 } },
    },
  ],
});
