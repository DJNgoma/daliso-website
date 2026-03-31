# Reconcile and Safe Polish Summary

Updated: 31 March 2026

## Baseline
- This pass was implemented from `origin/main`, which matched the live public model more closely than the older audit branch.
- Public routes preserved: `/`, `/projects/`, `/media/`, `/blog/`, generated blog post routes, and `/404.html`.
- Public indexing preserved for the homepage, projects, media, blog index, and blog posts.

## Changes made
- Reconciled page heads to a single public baseline across the static entrypoints and generated blog pages.
- Replaced the shared social preview asset with a lighter `1200x630` image at `assets/images/og-image.png`.
- Added `favicon-16x16.png`, `favicon-32x32.png`, and `apple-touch-icon.png`, then linked them across the site and manifest.
- Tightened homepage metadata and CTA order without adding any unverified claims.
- Removed public-facing `Developer workspace` wording from the projects page and its rendering logic.
- Improved shared accessibility and resilience:
  - Skip links now target a real `main#main-content` landmark on core public pages.
  - Theme toggle now exposes `aria-pressed`, a correct title, and a next-action label.
  - Fixed-header anchor offsets are now handled in shared CSS.
  - `404.html` now uses absolute asset paths and is explicitly `noindex, follow`.
- Bumped shared asset versioning to `20260331` for the main CSS/JS path and blog generator output.
- Refreshed automated tests to reflect the live site model, including `Media`, indexed blog content, favicon coverage, and enriched social metadata.

## Verification
- `npm test` passed on 31 March 2026.
- Blog generator tests: `6/6` passed.
- Playwright tests: `67` passed, `1` skipped.

## Not applied
- No new logos, testimonials, client names, quantified outcomes, or event claims were added.
- No broader rewrite of service lines or homepage proof blocks was attempted beyond already-public facts.
- No shared includes/build-system refactor was introduced.

## Owner approval still required
- A stronger manual proof layer: case studies, named partnerships, testimonials, and quantified outcomes.
- A decision on whether the projects page should stay curated-from-data or move to a hand-curated case-study model.
- Richer structured data that depends on confirmed preferred entities and positioning.
