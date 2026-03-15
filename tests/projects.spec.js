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
  });

  test('project cards render in catalog', async ({ page }) => {
    await page.goto('/projects/');
    await page.waitForSelector('.repo-card', { timeout: 5000 });
    const cards = page.locator('.repo-card');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('summary grid renders', async ({ page }) => {
    await page.goto('/projects/');
    const summaryCards = page.locator('.summary-card');
    await expect(summaryCards).not.toHaveCount(0);
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
