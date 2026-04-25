# Daliso Ngoma – Personal Website

Welcome to the source code for [daliso.com](https://daliso.com) — the personal site of Daliso Ngoma, Founder & Managing Director of African Technopreneurs and host of the African Techno Podcast.

This website is a fast, responsive, and accessible portfolio built using HTML, CSS, and vanilla JavaScript. It highlights Daliso’s work across immersive tech, digital commerce, media, and software systems.

---

## Live Site

https://daliso.com

---

## Features

- Hero section with theme toggle (light/dark mode)
- Sticky navbar with hamburger menu on mobile (accessible: focus trap, Escape key, aria-expanded)
- Smooth section scroll and scroll-triggered animations (respects prefers-reduced-motion)
- Skip-to-content link for keyboard/screen reader users
- Profile intro and clear CTAs for projects, podcast, and email
- Work section highlighting African Technopreneurs, 180by2, and software/product systems
- Embedded podcast CTA
- Contact section with a shared inbox and social links (inline SVG icons)
- Mobile-friendly and accessible
- Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy)
- SEO: robots.txt, sitemap.xml, structured data, theme-color meta
- Agent-readiness surfaces: `llms.txt`, `llms-full.txt`, feed output, per-post plaintext/Markdown, API discovery, agent skills, MCP metadata, and read-only WebMCP homepage tools
- Explicit AI content policy via `Content-Signal` in `robots.txt`

---

## Folder Structure

- `assets/fonts/` → Self-hosted web fonts (woff2)
- `assets/icons/` → SVG icons for social media
- `assets/images/` → Hero and media images (favicon, OG, logos)
- `blog/posts/` → Published Markdown source posts for the generated blog
- `blog/drafts/` → Draft Markdown posts created by the blog scaffold command
- `css/fonts.css` → Local @font-face declarations
- `css/style.css` → Generated shared CSS bundle served by the public site
- `css/pages/blog.css` → Blog index and article styles
- `css/base.css` → CSS variables, typography, global base styles (source)
- `css/layout.css` → Layout primitives (container, hero, footer) (source)
- `css/components.css` → Reusable UI components (buttons, cards, forms) (source)
- `css/animations.css` → Scroll-triggered animations with reduced-motion support (source)
- `css/pages/` → Page-specific styles (`404.css`, `projects.css`)
- `scripts/build-css.mjs` → Rebuilds `css/style.css` from the shared source stylesheets
- `api/projects.json` → Generated structured project ledger for machine readers
- `.well-known/` → API catalog, AI plugin, agent-skill, MCP, OAuth protected-resource, HTTP message-signature, and security discovery files
- `data/projects-manifest.json` → Checked-in curation manifest for the public projects page
- `scripts/blog-generator.mjs` → Generates `/blog/`, `/blog/{slug}/`, and draft post scaffolds
- `scripts/build-api.mjs` → Generates `/api/projects.json` from the curated project manifest
- `scripts/build-agent-skills.mjs` → Regenerates `/.well-known/agent-skills/index.json`
- `scripts/build-markdown-pages.mjs` → Generates Markdown copies of public pages for agents and text-first readers
- `js/main.js` → Single entry point
- `js/modules/` → Modular UI behaviors (nav, theme, scroll, carousel)
- `js/webmcp.js` → Read-only WebMCP tools exposed to browser agents that support `navigator.modelContext`
- `js/projects-page.js` → Projects page renderer (fetches synced portfolio data from JSON)
- `js/projects-data.json` → Generated project catalog data for `/projects/`
- `scripts/sync-projects.mjs` → Syncs the curated projects page from the live Developer folder
- `projects/index.html` → Dynamic projects catalog page
- `index.html` → Main HTML structure
- `404.html` → Not found page
- `manifest.webmanifest` → PWA support
- `robots.txt` → Search engine crawl rules
- `sitemap.xml` → Sitemap for search engines
- `_headers` → Netlify/Cloudflare cache and security headers

---

## Development

Install dependencies, refresh the generated projects data, and run tests:

```bash
git clone https://github.com/djngoma/daliso-website.git
cd daliso-website
npm install
npm run build:blog
npm run build:css
npm run build:assets
npm run sync:projects
npm test
```

