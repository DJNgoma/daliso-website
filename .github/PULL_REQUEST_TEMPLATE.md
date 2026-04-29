## Summary

- Describe the user-facing, content, build, or deployment change plainly.

## Change type

- [ ] Content or copy
- [ ] Styling or layout
- [ ] Blog, project, feed, or generated-site output
- [ ] Script, build, or test infrastructure
- [ ] Deployment or Cloudflare configuration

## Validation

- [ ] `npm run check` passes locally, or the reason it was not run is noted below
- [ ] Unit coverage that matters for this change is covered by `npm run test:unit`
- [ ] Playwright coverage that matters for this change is covered by `npm run test:e2e`
- [ ] `npm run build:site` was run for generated output, feed, sitemap, API, CSS, or asset changes
- [ ] `npm run sync:projects` was run for project manifest or project catalog changes
- [ ] Performance-sensitive changes were checked against `tests/performance-guardrails.spec.mjs` and, when relevant, Lighthouse/PageSpeed

## Deployment notes

- [ ] This PR does not require deploy-specific follow-up
- [ ] Cloudflare Pages deploy behavior was considered; production deploy runs from `main` after CI
- [ ] Required Cloudflare secrets or repository variables are unchanged, or changes are documented here

## Reviewer focus

- Call out the routes, generated files, scripts, assets, or performance-sensitive areas reviewers should inspect first.
