import { test, expect } from '@playwright/test';

const EXPECTED_NAV_ITEMS = ['About', 'Work', 'Projects', 'Podcast', 'Contact'];

test.describe('Navbar consistency', () => {
  test('main page has correct nav items', async ({ page }) => {
    await page.goto('/');
    const navItems = await page.locator('.nav-menu a').allTextContents();
    expect(navItems).toEqual(EXPECTED_NAV_ITEMS);
  });

  test('projects page has correct nav items', async ({ page }) => {
    await page.goto('/projects/');
    const navItems = await page.locator('.nav-menu a').allTextContents();
    expect(navItems).toEqual(EXPECTED_NAV_ITEMS);
  });

  test('logo renders on main page', async ({ page }) => {
    await page.goto('/');
    const logo = page.locator('#site-logo');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('src', /logo-160\.png/);
    const naturalWidth = await logo.evaluate(img => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('logo renders on projects page', async ({ page }) => {
    await page.goto('/projects/');
    const logo = page.locator('#site-logo');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('src', /logo-160\.png/);
    const naturalWidth = await logo.evaluate(img => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('hamburger menu works on mobile', async ({ page, viewport }) => {
    if (viewport.width > 768) {
      test.skip();
    }
    await page.goto('/');
    const hamburger = page.locator('#hamburger');
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    const navMenu = page.locator('.nav-menu');
    await expect(navMenu).toHaveClass(/show/);
  });

  test('theme toggle exists on both pages', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#theme-toggle')).toBeVisible();

    await page.goto('/projects/');
    await expect(page.locator('#theme-toggle')).toBeVisible();
  });
});
