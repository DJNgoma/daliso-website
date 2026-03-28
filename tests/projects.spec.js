import { test, expect } from '@playwright/test';

async function loadProjectsData(request) {
  const response = await request.get('/js/projects-data.json');
  expect(response.ok()).toBeTruthy();
  return response.json();
}

function getCatalogSections(data) {
  return data.projectSections
    .map((section) => ({
      ...section,
      projects: data.projectCatalog.filter((project) => project.category === section.id),
    }))
    .filter((section) => section.projects.length > 0);
}

function getRecentProjects(data) {
  return [...data.projectCatalog]
    .sort(
      (left, right) =>
        new Date(right.lastUpdated).getTime() - new Date(left.lastUpdated).getTime() ||
        left.title.localeCompare(right.title)
    )
    .slice(0, 4);
}

function getCatalogCard(page, title) {
  return page
    .locator('#catalog')
    .getByRole('heading', { name: title, exact: true })
    .locator('xpath=ancestor::article[contains(@class,"repo-card")]');
}

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

  test('project cards render in all curated categories', async ({ page, request }) => {
    const data = await loadProjectsData(request);
    const catalogSections = getCatalogSections(data);

    await page.goto('/projects/');
    await page.waitForSelector('#catalog .repo-card', { timeout: 5000 });

    const categoryHeadings = await page.locator('#catalog-sections .catalog-group-header h3').allTextContents();
    expect(categoryHeadings).toEqual(catalogSections.map((section) => section.title));

    for (const section of catalogSections) {
      const cards = page.locator(`#catalog-sections .catalog-group[data-category="${section.id}"] .repo-card`);
      await expect(cards).toHaveCount(section.projects.length);
    }
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
    await page.waitForSelector('#catalog .repo-card', { timeout: 5000 });

    await expect(page.getByText('AGNedbank2024', { exact: true })).toHaveCount(0);
    await expect(page.getByText('TestWeb', { exact: true })).toHaveCount(0);
    await expect(page.getByText('cin7-product-checker', { exact: true })).toHaveCount(0);
  });

  test('cards without public links still render cleanly', async ({ page }) => {
    await page.goto('/projects/');
    const card = getCatalogCard(page, 'Price Pilot');

    await expect(card).toHaveCount(1);
    await expect(card).toBeVisible();
    await expect(card.locator('.repo-link')).toHaveCount(0);
  });

  test('newly curated repos render in the public catalog', async ({ page }) => {
    await page.goto('/projects/');
    const catalog = page.locator('#catalog');
    await page.waitForSelector('#catalog .repo-card', { timeout: 5000 });

    await expect(catalog.getByRole('heading', { name: "The Devil's AI Dictionary", exact: true })).toBeVisible();
    await expect(catalog.getByRole('heading', { name: 'HeadsetHire', exact: true })).toBeVisible();
    await expect(catalog.getByRole('heading', { name: 'Sentiment Trader', exact: true })).toBeVisible();
    await expect(catalog.getByRole('heading', { name: 'PoolOps', exact: true })).toBeVisible();
    await expect(catalog.getByRole('heading', { name: 'QuickQuote', exact: true })).toBeVisible();
  });

  test('recent activity section renders the latest featured workspace updates', async ({ page, request }) => {
    const data = await loadProjectsData(request);
    const recentProjects = getRecentProjects(data);

    await page.goto('/projects/');
    const recentSection = page.locator('#recent-activity');
    await expect(recentSection).toBeVisible();
    await expect(recentSection.locator('.repo-card')).toHaveCount(recentProjects.length);
    await expect(recentSection.getByRole('heading', { level: 4 })).toHaveText(
      recentProjects.map((project) => project.title)
    );
  });

  test('configured live links use the manifest URLs', async ({ page }) => {
    await page.goto('/projects/');

    const dalisoCard = getCatalogCard(page, 'Daliso.com');
    await expect(dalisoCard).toHaveCount(1);
    await expect(dalisoCard.locator('.repo-link')).toHaveAttribute('href', 'https://daliso.com');
  });

  test('all animate-on-scroll sections become visible after scrolling', async ({ page }) => {
    await page.goto('/projects/');
    await page.waitForSelector('#catalog .repo-card', { timeout: 5000 });

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
