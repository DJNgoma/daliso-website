import { test, expect } from '@playwright/test';

const SHARED_CSS_PARTIALS = [
  '/css/fonts.css',
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/animations.css',
];

test.describe('Performance guardrails', () => {
  test('homepage avoids the shared CSS import waterfall', async ({ page }) => {
    const cssRequests = new Set();

    page.on('requestfinished', request => {
      const url = new URL(request.url());
      if (url.pathname.endsWith('.css')) {
        cssRequests.add(url.pathname);
      }
    });

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    expect(cssRequests.has('/css/style.css')).toBe(true);

    for (const cssPath of SHARED_CSS_PARTIALS) {
      expect(cssRequests.has(cssPath)).toBe(false);
    }
  });

  test('homepage hero and shared logo use optimized assets', async ({ page }) => {
    await page.goto('/');

    const heroCurrentSrc = await page.locator('.home-hero-split picture img').evaluate(image => image.currentSrc);
    expect(heroCurrentSrc).toContain('.webp');

    const logo = page.locator('#site-logo');
    await expect(logo).toHaveAttribute('src', /logo-120\.webp/);

    await page.click('#theme-toggle');
    await expect(logo).toHaveAttribute('src', /logo-120\.webp/);
  });
});
