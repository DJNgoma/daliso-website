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
- `css/fonts.css` → Local @font-face declarations
- `css/style.css` → Combined production stylesheet (used by the site)
- `css/base.css` → CSS variables, typography, global base styles (source)
- `css/layout.css` → Layout primitives (container, hero, footer) (source)
- `css/components.css` → Reusable UI components (buttons, cards, forms) (source)
- `css/animations.css` → Scroll-triggered animations with reduced-motion support (source)
- `css/pages/` → Page-specific styles (`404.css`, `projects.css`)
- `js/main.js` → Single entry point
- `js/modules/` → Modular UI behaviors (nav, theme, scroll, carousel)
- `js/projects-page.js` → Projects page renderer (fetches data from JSON)
- `js/projects-data.json` → Project catalog data
- `projects/index.html` → Dynamic projects catalog page
- `index.html` → Main HTML structure
- `404.html` → Not found page
- `manifest.webmanifest` → PWA support
- `robots.txt` → Search engine crawl rules
- `sitemap.xml` → Sitemap for search engines
- `_headers` → Netlify/Cloudflare cache and security headers

---

## Development

Clone the repo and open in any browser:

```bash
git clone https://github.com/djngoma/daliso-website.git
cd daliso-website
open index.html
```

---

## Contact

For collaborations, speaking, partnerships, or media:

- Email: info@africantechno.com
- LinkedIn: linkedin.com/in/djngoma
- X (Twitter): x.com/djngoma
- Instagram: instagram.com/djngoma

---

License

MIT License — free to adapt for personal use.

---

This site is continuously evolving. Built with clarity, code, and good vibes.
