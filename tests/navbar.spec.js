import { test, expect } from '@playwright/test';

const EXPECTED_NAV_ITEMS = ['Home', 'About', 'Work', 'Projects', 'Media', 'Blog'];
const EXPECTED_NAV_HREFS = ['/', '/about/', '/work/', '/projects/', '/media/', '/blog/'];
const SHARED_CHROME_PATHS = [
  '/',
  '/about/',
  '/work/',
  '/projects/',
  '/media/',
  '/blog/',
  '/privacy/',
  '/blog/ai-psychosis-and-synthetic-confidence/',
];

test.describe('Navbar consistency', () => {
  test('main page has correct nav items', async ({ page }) => {
    await page.goto('/');
    const navItems = await page.locator('.nav-menu a').allTextContents();
    expect(navItems).toEqual(EXPECTED_NAV_ITEMS);
  });

  test('home page nav points to standalone routes', async ({ page }) => {
    await page.goto('/');
    const navHrefs = await page.locator('.nav-menu a').evaluateAll((links) =>
      links.map((link) => link.getAttribute('href'))
    );
    expect(navHrefs).toEqual(EXPECTED_NAV_HREFS);
  });

  test('about page has correct nav items and renders its hero', async ({ page }) => {
    await page.goto('/about/');
    const navItems = await page.locator('.nav-menu a').allTextContents();
    expect(navItems).toEqual(EXPECTED_NAV_ITEMS);
    await expect(page.getByRole('heading', { name: 'About Me' })).toBeVisible();
  });

  test('work page has correct nav items and renders its hero', async ({ page }) => {
    await page.goto('/work/');
    const navItems = await page.locator('.nav-menu a').allTextContents();
    expect(navItems).toEqual(EXPECTED_NAV_ITEMS);
    await expect(page.getByRole('heading', { name: 'My Work' })).toBeVisible();
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
    await expect(logo).toHaveAttribute('src', /logo-120\.webp/);
    const naturalWidth = await logo.evaluate(img => img.naturalWidth);
    expect(naturalWidth).toBeGreaterThan(0);
  });

  test('logo renders on projects page', async ({ page }) => {
    await page.goto('/projects/');
    const logo = page.locator('#site-logo');
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('src', /logo-120\.webp/);
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

  test('mobile menu routes About and Work to standalone pages', async ({ page, viewport }) => {
    if (viewport.width > 768) {
      test.skip();
    }

    await page.goto('/');
    await page.locator('#hamburger').click();
    await page.locator('#nav-menu a', { hasText: 'About' }).click();
    await expect(page).toHaveURL(/\/about\/$/);
    await expect(page.getByRole('heading', { name: 'About Me' })).toBeVisible();

    await page.goto('/');
    await page.locator('#hamburger').click();
    await page.locator('#nav-menu a', { hasText: 'Work' }).click();
    await expect(page).toHaveURL(/\/work\/$/);
    await expect(page.getByRole('heading', { name: 'My Work' })).toBeVisible();
  });

  test('blog page has correct nav items', async ({ page }) => {
    await page.goto('/blog/');
    const navItems = await page.locator('.nav-menu a').allTextContents();
    expect(navItems).toEqual(EXPECTED_NAV_ITEMS);
  });

  test('media page has correct nav items', async ({ page }) => {
    await page.goto('/media/');
    const navItems = await page.locator('.nav-menu a').allTextContents();
    expect(navItems).toEqual(EXPECTED_NAV_ITEMS);
  });

  test('privacy page has correct nav items', async ({ page }) => {
    await page.goto('/privacy/');
    const navItems = await page.locator('.nav-menu a').allTextContents();
    expect(navItems).toEqual(EXPECTED_NAV_ITEMS);
  });

  test('blog article page has correct nav items', async ({ page }) => {
    await page.goto('/blog/ai-psychosis-and-synthetic-confidence/');
    const navItems = await page.locator('.nav-menu a').allTextContents();
    expect(navItems).toEqual(EXPECTED_NAV_ITEMS);
  });

  test('theme toggle exists on all pages', async ({ page }) => {
    for (const path of SHARED_CHROME_PATHS) {
      await page.goto(path);
      await expect(page.locator('#theme-toggle')).toBeVisible();
    }
  });

  test('footer has contact icons on all pages', async ({ page }) => {
    for (const path of SHARED_CHROME_PATHS) {
      await page.goto(path);
      const socialLinks = page.locator('footer .social-links a');
      await expect(socialLinks).toHaveCount(4);
    }
  });

  test('privacy page exposes policy heading and footer link', async ({ page }) => {
    await page.goto('/privacy/');
    await expect(page.getByRole('heading', { name: 'Privacy policy for the apps I publish.' })).toBeVisible();
    await expect(page.locator('footer a[href="/privacy/"]')).toHaveText('Privacy Policy');
  });
});
