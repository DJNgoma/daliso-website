import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildCssBundle } from './build-css.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, '..');
const distDir = path.join(repoRoot, 'dist');

const publishPaths = [
  '404.html',
  '_headers',
  'assets',
  'blog',
  'css',
  'index.html',
  'js',
  'manifest.webmanifest',
  'media',
  'privacy',
  'projects',
  'robots.txt',
  'sitemap.xml',
];

async function buildSite() {
  await buildCssBundle();
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  for (const relativePath of publishPaths) {
    const source = path.join(repoRoot, relativePath);
    const target = path.join(distDir, relativePath);
    await cp(source, target, {
      recursive: true,
      filter: (sourcePath) => {
        const repoRelativePath = path.relative(repoRoot, sourcePath);
        const pathSegments = repoRelativePath.split(path.sep);
        const baseName = path.basename(sourcePath);

        if (baseName.startsWith('.')) {
          return false;
        }

        if (
          pathSegments[0] === 'blog' &&
          (pathSegments[1] === 'drafts' || pathSegments[1] === 'posts')
        ) {
          return false;
        }

        return true;
      },
    });
  }
}

buildSite().catch((error) => {
  console.error('Failed to assemble Cloudflare Pages publish directory.', error);
  process.exitCode = 1;
});
