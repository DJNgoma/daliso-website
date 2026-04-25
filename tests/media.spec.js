import { test, expect } from '@playwright/test';

test.describe('Media talks', () => {
  test('media page links to the Coding with AI talk detail page', async ({ page }) => {
    await page.goto('/media/');

    const card = page.locator('.media-card', { has: page.getByRole('heading', { name: 'Coding with AI' }) });
    await expect(card).toBeVisible();
    await expect(card.getByRole('link', { name: /View Talk/ })).toHaveAttribute(
      'href',
      '/media/coding-with-ai/'
    );
    await expect(card.getByRole('link', { name: /Download PDF/ })).toHaveAttribute(
      'href',
      '/media/coding-with-ai/coding-with-ai.pdf'
    );
  });

  test('Coding with AI detail page embeds the deck and keeps download fallbacks', async ({ page }) => {
    await page.goto('/media/coding-with-ai/');

    await expect(page.getByRole('heading', { level: 1, name: 'Coding with AI' })).toBeVisible();
    await expect(page.locator('.talk-meta').getByText('Gauteng AI Community', { exact: true })).toBeVisible();

    const deckFrame = page.locator('iframe.talk-deck-frame');
    await expect(deckFrame).toHaveAttribute('src', '/media/coding-with-ai/deck');

    const frame = page.frameLocator('iframe.talk-deck-frame');
    await expect(frame.locator('body')).toContainText('Coding with AI');

    await expect(page.getByRole('link', { name: /Open full-screen deck/ })).toHaveAttribute(
      'href',
      '/media/coding-with-ai/deck'
    );
    await expect(page.getByRole('link', { name: /Download PDF/ }).last()).toHaveAttribute(
      'href',
      '/media/coding-with-ai/coding-with-ai.pdf'
    );
  });

  test('deck and PDF assets are served with useful content types', async ({ request }) => {
    const deckResponse = await request.get('/media/coding-with-ai/deck');
    expect(deckResponse.ok()).toBe(true);
    expect(deckResponse.headers()['content-type']).toContain('text/html');

    const pdfResponse = await request.get('/media/coding-with-ai/coding-with-ai.pdf');
    expect(pdfResponse.ok()).toBe(true);
    expect(pdfResponse.headers()['content-type']).toContain('application/pdf');
  });
});
