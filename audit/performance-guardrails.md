# Performance Guardrails

Updated: 10 April 2026

## Live Snapshot

The official PageSpeed Insights API returned a Google quota error on 3 April 2026, so the live check was taken with Lighthouse directly against `https://daliso.com/` from this workspace instead.

- Desktop performance: `100`
- Mobile performance: `94`
- Mobile lab metrics: `FCP 2.0s`, `LCP 2.7s`, `Speed Index 2.4s`, `TBT 0ms`, `CLS 0`

That means the site is still excellent on desktop, but it is not currently a stable mobile `100`.

## What Pulled Mobile Down

1. Shared CSS was still chained through `@import`.
   `css/style.css` loaded `fonts.css`, `base.css`, `layout.css`, `components.css`, and `animations.css` after the initial stylesheet request, which created an avoidable render-blocking waterfall.

2. The nav logo could trigger duplicate image fetches.
   The previous theme script swapped between `logo-160.png` and `logo_white-160.png`, so theme resolution could download both assets during the critical path.

3. Critical images were still using older formats.
   The homepage hero and nav logo were both good candidates for smaller WebP assets.

4. Cloudflare was mutating the HTML response.
   Live Lighthouse saw `cdn-cgi/scripts/.../email-decode.min.js` injected into the page. That is outside the repo's HTML source, but it still sits in the render-blocking path.

## Repo Changes Shipped

- Added `scripts/build-css.mjs` and now generate `css/style.css` as a real bundle instead of relying on runtime CSS imports.
- Switched the shared nav logo to lighter WebP assets and kept the light/dark swap in the theme module.
- Added `hero-320.webp` and `hero-640.webp` and updated the homepage hero markup to prefer WebP.
- Added a small head theme bootstrap so dark-mode users do not wait for the module script before the correct theme is applied.
- Added `Cache-Control: ... no-transform` to the default HTML header rule to stop Cloudflare HTML rewrites from reintroducing the email decoder script.
- Added performance guardrail coverage in `tests/performance.spec.js`.

## Safari Cache Incident: 10 April 2026

The homepage route links worked in preview but failed on the live site in Safari and WebKit-based clients because shared JS under `/js/*` was still marked `immutable` even though those files were not content-hashed filenames.

- The live HTML had already moved to the new entrypoint URL, but Safari could still execute an older cached `main.js` body.
- That stale module imported `nav-menu.js?v=20260403-perf`, which rewrote `About` and `Work` back to `/#about` and `/#work`.
- The fix was to change shared JS cache headers to `max-age=0, must-revalidate`, rotate the shared entrypoint version again, and add a guardrail test in `tests/performance-guardrails.spec.mjs` so unfingerprinted JS cannot be marked immutable again.

## Guardrails

- Keep shared CSS source files in `css/`, but always serve the generated bundle in `css/style.css`.
- Keep the homepage on the generated `css/home.css` bundle so it does not request both shared CSS and page CSS on the critical path.
- Keep shared JS entrypoints revalidating unless the repo moves to content-hashed filenames for public modules.
- Do not reintroduce JS-driven image swaps for above-the-fold assets.
- Keep the homepage hero and nav logo in modern, tightly sized formats.
- Preserve HTML `no-transform` unless Cloudflare email obfuscation is disabled another way, but do not apply it to CSS, JS, fonts, images, or other assets.
- Keep HTML-only discovery headers (`Link` and `Vary: Accept`) out of asset responses.
- Do not preload both Inter font files while they are byte-identical.
- Treat third-party or edge-injected scripts as performance regressions unless they are clearly worth the cost.

## Verification Workflow

1. Run `npm test`.
2. If shared styles or homepage assets change, confirm `tests/performance.spec.js` still passes.
3. Before or after deploy, run Lighthouse against the live homepage:

```bash
npx lighthouse https://daliso.com \
  --only-categories=performance \
  --output=json \
  --output-path=./audit/lighthouse-mobile.json \
  --quiet
```

4. Check specifically for:
   - render-blocking CSS regressions
   - duplicate logo requests
   - large image-delivery savings
   - any injected `cdn-cgi` scripts on the homepage
