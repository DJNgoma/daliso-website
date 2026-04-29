import { test, expect } from '@playwright/test';

const CORE_PUBLIC_PATHS = [
  '/',
  '/about/',
  '/work/',
  '/projects/',
  '/media/',
  '/media/coding-with-ai/',
  '/blog/',
  '/privacy/',
  '/support/',
  '/blog/why-this-site-tends-to-score-well-in-pagespeed-insights/',
];

const SOCIAL_METADATA_PATHS = [
  ...new Set([
    ...CORE_PUBLIC_PATHS,
    '/404.html',
    '/blog/ai-psychosis-and-synthetic-confidence/',
    '/blog/how-we-got-from-23-to-92-on-is-your-site-agent-ready/',
    '/blog/my-second-ai-written-post-which-is-already-suspicious/',
    '/blog/shipping-privacy-and-gated-deploys-on-daliso-com/',
    '/blog/why-this-site-tends-to-score-well-in-pagespeed-insights/',
  ]),
];

test.describe('Metadata', () => {
  test('core public pages include png favicon and apple touch icon references', async ({ page }) => {
    for (const path of CORE_PUBLIC_PATHS) {
      await page.goto(path);
      await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute(
        'href',
        '/assets/images/apple-touch-icon.png'
      );
      await expect(page.locator('link[rel="icon"][sizes="32x32"]')).toHaveAttribute(
        'href',
        '/assets/images/favicon-32x32.png'
      );
      await expect(page.locator('link[rel="icon"][sizes="16x16"]')).toHaveAttribute(
        'href',
        '/assets/images/favicon-16x16.png'
      );
    }
  });

  test('public pages include enriched social metadata', async ({ page }) => {
    for (const path of SOCIAL_METADATA_PATHS) {
      await page.goto(path);
      await expect(page.locator('meta[property="og:site_name"]')).toHaveAttribute('content', 'Daliso Ngoma');
      await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', /preview card/i);
      await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute('content', /preview card/i);
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
      await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute('content', 'image/png');
      await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute('content', '1200');
      await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute('content', '630');
      await expect(page.locator('meta[name="twitter:image"]')).toHaveCount(1);
    }
  });
});
