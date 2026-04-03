import { test, expect } from '@playwright/test';

const FEATURED_ARTICLE_PATH = '/blog/shipping-privacy-and-gated-deploys-on-daliso-com/';
const ARCHIVE_ARTICLE_PATH = '/blog/why-this-site-tends-to-score-well-in-pagespeed-insights/';

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
    await expect(page.locator('.blog-featured-card h3 a')).toHaveAttribute('href', FEATURED_ARTICLE_PATH);
    await expect(page.locator('.blog-featured-card')).toContainText(
      'Shipping Privacy and Gated Deploys on daliso.com'
    );
    await expect(
      page.locator('.blog-post-grid').getByRole('link', {
        name: 'Why This Site Tends to Score Well in PageSpeed Insights',
      })
    ).toHaveAttribute('href', ARCHIVE_ARTICLE_PATH);
    await expect(page.locator('.blog-featured-card')).toContainText('Read article');
  });

  test('article page renders the published post content', async ({ page }) => {
    await page.goto(FEATURED_ARTICLE_PATH);

    await expect(
      page.getByRole('heading', { name: 'Shipping Privacy and Gated Deploys on daliso.com' })
    ).toBeVisible();
    await expect(page.locator('time[datetime="2026-04-03T18:02:00+02:00"]')).toBeVisible();
    await expect(page.locator('.blog-prose')).toContainText(
      'And the release pipeline for daliso.com is now materially harder to break by accident.'
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
