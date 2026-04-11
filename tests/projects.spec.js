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

function getLiveAppProjects(data) {
  return data.projectCatalog.filter((project) =>
    Array.isArray(project.links) && project.links.some((link) => link.kind === 'appstore')
  );
}

function getCatalogCard(page, title) {
  return page
    .locator('#catalogue')
    .getByRole('heading', { name: title, exact: true })
    .locator('xpath=ancestor::article[contains(@class,"repo-card")]');
}

test.describe('Projects page', () => {
  test('catalog section is visible (no whitespace bug)', async ({ page }) => {
    await page.goto('/projects/');
    const catalog = page.locator('#catalogue');
    await expect(catalog).toBeVisible({ timeout: 5000 });
  });

  test('hero metrics render', async ({ page }) => {
    await page.goto('/projects/');
    const metrics = page.locator('.metric-card');
    await expect(metrics).not.toHaveCount(0);
    const count = await metrics.count();
    expect(count).toBe(5);
    await expect(metrics.nth(0).locator('span')).toHaveText('Featured projects');
    await expect(metrics.nth(1).locator('span')).toHaveText('Categories');
    await expect(metrics.nth(2).locator('span')).toHaveText('Live apps');
    await expect(metrics.nth(3).locator('span')).toHaveText('Live links');
    await expect(metrics.nth(4).locator('span')).toHaveText('Last refresh');
  });

  test('live apps section renders published App Store projects', async ({ page, request }) => {
    const data = await loadProjectsData(request);
    const liveApps = getLiveAppProjects(data);

    await page.goto('/projects/');
    const section = page.locator('#live-apps');
    await expect(section).toBeVisible();

    const cards = section.locator('.repo-card');
    await expect(cards).toHaveCount(liveApps.length);

    for (const project of liveApps) {
      await expect(section.getByRole('heading', { name: project.title, exact: true })).toBeVisible();
    }
  });

  test('project cards render in all curated categories', async ({ page, request }) => {
    const data = await loadProjectsData(request);
    const catalogSections = getCatalogSections(data);

    await page.goto('/projects/');
    await page.waitForSelector('#catalogue .repo-card', { timeout: 5000 });

    const categoryHeadings = await page.locator('#catalog-sections .catalog-group-header h3').allTextContents();
    expect(categoryHeadings).toEqual(catalogSections.map((section) => section.title));

    for (const section of catalogSections) {
      const cards = page.locator(`#catalog-sections .catalog-group[data-category="${section.id}"] .repo-card`);
      await expect(cards).toHaveCount(section.projects.length);
    }
  });

  test('glossary renders status definitions', async ({ page }) => {
    await page.goto('/projects/');
    const summaryCards = page.locator('.summary-card');
    await expect(summaryCards).toHaveCount(4);
    await expect(page.getByRole('heading', { name: 'Live', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Building', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Operational', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Prototype', exact: true })).toBeVisible();
  });

  test('glossary must not contain old summary-card content', async ({ page }) => {
    await page.goto('/projects/');
    await page.waitForSelector('.summary-card', { timeout: 5000 });
    const grid = page.locator('#summary-grid');
    await expect(grid.getByText('Live on the web')).toHaveCount(0);
    await expect(grid.getByText('Products and commerce')).toHaveCount(0);
    await expect(grid.getByText('Portfolio curation')).toHaveCount(0);
  });

  test('excluded folders do not appear in the public catalog', async ({ page }) => {
    await page.goto('/projects/');
    await page.waitForSelector('#catalogue .repo-card', { timeout: 5000 });

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
    const catalog = page.locator('#catalogue');
    await page.waitForSelector('#catalogue .repo-card', { timeout: 5000 });

    await expect(catalog.getByRole('heading', { name: "The Devil's AI Dictionary", exact: true })).toBeVisible();
    await expect(catalog.getByRole('heading', { name: 'HeadsetHire', exact: true })).toBeVisible();
    await expect(catalog.getByRole('heading', { name: 'Sentiment Trader', exact: true })).toBeVisible();
    await expect(catalog.getByRole('heading', { name: 'Pool Clarity', exact: true })).toBeVisible();
    await expect(catalog.getByRole('heading', { name: 'FlashQuote', exact: true })).toBeVisible();
  });

  test('recent activity filter shows the latest workspace updates', async ({ page, request }) => {
    const data = await loadProjectsData(request);
    const recentProjects = getRecentProjects(data);

    await page.goto('/projects/');
    await page.waitForSelector('#catalogue .repo-card', { timeout: 5000 });

    const isMobile = (await page.viewportSize()).width <= 768;
    if (isMobile) {
      await page.selectOption('#filter-select', 'recent');
    } else {
      await page.click('[data-filter="recent"]');
    }
    const visibleCards = page.locator('#catalog-sections .repo-card:not(.repo-card--hidden)');
    await expect(visibleCards).toHaveCount(recentProjects.length);
  });

  test('configured live links use the manifest URLs', async ({ page }) => {
    await page.goto('/projects/');

    const dalisoCard = getCatalogCard(page, 'Daliso.com');
    await expect(dalisoCard).toHaveCount(1);
    await expect(dalisoCard.locator('.repo-link')).toHaveAttribute('href', 'https://daliso.com');
  });

  test('Just apps link back to justsomething.app', async ({ page }) => {
    await page.goto('/projects/');

    for (const title of ['Just BP', 'Just Glucose', 'Just Weight - No Wait']) {
      const card = getCatalogCard(page, title);
      await expect(card).toHaveCount(1);
      await expect(card.getByRole('link', { name: 'Visit site' })).toHaveAttribute('href', 'https://justsomething.app');
    }
  });

  test('It’s a Date links to its public website', async ({ page }) => {
    await page.goto('/projects/');

    const card = getCatalogCard(page, 'It’s a Date — Scheduler');
    await expect(card).toHaveCount(1);
    await expect(card.getByRole('link', { name: 'Visit site' })).toHaveAttribute('href', 'https://itsadate.to/');
  });

  test('all animate-on-scroll sections become visible after scrolling', async ({ page }) => {
    await page.goto('/projects/');
    await page.waitForSelector('#catalogue .repo-card', { timeout: 5000 });

    // Scroll through the entire page to trigger all IntersectionObservers
    await page.evaluate(async () => {
      const step = Math.max(Math.floor(window.innerHeight * 0.6), 200);
      const max = document.documentElement.scrollHeight;
      for (let y = 0; y < max; y += step) {
        window.scrollTo(0, y);
        await new Promise(r => setTimeout(r, 100));
      }

      window.scrollTo(0, max);
      await new Promise(r => setTimeout(r, 250));
    });

    const sections = page.locator('.animate-on-scroll');
    const count = await sections.count();
    for (let i = 0; i < count; i++) {
      const section = sections.nth(i);
      await expect(section).toHaveClass(/visible/);
    }
  });
});
