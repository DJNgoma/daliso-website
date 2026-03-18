import { test, expect } from '@playwright/test';

const FEATURED_ARTICLE_PATH = '/blog/my-second-ai-written-post-which-is-already-suspicious/';
const ARCHIVE_ARTICLE_PATH = '/blog/ai-psychosis-and-synthetic-confidence/';

test.describe('Blog pages', () => {
  test('blog index renders generated content and featured article link', async ({ page }) => {
    await page.goto('/blog/');

    await expect(page.getByText('Coming Soon')).toHaveCount(0);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Notes from building African Technopreneurs' })
    ).toBeVisible();
    await expect(
      page.getByRole('heading', {
        level: 2,
        name: 'Writing about judgment, systems, and practical technology where speed matters and bad assumptions compound.',
      })
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Latest article' })).toBeVisible();
    await expect(
      page.locator('.blog-featured-card').getByRole('link', {
        name: 'My Second AI-Written Post, Which Is Already Suspicious',
      })
    ).toHaveAttribute('href', FEATURED_ARTICLE_PATH);
    await expect(
      page.locator('.blog-post-grid').getByRole('link', {
        name: 'AI Psychosis: When Intelligence Becomes Too Convincing',
      })
    ).toHaveAttribute('href', ARCHIVE_ARTICLE_PATH);
    await expect(page.locator('.blog-featured-card')).toContainText('Read article');
  });

  test('article page renders the published post content', async ({ page }) => {
    await page.goto(FEATURED_ARTICLE_PATH);

    await expect(
      page.getByRole('heading', { name: 'My Second AI-Written Post, Which Is Already Suspicious' })
    ).toBeVisible();
    await expect(page.locator('time[datetime="2026-03-18T21:38:42+02:00"]')).toBeVisible();
    await expect(page.locator('.blog-prose')).toContainText(
      'A machine helping write a post about machine-written posts is objectively funny.'
    );
    await expect(page.getByRole('link', { name: 'Back to blog' })).toHaveAttribute('href', '/blog/');
  });

  test('skip link and main content region exist on blog index and article pages', async ({ page }) => {
    for (const path of ['/blog/', FEATURED_ARTICLE_PATH]) {
      await page.goto(path);
      await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main-content');
      await expect(page.locator('main#main-content')).toHaveCount(1);
    }
  });
});
