import { test, expect } from '@playwright/test';

const CORE_PUBLIC_PATHS = ['/', '/projects/', '/media/', '/blog/', '/blog/ai-psychosis-and-synthetic-confidence/'];

test.describe('Accessibility', () => {
  test('skip link exists and points to the main landmark on core public pages', async ({ page }) => {
    for (const path of CORE_PUBLIC_PATHS) {
      await page.goto(path);
      await expect(page.locator('.skip-link')).toHaveAttribute('href', '#main-content');
      await expect(page.locator('main#main-content')).toHaveCount(1);
    }
  });

  test('hamburger has aria-label on core public pages', async ({ page }) => {
    for (const path of CORE_PUBLIC_PATHS) {
      await page.goto(path);
      await expect(page.locator('#hamburger')).toHaveAttribute('aria-label');
    }
  });

  test('theme toggle exposes accessible state on core public pages', async ({ page }) => {
    for (const path of CORE_PUBLIC_PATHS) {
      await page.goto(path);
      const toggle = page.locator('#theme-toggle');
      await expect(toggle).toHaveAttribute('aria-label');
      await expect(toggle).toHaveAttribute('aria-pressed');
      await expect(toggle).toHaveAttribute('title');
    }
  });

  test('images have alt text on core public pages', async ({ page }) => {
    for (const path of CORE_PUBLIC_PATHS) {
      await page.goto(path);
      const images = page.locator('img');
      const count = await images.count();
      for (let i = 0; i < count; i++) {
        const alt = await images.nth(i).getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    }
  });

  test('social links have aria-labels on core public pages', async ({ page }) => {
    for (const path of CORE_PUBLIC_PATHS) {
      await page.goto(path);
      const socialLinks = page.locator('.social-links a');
      const count = await socialLinks.count();
      for (let i = 0; i < count; i++) {
        const ariaLabel = await socialLinks.nth(i).getAttribute('aria-label');
        expect(ariaLabel).toBeTruthy();
      }
    }
  });

  test('home content remains visible without JavaScript', async ({ browser }) => {
    const page = await browser.newPage({
      javaScriptEnabled: false,
      viewport: { width: 375, height: 812 },
    });

    await page.goto('/');
    await expect(page.locator('.hero-content')).toBeVisible();
    await expect(page.getByRole('heading', { level: 1, name: 'Daliso Ngoma' })).toBeVisible();
  });
});