For a production-equivalent local artifact, including the generated agent-readiness files, run:

```bash
npm run build:site
```

For the local site plus the write-capable blog studio:

```bash
npm run dev
```

Then open:

- `http://127.0.0.1:8080/` for the public site
- `http://127.0.0.1:8080/blog-studio/` for local draft editing, preview, and publish actions

If you edit the shared CSS source files and want to rebuild the served bundle without starting the dev server, run:

```bash
npm run build:css
```

If you edit the homepage hero or logo source assets and want to rebuild the optimized WebP versions, run:

```bash
npm run build:assets
```

## CI/CD

GitHub Actions now owns both validation and production deployment for this repository.

- Pull requests to `main` run CI only.
- Pushes to `main` run CI first, and only deploy to Cloudflare Pages if CI passes.
- Production deploys use Cloudflare Pages Direct Upload via GitHub Actions rather than automatic Git-based production deploys.
- The repository pins Node `24.14.1` in `.node-version`.
- Because GitHub Actions uploads the prebuilt `dist/` directory directly, the Pages build image is bypassed in the normal production path. Pages v3 only matters if Git integration is re-enabled later.
- `npm run sync:projects` is intentionally not part of CI because it depends on the surrounding local Developer workspace.

Required GitHub repository configuration:

- Secret: `CLOUDFLARE_ACCOUNT_ID`
- Secret: `CLOUDFLARE_API_TOKEN`
- Repository variable: `CLOUDFLARE_PAGES_PROJECT_NAME`

Required Cloudflare Pages dashboard change:

- Disable the existing Git-based production deployment path for this project, or disconnect Git integration entirely, so only the GitHub Actions deploy job publishes to production.

Deploy workflow summary:

- `npm ci`
- `npm test`
- `npm run build:site`
- `wrangler pages deploy dist --project-name=$CLOUDFLARE_PAGES_PROJECT_NAME --branch=main`

## Cache Rules

The repo relies on query-string versioning for shared entrypoints such as `js/main.js`, `js/projects-page.js`, `css/style.css`, and the page-specific stylesheets linked from the static HTML files.

- Shared HTML, CSS, and JS entrypoints must stay revalidating: `Cache-Control: public, max-age=0, must-revalidate, no-transform`.
- Do not mark `/js/*` or `/css/*` immutable unless the filenames themselves become content-hashed.
- The Safari/WebKit failure on 10 April 2026 came from stale immutable JS: the homepage HTML was fresh, but the browser kept executing an older `main.js` module body that still imported `nav-menu.js?v=20260403-perf`, which rewrote `About` and `Work` back to home-page anchors.
- `_headers` is the source of truth for cache policy, and `tests/performance-guardrails.spec.mjs` protects this rule in CI.

## Blog Workflow

The blog is generated from Markdown source files committed to this repo.

Published posts can use either `YYYY-MM-DD` or a full ISO timestamp such as `YYYY-MM-DDTHH:MM:SS+02:00`. The scaffold command now uses the local Johannesburg timestamp by default.

Build the publishable blog pages and refresh the sitemap:

```bash
npm run build:blog
```

Create a new draft post scaffold:

```bash
npm run new:post -- --title "My New Post"
```

Workflow:

1. Create a draft in `blog/drafts/`.
2. Use `npm run dev` and open `/blog-studio/` to edit raw Markdown, preview the rendered article, and choose `Save Draft` or `Publish`.
3. Published posts are written into `blog/posts/`, and the generator rebuilds `/blog/`, the article route, and `sitemap.xml`.
4. Run `npm test` to verify the generator and browser output.

The studio is local-only. It is not included in the production publish surface, and draft Markdown files are never exposed through the public blog or sitemap.

## PageSpeed Notes

If the homepage posts a very high PageSpeed Insights or Lighthouse score, the reason is mostly architectural rather than tactical.

