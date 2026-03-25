import { test, expect } from '@playwright/test';

test.describe('Projects page', () => {
  test('catalog section is visible (no whitespace bug)', async ({ page }) => {
    await page.goto('/projects/');
    const catalog = page.locator('#catalog');
    await expect(catalog).toBeVisible({ timeout: 5000 });
  });

  test('hero metrics render', async ({ page }) => {
    await page.goto('/projects/');
    const metrics = page.locator('.metric-card');
    await expect(metrics).not.toHaveCount(0);
    const count = await metrics.count();
    expect(count).toBe(4);
    await expect(metrics.nth(0).locator('span')).toHaveText('Featured projects');
    await expect(metrics.nth(1).locator('span')).toHaveText('Categories');
    await expect(metrics.nth(2).locator('span')).toHaveText('Live links');
    await expect(metrics.nth(3).locator('span')).toHaveText('Last sync');
  });

  test('project cards render in all curated categories', async ({ page }) => {
    await page.goto('/projects/');
    await page.waitForSelector('.repo-card', { timeout: 5000 });
    const categoryHeadings = await page.locator('.catalog-group-header h3').allTextContents();
    expect(categoryHeadings).toEqual([
      'Websites & Publishing',
      'Products & Commerce',
      'Internal Systems',
      'Experiments & Tools',
    ]);

    const cards = page.locator('#catalog .repo-card');
    await expect(cards).toHaveCount(17);
  });

  test('summary grid renders', async ({ page }) => {
    await page.goto('/projects/');
    const summaryCards = page.locator('.summary-card');
    await expect(summaryCards).not.toHaveCount(0);
    await expect(page.getByText('Live on the web')).toBeVisible();
    await expect(page.getByText('Curated from Developer')).toBeVisible();
    await expect(page.getByText('Latest featured movement')).toBeVisible();
  });

  test('excluded folders do not appear in the public catalog', async ({ page }) => {
    await page.goto('/projects/');
    await page.waitForSelector('.repo-card', { timeout: 5000 });

    await expect(page.getByText('AGNedbank2024', { exact: true })).toHaveCount(0);
    await expect(page.getByText('TestWeb', { exact: true })).toHaveCount(0);
    await expect(page.getByText('cin7-product-checker', { exact: true })).toHaveCount(0);
  });

  test('cards without public links still render cleanly', async ({ page }) => {
    await page.goto('/projects/');
    const card = page.locator('.repo-card', {
      has: page.getByRole('heading', { name: 'Price Pilot' }),
    });

    await expect(card).toBeVisible();
    await expect(card.locator('.repo-link')).toHaveCount(0);
  });

  test('newly curated repos render in the public catalog', async ({ page }) => {
    await page.goto('/projects/');
    await page.waitForSelector('.repo-card', { timeout: 5000 });

    await expect(page.getByRole('heading', { name: "The Devil's AI Dictionary" })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'HeadsetHire' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Sentiment Trader' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'PoolOps' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'QuickQuote' })).toBeVisible();
  });

  test('recent activity section renders the latest featured workspace updates', async ({ page }) => {
    await page.goto('/projects/');
    const recentSection = page.locator('#recent-activity');
    await expect(recentSection).toBeVisible();
    await expect(recentSection.locator('.repo-card')).toHaveCount(4);
  });

  test('configured live links use the manifest URLs', async ({ page }) => {
    await page.goto('/projects/');

    const dalisoCard = page.locator('.repo-card', {
      has: page.getByRole('heading', { name: 'Daliso.com' }),
    });
    await expect(dalisoCard.locator('.repo-link')).toHaveAttribute('href', 'https://daliso.com');
  });

  test('all animate-on-scroll sections become visible after scrolling', async ({ page }) => {
    await page.goto('/projects/');
    await page.waitForSelector('.repo-card', { timeout: 5000 });

    // Scroll through the entire page to trigger all IntersectionObservers
    await page.evaluate(async () => {
      const step = window.innerHeight;
      const max = document.documentElement.scrollHeight;
      for (let y = 0; y < max; y += step) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 100));
      }
    });

    const sections = page.locator('.animate-on-scroll');
    const count = await sections.count();
    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      await expect(section).toHaveClass(/visible/);
    }
  });
});
