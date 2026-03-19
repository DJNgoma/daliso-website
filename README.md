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

---

## Folder Structure

- `assets/fonts/` → Self-hosted web fonts (woff2)
- `assets/icons/` → SVG icons for social media
- `assets/images/` → Hero and media images (favicon, OG, logos)
- `blog/posts/` → Published Markdown source posts for the generated blog
- `blog/drafts/` → Draft Markdown posts created by the blog scaffold command
- `css/fonts.css` → Local @font-face declarations
- `css/style.css` → Combined production stylesheet (used by the site)
- `css/pages/blog.css` → Blog index and article styles
- `css/base.css` → CSS variables, typography, global base styles (source)
- `css/layout.css` → Layout primitives (container, hero, footer) (source)
- `css/components.css` → Reusable UI components (buttons, cards, forms) (source)
- `css/animations.css` → Scroll-triggered animations with reduced-motion support (source)
- `css/pages/` → Page-specific styles (`404.css`, `projects.css`)
- `data/projects-manifest.json` → Checked-in curation manifest for the public projects page
- `scripts/blog-generator.mjs` → Generates `/blog/`, `/blog/{slug}/`, and draft post scaffolds
- `js/main.js` → Single entry point
- `js/modules/` → Modular UI behaviors (nav, theme, scroll, carousel)
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
npm run sync:projects
npm test
```

For a quick local preview outside Playwright:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

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
2. Move a finished draft into `blog/posts/`.
3. Run `npm run build:blog` to regenerate `/blog/`, the article route, and `sitemap.xml`.
4. Run `npm test` to verify the generator and browser output.

## PageSpeed Notes

If the homepage posts a very high PageSpeed Insights or Lighthouse score, the reason is mostly architectural rather than tactical.

- The site is primarily static HTML, CSS, and vanilla JavaScript, so there is no hydration cost or framework runtime on the homepage.
- The homepage ships very little code: `index.html` is about 9.8 KB, `css/style.css` is about 8.2 KB, and `js/main.js` is 256 B before it conditionally loads anything else.
- There are no analytics tags, ad scripts, chat widgets, or third-party embeds on the homepage.
- Critical assets are explicit: the hero image is preloaded, responsive, and dimensioned, and the primary fonts are self-hosted WOFF2 files with `font-display: swap`.
- Accessibility and SEO are mostly handled in the markup itself: skip link, semantic sections, ARIA labels, canonical URL, robots meta, sitemap, and structured data.
- The DOM is small and the interaction model is simple, which keeps main-thread work low.

Important caveat: PageSpeed Insights is page-specific and run-specific. A great score on the homepage is not a guarantee for every route or every future run.

On March 18, 2026, a local Lighthouse run against `https://daliso.com/` from this environment did not reproduce a permanent `100/100/100/100` result. It came back as:

- Mobile: `88 / 95 / 100 / 100`
- Desktop: `68 / 95 / 100 / 100`

The main misses in that run were image format and sizing opportunities, relatively short cache TTLs on some static assets, and a contrast issue affecting accessibility. So the accurate statement is: the site is structured to score very well, but the score is not a fixed property of the repo.

## Projects Sync Workflow

The `/projects/` page is curated from the live Developer workspace rather than hand-edited JSON.

1. Update `data/projects-manifest.json` to add, remove, reorder, or relabel public projects.
2. Run `npm run sync:projects` to scan the immediate children of the Developer folder and regenerate `js/projects-data.json`.
3. Run `npm test` to verify the refreshed catalog.

By default the sync script scans the parent directory of this repo, which matches `/Users/daliso/Developer` in this workspace. Override it with `PROJECTS_WORKSPACE_ROOT=/custom/path npm run sync:projects` when needed.

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
