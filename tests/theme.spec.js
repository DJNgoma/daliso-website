import { test, expect } from '@playwright/test';

test.describe('Theme toggle', () => {
  test('toggles between light and dark mode', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const toggle = page.locator('#theme-toggle');
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('title', 'Switch to dark mode');

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle).toHaveAttribute('title', 'Switch to light mode');

    await toggle.click();
    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle).toHaveAttribute('title', 'Switch to dark mode');
  });

  test('home wordmark stays stable across theme changes', async ({ page }) => {
    await page.goto('/');
    const logo = page.locator('#site-logo');
    await expect(logo).toHaveText('daliso');

    await page.click('#theme-toggle');
    await expect(logo).toHaveText('daliso');
  });

  test('theme persists across navigation', async ({ page }) => {
    await page.goto('/');
    await page.click('#theme-toggle');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.goto('/projects/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.goto('/media/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.goto('/blog/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.goto('/blog/ai-psychosis-and-synthetic-confidence/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });
});
