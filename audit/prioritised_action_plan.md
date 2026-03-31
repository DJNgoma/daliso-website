# Prioritised Action Plan

Updated: 31 March 2026

## Closed in this pass
| Status | Severity | Item | Outcome |
| --- | --- | --- | --- |
| Closed | Important | Reconcile repo to live public baseline | `origin/main` baseline preserved live routes, indexed blog/projects/media, and production nav structure. |
| Closed | Important | Remove stale internal-facing portfolio wording | Public projects page no longer markets itself as a `Developer workspace` view. |
| Closed | Important | Replace heavy shared OG asset | Site-wide preview image is now a lighter `1200x630` asset. |
| Closed | Important | Add broader favicon coverage | Added PNG favicon sizes plus `apple-touch-icon` and linked them across the site. |
| Closed | Important | Tighten shared accessibility | Core pages now expose real main-landmark skip links, clearer theme toggle state, and safer anchor offsets. |
| Closed | Important | Refresh automated verification | Tests now cover the live nav/routes/content model and current metadata baseline. |

## Open next
| Severity | Item | Why it matters | Next step |
| --- | --- | --- | --- |
| Important | Owner-approved proof layer | The site still avoids stronger trust signals because verified claims were intentionally not invented. | Add named proof only after confirming what can be published. |
| Important | Projects page curation model | The current page is cleaner, but it still depends on a data-driven portfolio rather than hand-curated case studies. | Decide whether to keep the live catalog model or replace it with manual featured work. |
| Nice-to-have | Shared head/nav/footer extraction | Static pages are now consistent, but repetition still exists. | Extract shared partials only if the site grows further or edit frequency increases. |
| Nice-to-have | Structured data expansion | Current metadata is cleaner, but schema can go further once preferred entities are confirmed. | Add richer `Person`, `Organization`, and article-level schema after approval. |
| Nice-to-have | Broader installable-app icon set | The favicon and Apple touch coverage are improved, but manifest icons are still modest. | Add larger PWA icons only if installability becomes a real requirement. |
