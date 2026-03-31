# Code Change Log

Updated: 31 March 2026

## Source baseline
- Created a fresh implementation branch from `origin/main` instead of continuing on the older audit branch.

## Public pages
- Updated [index.html](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/index.html) with a stronger homepage title, shared icon coverage, improved OG/Twitter metadata, a clearer primary CTA order, and a real main landmark.
- Updated [projects/index.html](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/projects/index.html) to remove internal-source wording from the public copy and align metadata, icons, and accessibility patterns.
- Updated [media/index.html](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/media/index.html), [blog/index.html](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/blog/index.html), and [404.html](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/404.html) for consistent metadata, icon coverage, footer contact clarity, and safer asset references.

## Shared behaviour and styling
- Updated [css/style.css](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/css/style.css) for fixed-header anchor offsets, footer contact styling, and stronger focus-visible behaviour.
- Updated [js/modules/theme.js](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/js/modules/theme.js) so the theme toggle exposes `aria-pressed`, a correct label, and a matching title.
- Updated [js/main.js](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/js/main.js) and [js/projects-page.js](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/js/projects-page.js) to use the new cache-bust version and cleaner public portfolio copy.

## Generated content and assets
- Updated [scripts/blog-generator.mjs](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/scripts/blog-generator.mjs) so generated blog pages inherit the same icon, metadata, nav, and footer changes.
- Regenerated the blog index and generated article pages after updating the generator.
- Replaced [assets/images/og-image.png](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/assets/images/og-image.png) with a lighter `1200x630` site-wide preview asset.
- Added [assets/images/favicon-16x16.png](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/assets/images/favicon-16x16.png), [assets/images/favicon-32x32.png](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/assets/images/favicon-32x32.png), and [assets/images/apple-touch-icon.png](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/assets/images/apple-touch-icon.png).
- Updated [manifest.webmanifest](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/manifest.webmanifest) to reference the new icon set.

## Verification
- Updated Playwright coverage in the existing test suite and added [tests/metadata.spec.js](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/tests/metadata.spec.js).
- Updated the generator test expectations in [tests/blog-generator.spec.mjs](/Users/daliso/.codex/worktrees/74a2/daliso-website-live-reconcile/tests/blog-generator.spec.mjs).
- Verified the full suite with `npm test`.
