import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const siteRoot = process.cwd();
const outputPath = join(siteRoot, 'api', 'projects.json');

test('build-api keeps the checked-in projects API stable when the manifest is unchanged', () => {
  const originalOutput = readFileSync(outputPath, 'utf8');

  try {
    execFileSync('node', ['scripts/build-api.mjs'], {
      cwd: siteRoot,
      stdio: 'pipe',
    });

    const rebuiltOutput = readFileSync(outputPath, 'utf8');
    assert.equal(
      rebuiltOutput,
      originalOutput,
      'build-api rewrote api/projects.json without any manifest changes'
    );
  } finally {
    writeFileSync(outputPath, originalOutput, 'utf8');
  }
});