- The site is primarily static HTML, CSS, and vanilla JavaScript, so there is no hydration cost or framework runtime on the homepage.
- The homepage ships very little code: `index.html` is about 9.8 KB, `js/main.js` is 256 B before it conditionally loads anything else, and the shared CSS is now served as a single generated bundle.
- There are no analytics tags, ad scripts, chat widgets, or third-party embeds on the homepage.
- Critical assets are explicit: the hero image is preloaded, responsive, and dimensioned, and the primary fonts are self-hosted WOFF2 files with `font-display: swap`.
- Accessibility and SEO are mostly handled in the markup itself: skip link, semantic sections, ARIA labels, canonical URL, robots meta, sitemap, and structured data.
- The DOM is small and the interaction model is simple, which keeps main-thread work low.

Important caveat: PageSpeed Insights is page-specific and run-specific. A great score on the homepage is not a guarantee for every route or every future run.

On April 3, 2026, a fresh live Lighthouse run against `https://daliso.com/` from this environment came back as:

- Mobile performance: `94`
- Desktop performance: `100`

The main mobile misses were render-blocking CSS chaining, image delivery, and an injected Cloudflare email-decoder script on the live page. See [`audit/performance-guardrails.md`](/Users/daliso/Developer/daliso-website/audit/performance-guardrails.md) for the current fixes and the guardrails that should stop those regressions from sneaking back in.

## Agent-Readiness Notes

The April 2026 agent-readiness work moved the site from `23` to `92`, Level 5: Agent-Native, on [isitagentready.com](https://isitagentready.com). The public write-up is [`How We Got from 23 to 92 on Is Your Site Agent-Ready`](https://daliso.com/blog/how-we-got-from-23-to-92-on-is-your-site-agent-ready/).

That work added real machine-readable surfaces rather than placeholder metadata:

- `llms.txt`, `llms-full.txt`, Atom and JSON feeds, per-post `plaintext.txt`, and generated Markdown page copies
- `/api/projects.json` as a structured project ledger
- `/.well-known/api-catalog`, `/.well-known/openapi.yaml`, `/.well-known/ai-plugin.json`, and `/.well-known/http-message-signatures-directory`
- `/.well-known/agent-skills/index.json` plus four concrete `SKILL.md` entries for reading the site, reading the blog, listing projects, and contacting the author
- `/.well-known/mcp/server-card.json` and `/.well-known/oauth-protected-resource`
- Homepage discovery links, richer structured data, and read-only WebMCP tools in `js/webmcp.js`
- `_headers` `Link` discovery headers for the important machine-readable endpoints
- `robots.txt` AI crawler allow rules plus `Content-Signal: ai-train=yes, search=yes, ai-input=yes`

The remaining score gap is intentional: the site does not publish OIDC or OAuth authorization-server discovery metadata because it has no login, token issuer, protected API, accounts, or session state.

## Projects Sync Workflow

The `/projects/` page is curated from the live Developer workspace rather than hand-edited JSON.

1. Update `data/projects-manifest.json` to add, remove, reorder, or relabel public projects.
2. If a public project should resolve to a differently named top-level repo folder, set `folder` on that manifest entry.
3. Run `npm run sync:projects` to scan the immediate children of the Developer folder and regenerate `js/projects-data.json`.
4. Run `npm test` to verify the refreshed catalog.

By default the sync script scans the parent directory of this repo, which matches `/Users/daliso/Developer` in this workspace. Override it with `PROJECTS_WORKSPACE_ROOT=/custom/path npm run sync:projects` when needed.

The sync path is intentionally local-workspace aware:

- it reads the full top level of `~/Developer`
- it uses the manifest to decide what is public
- it supports `folder` overrides so stable public IDs do not require repo-folder renames
- it stays out of CI because CI does not have the whole surrounding workspace

---

## Contact

For collaborations, speaking, partnerships, or media:

- Email: [info@africantechno.com](mailto:info@africantechno.com)
- LinkedIn: [linkedin.com/in/djngoma](https://linkedin.com/in/djngoma)
- X (Twitter): [x.com/djngoma](https://x.com/djngoma)
- Instagram: [instagram.com/djngoma](https://instagram.com/djngoma)

---

License

MIT License — free to adapt for personal use.

---

This site is continuously evolving. Built with clarity, code, and good vibes.
