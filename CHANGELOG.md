# Changelog

## 2026-04-10

### Caching
- Fixed a live Safari/WebKit regression where immutable shared JS could survive deploys and keep executing stale module bodies after the homepage HTML had updated
- Changed shared `/js/*` cache policy to revalidate instead of `immutable` unless the public filenames become content-hashed

### Navigation
- Fixed the live homepage nav so `About` and `Work` consistently resolve to `/about/` and `/work/` instead of falling back to home-page anchors in stale clients

### UI
- Restored the homepage portrait placement so it stays above the CTA block on mobile instead of dropping below it

### Tests
- Added regression coverage for standalone nav routes, mobile menu navigation, portrait placement on compact mobile viewports, and the shared JS cache-policy rule

### Documentation
- Documented the shared entrypoint cache policy and the April 10 Safari cache incident in `README.md` and `audit/performance-guardrails.md`

## 2026-03-18

### Documentation
- Added PageSpeed and Lighthouse notes to `README.md`, documenting why the homepage tends to score well and why scores still vary by run and environment

### Blog
- Published `Why This Site Tends to Score Well in PageSpeed Insights`

## 2026-03-14

### Accessibility
- Navbar: added `aria-expanded`, `aria-controls`, focus trapping, and Escape key to close
- Carousel: added `role="region"`, `aria-label`, keyboard navigation (arrow keys), and tabindex
- Added `prefers-reduced-motion` support in CSS and JS (animations disabled for users who request it)
- Added skip-to-content links on index and projects pages

### Security
- Added `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, and `Permissions-Policy` headers

### Performance
- Converted `projects-data.js` (585-line module) to fetched `projects-data.json` for better cacheability
- Removed unused CSS keyframes (`fadeIn`, `fadeUp`) and animation classes (`fade-left`, `fade-right`, `fade-up`, `fade-in`, `zoom-in`, `slide-up`)

### SEO
- Added `robots.txt` and `sitemap.xml`
- Added `meta theme-color` to `index.html` and `projects/index.html`

### Consistency
- Fixed 404 page: added favicon, manifest, font preloads, theme-color, and `data-theme` attribute
- Aligned CSS cache-bust versions across all pages (was `v=20260313` on projects, now consistent)

### UI
- Added inline SVG icons (LinkedIn, X, Instagram) to social links in the contact section
- Added `<noscript>` fallback on the projects page

### Resilience
- Wrapped `localStorage` calls in `toggle-theme.js` with try/catch for private browsing compatibility
- Fixed theme toggle logo paths to work correctly on both root and nested pages

### PWA
- Added `logo-160.png` and `og-image.png` as additional icon entries in `manifest.webmanifest`

### Branding (earlier commit)
- Updated role to Founder & Managing Director across all meta tags, OG cards, and structured data
- Refreshed tagline, descriptions, and about section copy
- Switched contact email to shared inbox (`info@africantechno.com`), removed phone number
- Removed Calendly "Book Me" section
- Reordered work cards: African Technopreneurs first, 180by2 second
- Updated README to reflect new branding and contact info
