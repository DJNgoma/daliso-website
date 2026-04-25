---
title: "How We Possibly Got Back to 100 in PageSpeed Insights"
slug: "how-we-possibly-got-back-to-100-in-pagespeed-insights"
description: "A draft field note on chasing the last few PageSpeed points without changing the site architecture, and the memory guardrails needed to stop the same regressions returning."
author: "Daliso Ngoma"
date: "2026-04-26T00:28:38+02:00"
tags:
  - Performance
  - PageSpeed
  - Lighthouse
  - Cloudflare
  - Systems
origin: "ai-assisted"
showOriginLabel: true
---

# How We Possibly Got Back to 100 in PageSpeed Insights

The important word is **possibly**.

PageSpeed Insights is not a permanent property of a website. It is a lab run, with network assumptions, device assumptions, a Lighthouse version, and whatever the edge happens to serve at that moment.

So the goal was not to perform some grand redesign. The goal was smaller and more useful: look at the current misses, avoid breaking the site, and remove the last bits of accidental cost that had crept into the homepage.

## The Baseline

The official PageSpeed API was not available during the check because Google returned a daily quota error.

So I used Lighthouse directly against the live homepage, which is the same fallback this repo already documents.

The live run came back roughly as:

- mobile performance: `94`
- desktop performance: `99`
- mobile FCP: `1.9s`
- mobile LCP: `2.8s`
- mobile Speed Index: `3.0s`
- mobile TBT: `40ms`
- mobile CLS: `0`

That is already healthy. The page was not slow. The problem was that the final points were being lost to small, boring things: render-blocking CSS, unminified CSS, duplicated font transfer, and headers meant for HTML being carried by assets.

## What We Changed

First, the homepage stopped loading two render-blocking CSS files.

Before, it requested the shared bundle and then the homepage stylesheet:

- `/css/style.css`
- `/css/pages/home.css`

Now the build creates a generated homepage bundle:

- `/css/home.css`

That bundle keeps the editable source files intact, but gives the homepage one stylesheet on the critical path.

Second, generated CSS is minified.

The source files stay readable. The generated files become smaller. That is the right place to make this tradeoff, because nobody should be hand-editing the generated bundle anyway.

Third, the duplicate Inter font transfer was removed.

The Inter 400 and Inter 600 font files were byte-identical. Preloading both meant the browser could fetch the same font twice under two URLs. The CSS now points both weights at the same file, and the duplicate preload is gone.

Fourth, HTML-only headers were moved out of asset responses.

The live site was sending the long discovery `Link` header, `Vary: Accept`, and `no-transform` to CSS, JS, fonts, and images. Those headers are useful for HTML and agent-readable content negotiation, but not for every asset.

The site still keeps `no-transform` on HTML, because that protects against Cloudflare rewriting email links and injecting the old email decoder script. But assets should not inherit that rule. They need to stay cacheable, compressible, and boring.

Fifth, custom fonts were told to stop holding the first text paint hostage.

The hero headline is the mobile LCP element. The site still uses its custom fonts, but the font faces now use `font-display: optional` so a slow font fetch does not delay readable text on constrained Lighthouse-style mobile runs.

## What We Did Not Change

We did not add a framework.

We did not inline a large block of critical CSS.

We did not remove the hero image preload.

We did not mark unfingerprinted JavaScript as immutable.

We did not remove the agent-readable surfaces that make the site useful to crawlers, assistants, and search tools.

That matters. Getting a score back is not worth making the site harder to maintain or easier to break.

## The Real Lesson

The last few PageSpeed points usually do not come from heroics.

They come from remembering that every extra request, duplicate byte, broad header, and accidental edge behavior still counts.

This is why performance guardrails matter more than performance stunts.

## Memory Notes for Future Runs

If this needs to go into Codex memory, the useful version is not "the site got 100."

The useful version is:

- For `daliso-website`, live PageSpeed can be blocked by the official PSI API quota, so use Lighthouse against `https://daliso.com/` as the fallback and record the exact Lighthouse version.
- Keep homepage CSS on the generated `/css/home.css` bundle; do not make the homepage request both `/css/style.css` and `/css/pages/home.css`.
- Keep generated CSS minified, but keep the editable source files readable.
- Keep HTML `Cache-Control: public, max-age=0, must-revalidate, no-transform` in the Cloudflare Pages middleware unless Cloudflare email obfuscation is disabled another way.
- Do not let `no-transform`, long discovery `Link` headers, or `Vary: Accept` leak onto `/css/*`, `/js/*`, `/assets/*`, fonts, or images.
- Do not preload both Inter font files while the Inter 400 and Inter 600 files are byte-identical.
- Keep critical custom fonts on `font-display: optional` unless there is a deliberate visual reason to trade slower mobile text paint for font fidelity.
- Do not mark unfingerprinted `/js/*` or `/css/*` as immutable; this repo already had a Safari/WebKit stale-module incident from that pattern.
- Before calling it fixed, run `npm run check`, inspect live headers after deploy, and run Lighthouse or PageSpeed against the live homepage.

## Draft Notes Before Publishing

- Replace "possibly" with a firmer claim only after the deployed homepage has a fresh PageSpeed or Lighthouse result.
- Add the final deployed score and fetch time.
- Consider including the before/after request list if the story needs evidence rather than just explanation.
