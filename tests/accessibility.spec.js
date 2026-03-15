import { test, expect } from '@playwright/test';

test.describe('Accessibility', () => {
  test('skip link exists and points to main content', async ({ page }) => {
    await page.goto('/');
    const skipLink = page.locator('.skip-link');
    await expect(skipLink).toHaveCount(1);
    const href = await skipLink.getAttribute('href');
    expect(href).toMatch(/^#/);
  });

  test('hamburger has aria-label', async ({ page }) => {
    await page.goto('/');
    const hamburger = page.locator('#hamburger');
    await expect(hamburger).toHaveAttribute('aria-label');
  });

  test('theme toggle has aria-label', async ({ page }) => {
    await page.goto('/');
    const toggle = page.locator('#theme-toggle');
    await expect(toggle).toHaveAttribute('aria-label');
  });

  test('images have alt text', async ({ page }) => {
    await page.goto('/');
    const images = page.locator('img');
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt');
      expect(alt).toBeTruthy();
    }
  });

  test('social links have aria-labels', async ({ page }) => {
    await page.goto('/');
    const socialLinks = page.locator('.social-links a');
    const count = await socialLinks.count();
    for (let i = 0; i < count; i++) {
      const ariaLabel = await socialLinks.nth(i).getAttribute('aria-label');
      expect(ariaLabel).toBeTruthy();
    }
  });
});
