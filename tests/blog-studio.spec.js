import { test, expect } from '@playwright/test';
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = process.cwd();
const generatorPath = join(repoRoot, 'scripts', 'blog-generator.mjs');
const cleanupPrefixes = [
  'playwright-studio-draft',
  'playwright-publish-flow',
  'ai-disclosure-enabled',
  'ai-disclosure-hidden',
];

test.describe('Blog studio', () => {
  test.afterEach(() => {
    for (const relativePath of [
      ['blog', 'drafts'],
      ['blog', 'posts'],
      ['blog'],
    ]) {
      const directoryPath = join(repoRoot, ...relativePath);
      if (!existsSync(directoryPath)) {
        continue;
      }

      for (const entry of readdirSync(directoryPath)) {
        const normalized = entry.replace(/\.md$/, '');
        if (!cleanupPrefixes.some((prefix) => normalized.startsWith(prefix))) {
          continue;
        }

        rmSync(join(directoryPath, entry), { recursive: true, force: true });
      }
    }

    execFileSync(process.execPath, [generatorPath, 'build'], {
      cwd: repoRoot,
      env: process.env,
      stdio: 'ignore',
    });
  });

  test('creates a draft from the studio and renders the markdown preview', async ({ page }, testInfo) => {
    const title = withProjectSuffix('Playwright Studio Draft', testInfo);
    const slug = slugify(title);

    await page.goto('/blog-studio/');

    await expect(
      page.getByRole('heading', {
        level: 1,
        name: 'Write, preview, and publish Markdown posts from one workspace.',
      })
    ).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Drafts' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 3, name: 'Published' })).toBeVisible();

    await page.locator('#new-post-title').fill(title);
    await page.locator('#new-post-origin').selectOption('ai-assisted');
    await page.locator('#new-post-show-origin').check();
    await page.getByRole('button', { name: 'Create draft' }).click();

    await expect(page.locator('#draft-list')).toContainText(title);
    await page.locator('#markdown-input').fill(
      `---\n` +
        `title: "${title}"\n` +
        `slug: "${slug}"\n` +
        `description: "A draft created from the local studio."\n` +
        `origin: ai-assisted\n` +
        `showOriginLabel: true\n` +
        `---\n\n` +
        `# ${title}\n\n` +
        `This paragraph has **bold text** and a [reference link](https://example.com).\n`
    );

    await expect(page.locator('#preview-frame')).toContainText('bold text');
    await expect(page.locator('#preview-frame')).toContainText('reference link');

    await page.locator('#save-draft').click();
    await expect(page.locator('#status-message')).toContainText('Saved draft');
    await expect(page.locator('#draft-list')).toContainText(title);
  });

  test('publishes a draft and exposes the new article on the public blog', async ({ page }, testInfo) => {
    const title = withProjectSuffix('Playwright Publish Flow', testInfo);
    const slug = slugify(title);

    await page.goto('/blog-studio/');

    await page.locator('#new-post-title').fill(title);
    await page.locator('#new-post-origin').selectOption('human');
    await page.getByRole('button', { name: 'Create draft' }).click();
    await page.locator('#markdown-input').fill(
      `---\n` +
        `title: "${title}"\n` +
        `slug: "${slug}"\n` +
        `description: "A post published from the studio."\n` +
        `origin: human\n` +
        `showOriginLabel: false\n` +
        `---\n\n` +
        `# ${title}\n\n` +
        `Publishing should move the draft into the public blog.\n`
    );

    await page.locator('#publish-post').click();
    await expect(page.locator('#status-message')).toContainText(/Published|Opened published document/);

    await page.goto('/blog/');
    await expect(
      page.getByRole('link', { name: title })
    ).toBeVisible();

    await page.goto(`/blog/${slug}/`);
    await expect(page.getByRole('heading', { name: title })).toBeVisible();
    await expect(page.locator('.blog-article')).toContainText(
      'Publishing should move the draft into the public blog.'
    );
  });

  test('shows the AI disclosure only when it is enabled', async ({ page }, testInfo) => {
    const visibleTitle = withProjectSuffix('AI Disclosure Enabled', testInfo);
    const visibleSlug = slugify(visibleTitle);
    const hiddenTitle = withProjectSuffix('AI Disclosure Hidden', testInfo);
    const hiddenSlug = slugify(hiddenTitle);

    await page.goto('/blog-studio/');

    await page.locator('#new-post-title').fill(visibleTitle);
    await page.locator('#new-post-origin').selectOption('ai-generated');
    await page.locator('#new-post-show-origin').check();
    await page.getByRole('button', { name: 'Create draft' }).click();
    await page.locator('#markdown-input').fill(
      `---\n` +
        `title: "${visibleTitle}"\n` +
        `slug: "${visibleSlug}"\n` +
        `description: "A post that discloses AI usage."\n` +
        `origin: ai-generated\n` +
        `showOriginLabel: true\n` +
        `---\n\n` +
        `# ${visibleTitle}\n\n` +
        `Disclosure should appear on the public page.\n`
    );
    await page.locator('#publish-post').click();
    await expect(page.locator('#status-message')).toContainText(/Published|Opened published document/);

    await page.goto(`/blog/${visibleSlug}/`);
    await expect(page.getByText(/AI-generated|AI-assisted/)).toBeVisible();

    await page.goto('/blog-studio/');
    await page.locator('#new-post-title').fill(hiddenTitle);
    await page.locator('#new-post-origin').selectOption('ai-generated');
    await page.locator('#new-post-show-origin').uncheck();
    await page.getByRole('button', { name: 'Create draft' }).click();
    await page.locator('#markdown-input').fill(
      `---\n` +
        `title: "${hiddenTitle}"\n` +
        `slug: "${hiddenSlug}"\n` +
        `description: "A post without a disclosure note."\n` +
        `origin: ai-generated\n` +
        `showOriginLabel: false\n` +
        `---\n\n` +
        `# ${hiddenTitle}\n\n` +
        `Disclosure should stay hidden on the public page.\n`
    );
    await page.locator('#publish-post').click();
    await expect(page.locator('#status-message')).toContainText(/Published|Opened published document/);

    await page.goto(`/blog/${hiddenSlug}/`);
    await expect(page.getByText(/AI-generated|AI-assisted/)).toHaveCount(0);
  });
});

function withProjectSuffix(title, testInfo) {
  return `${title} ${testInfo.project.name}`;
}

function slugify(value) {
  return String(value)
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
