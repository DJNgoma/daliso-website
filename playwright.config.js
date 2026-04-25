import { defineConfig } from '@playwright/test';
import { execSync } from 'node:child_process';
import { dirname } from 'node:path';

function findNpm() {
  try { return execSync('command -v npm', { encoding: 'utf8' }).trim(); }
  catch { return process.execPath.replace(/node$/, 'npm'); }
}

const npmCommand = process.env.NPM_BIN ?? findNpm();
const nodeBinDir = process.env.NODE_BIN_DIR ?? dirname(npmCommand);
const playwrightPort = process.env.PLAYWRIGHT_PORT ?? '4173';

export default defineConfig({
  testDir: './tests',
  testIgnore: ['tests/blog-generator.spec.mjs'],
  timeout: 15000,
  workers: process.env.CI ? 1 : 2,
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
