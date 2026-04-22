import { test, expect } from '@playwright/test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const [FEATURED_POST, ARCHIVE_POST] = loadPublishedPostsFromSource();

test.describe('Blog pages', () => {
  test('blog index renders generated content and featured article link', async ({ page }) => {
    await page.goto('/blog/');

    await expect(page.getByText('Coming Soon')).toHaveCount(0);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Writing by Daliso' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Writing about judgment, systems, and practical technology where speed matters and bad assumptions compound.',
      })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Latest article' })).toBeVisible();
    await expect(page.locator('.blog-featured-card h3 a')).toHaveAttribute('href', FEATURED_POST.canonicalPath);
    await expect(page.locator('.blog-featured-card')).toContainText(FEATURED_POST.title);
    await expect(
      page.locator('.blog-post-grid').getByRole('link', {
        name: ARCHIVE_POST.title,
      })
    ).toHaveAttribute('href', ARCHIVE_POST.canonicalPath);
    await expect(page.locator('.blog-featured-card')).toContainText('Read article');
  });

  test('article page renders the published post content', async ({ page }) => {
    await page.goto(FEATURED_POST.canonicalPath);

    await expect(page.getByRole('heading', { name: FEATURED_POST.title })).toBeVisible();
    await expect(page.locator(`time[datetime="${FEATURED_POST.dateStamp}"]`)).toBeVisible();
    await expect(page.locator('.blog-prose p').first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to blog' })).toHaveAttribute('href', '/blog/');
  });

  test('skip link and main content region exist on blog index and article pages', async ({ page }) => {
    for (const path of ['/blog/', FEATURED_POST.canonicalPath]) {
      await page.goto(path);
      await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main-content');
      await expect(page.locator('main#main-content')).toHaveCount(1);
    }
  });
});

function loadPublishedPostsFromSource() {
  const postsDir = join(process.cwd(), 'blog', 'posts');

  return readdirSync(postsDir)
    .filter((fileName) => fileName.endsWith('.md'))
    .map((fileName) => parsePostSource(join(postsDir, fileName)))
    .sort((left, right) => new Date(right.dateStamp).getTime() - new Date(left.dateStamp).getTime());
}

function parsePostSource(filePath) {
  const source = readFileSync(filePath, 'utf8');
  const titleMatch = source.match(/^title:\s*"(.+)"$/m);
  const slugMatch = source.match(/^slug:\s*"(.+)"$/m);
  const dateMatch = source.match(/^date:\s*"(.+)"$/m);

  if (!titleMatch || !slugMatch || !dateMatch) {
    throw new Error(`Published post is missing expected frontmatter: ${filePath}`);
  }

  return {
    title: titleMatch[1],
    slug: slugMatch[1],
    dateStamp: dateMatch[1],
    canonicalPath: `/blog/${slugMatch[1]}/`,
  };
}
