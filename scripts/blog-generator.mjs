import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(process.env.BLOG_SITE_ROOT ?? join(scriptDir, ".."));
const blogRoot = join(siteRoot, "blog");
const postsDir = join(blogRoot, "posts");
const draftsDir = join(blogRoot, "drafts");
const sitemapPath = join(siteRoot, "sitemap.xml");

const siteUrl = "https://daliso.com";
const siteTitle = "Daliso Ngoma";
const defaultAuthor = "Daliso Ngoma";
const ogImage = `${siteUrl}/assets/images/og-image.png`;
const assetVersion = "20260318";
const generatedMarkerFile = ".blog-generated";
const reservedBlogDirs = new Set(["posts", "drafts"]);
const siteTimeZone = "Africa/Johannesburg";
const markdown = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
});

main();

function main() {
  const [command, ...args] = process.argv.slice(2);

  try {
    if (command === "build") {
      buildBlog();
      return;
    }

    if (command === "new") {
      scaffoldDraft(args);
      return;
    }

    throw new Error(
      'Unknown command. Use "build" or "new". Example: npm run new:post -- --title "Post Title"'
    );
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

function buildBlog() {
  ensureDir(blogRoot);
  ensureDir(postsDir);
  ensureDir(draftsDir);

  const posts = loadPublishedPosts();
  cleanupGeneratedRoutes(new Set(posts.map((post) => post.slug)));

  writeFileSync(join(blogRoot, "index.html"), renderBlogIndex(posts), "utf8");

  for (const post of posts) {
    const routeDir = join(blogRoot, post.slug);
    ensureDir(routeDir);
    writeFileSync(join(routeDir, "index.html"), renderPostPage(post), "utf8");
    writeFileSync(join(routeDir, generatedMarkerFile), `${post.slug}\n`, "utf8");
  }

  writeFileSync(sitemapPath, renderSitemap(posts), "utf8");

  console.log(`Built blog with ${posts.length} published post${posts.length === 1 ? "" : "s"}.`);
  console.log(`Index: ${join(blogRoot, "index.html")}`);
  if (posts.length > 0) {
    console.log(`Latest article: ${join(blogRoot, posts[0].slug, "index.html")}`);
  }
  console.log(`Sitemap: ${sitemapPath}`);
}

function scaffoldDraft(args) {
  const { title } = parseCommandArgs(args);
  if (!title) {
    throw new Error('Missing --title. Example: npm run new:post -- --title "Post Title"');
  }

  const slug = slugify(title);
  if (!slug) {
    throw new Error("Could not derive a valid slug from the provided title.");
  }

  if (reservedBlogDirs.has(slug)) {
    throw new Error(`The slug "${slug}" is reserved and cannot be used for a post.`);
  }

  ensureDir(draftsDir);
  ensureDir(postsDir);

  const draftPath = join(draftsDir, `${slug}.md`);
  const publishedPath = join(postsDir, `${slug}.md`);

  if (existsSync(draftPath) || existsSync(publishedPath)) {
    throw new Error(`A draft or published post already exists for slug "${slug}".`);
  }

  const today = getCurrentDateTimeStamp();
  const draftContent = `---
title: ${jsonString(title)}
slug: ${jsonString(slug)}
description: "Add a short summary for the blog index and social sharing."
author: ${jsonString(defaultAuthor)}
date: ${jsonString(today)}
tags: []
---

# ${title}

Write the opening paragraph here.

## Key Idea

Add the main argument.

## Takeaways

- Add supporting point one
- Add supporting point two
- Add supporting point three
`;

  writeFileSync(draftPath, draftContent, "utf8");
  console.log(`Created draft: ${draftPath}`);
}

function loadPublishedPosts() {
  const entries = existsSync(postsDir)
    ? readdirSync(postsDir, { withFileTypes: true }).filter(
        (entry) => entry.isFile() && extname(entry.name).toLowerCase() === ".md"
      )
    : [];

  const posts = entries.map((entry) => parsePost(join(postsDir, entry.name), entry.name));
  const seenSlugs = new Set();

  for (const post of posts) {
    if (reservedBlogDirs.has(post.slug)) {
      throw new Error(`Post slug "${post.slug}" is reserved and cannot be used.`);
    }

    if (seenSlugs.has(post.slug)) {
      throw new Error(`Duplicate post slug detected: "${post.slug}".`);
    }

    seenSlugs.add(post.slug);
  }

  return posts.sort((left, right) => {
    if (left.dateValue !== right.dateValue) {
      return right.dateValue - left.dateValue;
    }

    return left.title.localeCompare(right.title);
  });
}

function parsePost(filePath, fileName) {
  const source = readFileSync(filePath, "utf8");
  const { data, content } = matter(source);
  const title = getRequiredString(data.title, fileName, "title");
  const description = getRequiredString(data.description, fileName, "description");
  const slug = slugify(String(data.slug ?? basename(fileName, extname(fileName))).trim());

  if (!slug) {
    throw new Error(`Could not derive a valid slug for "${fileName}".`);
  }

  const { dateStamp, dateValue, hasTime } = parseDateField(data.date, fileName);
  const author = getOptionalString(data.author, defaultAuthor);
  const tags = normalizeTags(data.tags);
  const bodyMarkdown = stripLeadingTitleHeading(content, title);
  const bodyHtml = markdown.render(bodyMarkdown);
  const readingTime = formatReadingTime(countWords(bodyMarkdown));
  const canonicalPath = `/blog/${slug}/`;

  return {
    title,
    description,
    slug,
    dateStamp,
    dateValue,
    dateDisplay: formatDisplayDate(dateStamp, hasTime),
    author,
    tags,
    bodyHtml,
    readingTime,
    canonicalPath,
    url: `${siteUrl}${canonicalPath}`,
  };
}

function cleanupGeneratedRoutes(currentSlugs) {
  if (!existsSync(blogRoot)) {
    return;
  }

  const entries = readdirSync(blogRoot, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    if (reservedBlogDirs.has(entry.name) || currentSlugs.has(entry.name)) {
      continue;
    }

    const markerPath = join(blogRoot, entry.name, generatedMarkerFile);
    if (existsSync(markerPath)) {
      rmSync(join(blogRoot, entry.name), { recursive: true, force: true });
    }
  }
}

function renderBlogIndex(posts) {
  const featuredPost = posts[0] ?? null;
  const remainingPosts = posts.slice(1);
  const latestDate = featuredPost?.dateStamp ?? getCurrentDateTimeStamp();

  const hero = `
        <div class="blog-page-hero animate-on-scroll">
          <p class="blog-eyebrow">Daliso Ngoma Blog</p>
          <h1>Notes from building African Technopreneurs</h1>
          <h2>Writing about judgment, systems, and practical technology where speed matters and bad assumptions compound.</h2>
        </div>
  `;

  const content = featuredPost
    ? `
    <section class="section blog-section animate-on-scroll">
      <div class="container">
        <div class="blog-section-header">
          <p class="blog-section-label">Featured</p>
          <h2>Latest article</h2>
        </div>
        ${renderFeaturedCard(featuredPost)}
      </div>
    </section>
    <section class="section blog-section animate-on-scroll">
      <div class="container">
        <div class="blog-section-header">
          <p class="blog-section-label">Archive</p>
          <h2>Recent posts</h2>
        </div>
        ${
          remainingPosts.length > 0
            ? `<div class="blog-post-grid">${remainingPosts.map(renderPostCard).join("")}</div>`
            : `<div class="blog-empty-state"><p>More essays are on the way. For now, start with the featured article.</p></div>`
        }
      </div>
    </section>
  `
    : `
    <section class="section blog-section animate-on-scroll">
      <div class="container">
        <div class="blog-empty-state">
          <h2>Posts are on the way</h2>
          <p>The blog is configured and ready. Publish the first Markdown post to generate the index and article pages.</p>
        </div>
      </div>
    </section>
  `;

  return renderDocument({
    pageTitle: `Blog | ${siteTitle}`,
    description:
      "Thoughts on immersive tech, product building, AI, and the African tech ecosystem.",
    canonicalPath: "/blog/",
    heroContent: hero,
    mainContent: content,
    lastModified: latestDate,
  });
}

function renderPostPage(post) {
  const articleTagMeta = post.tags
    .map((tag) => `  <meta property="article:tag" content="${escapeHtml(tag)}" />`)
    .join("\n");
  const jsonLd = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: post.title,
      description: post.description,
      datePublished: post.dateStamp,
      dateModified: post.dateStamp,
      author: {
        "@type": "Person",
        name: post.author,
      },
      image: ogImage,
      mainEntityOfPage: {
        "@type": "WebPage",
        "@id": post.url,
      },
      publisher: {
        "@type": "Person",
        name: siteTitle,
      },
      keywords: post.tags,
      url: post.url,
    },
    null,
    2
  );

  const hero = `
        <div class="blog-article-hero animate-on-scroll">
          <a class="blog-back-link" href="/blog/">Back to blog</a>
          <p class="blog-eyebrow">Essay</p>
          <h1>${escapeHtml(post.title)}</h1>
          <p class="blog-article-dek">${escapeHtml(post.description)}</p>
          <div class="blog-meta-list" aria-label="Article metadata">
            <span>By ${escapeHtml(post.author)}</span>
            <span><time datetime="${escapeHtml(post.dateStamp)}">${escapeHtml(post.dateDisplay)}</time></span>
            <span>${escapeHtml(post.readingTime)}</span>
          </div>
          ${renderTagList(post.tags)}
        </div>
  `;

  const mainContent = `
    <section class="section blog-article-section">
      <div class="container">
        <article class="blog-article animate-on-scroll">
          <div class="blog-prose">
            ${post.bodyHtml}
          </div>
          <div class="blog-article-cta">
            <a class="btn btn-outline" href="/blog/">Back to all posts</a>
          </div>
        </article>
      </div>
    </section>
  `;

  return renderDocument({
    pageTitle: `${post.title} | Blog | ${siteTitle}`,
    description: post.description,
    canonicalPath: post.canonicalPath,
    ogType: "article",
    heroContent: hero,
    mainContent,
    extraHead: `
  <meta property="article:published_time" content="${escapeHtml(post.dateStamp)}" />
  <meta property="article:author" content="${escapeHtml(post.author)}" />
${articleTagMeta}
`,
    jsonLd,
    lastModified: post.dateStamp,
  });
}

function renderDocument({
  pageTitle,
  description,
  canonicalPath,
  heroContent,
  mainContent,
  ogType = "website",
  extraHead = "",
  jsonLd = "",
  lastModified,
}) {
  const canonicalUrl = `${siteUrl}${canonicalPath}`;
  const ldJsonScript = jsonLd
    ? `
  <script type="application/ld+json">
${jsonLd}
  </script>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${escapeHtml(description)}" />
  <meta name="author" content="${escapeHtml(defaultAuthor)}" />
  <meta name="robots" content="index, follow" />
  <meta name="base-path" content="/" />
  <meta name="theme-color" content="#0077ff" />
  ${lastModified ? `<meta name="last-modified" content="${escapeHtml(lastModified)}" />` : ""}
  <title>${escapeHtml(pageTitle)}</title>
  <link rel="icon" href="/assets/images/favicon.ico" type="image/x-icon" />
  <link rel="manifest" href="/manifest.webmanifest" />
  <link rel="preload" href="/assets/fonts/inter-400.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" href="/assets/fonts/space-grotesk-700.woff2" as="font" type="font/woff2" crossorigin />
  <link rel="preload" as="style" href="/css/style.css?v=${assetVersion}" />
  <link rel="stylesheet" href="/css/style.css?v=${assetVersion}" />
  <link rel="stylesheet" href="/css/pages/blog.css?v=${assetVersion}" />
  <meta property="og:title" content="${escapeHtml(pageTitle)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(ogImage)}" />
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}" />
  <meta property="og:type" content="${escapeHtml(ogType)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(pageTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(ogImage)}" />
  <link rel="canonical" href="${escapeHtml(canonicalUrl)}" />${extraHead}
  <script type="module" src="/js/main.js?v=${assetVersion}"></script>${ldJsonScript}
</head>
<body>
  <a href="#main-content" class="skip-link">Skip to main content</a>
  <header class="hero">
    <div class="container">
      ${renderNav()}
      ${heroContent}
    </div>
  </header>

  <main id="main-content">
    ${mainContent}
  </main>

  ${renderFooter()}
</body>
</html>
`;
}

function renderNav() {
  return `
      <nav class="navbar">
        <div class="logo">
          <a href="/"><img id="site-logo" src="/assets/images/logo-160.png" alt="Daliso Logo" width="40" height="40" decoding="async" /></a>
        </div>
        <button class="hamburger" id="hamburger" aria-label="Toggle menu">
          <span class="bar"></span>
          <span class="bar"></span>
          <span class="bar"></span>
        </button>
        <ul class="nav-menu" id="nav-menu">
          <li><a href="/">Home</a></li>
          <li><a href="/#about">About</a></li>
          <li><a href="/#work">Work</a></li>
          <li><a href="/#podcast">Podcast</a></li>
          <li><a href="/projects/">Projects</a></li>
          <li><a href="/blog/">Blog</a></li>
        </ul>
        <button id="theme-toggle" aria-label="Toggle dark mode">🌓</button>
      </nav>
  `;
}

function renderFooter() {
  return `
  <footer>
    <div class="container">
      <h2>Get in Touch</h2>
      <ul class="social-links">
        <li><a href="mailto:info@africantechno.com" aria-label="Email"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 4h20v16H2V4zm2 2v.01L12 13l8-6.99V6H4zm0 2.83V18h16V8.83l-8 7-8-7z"/></svg></a></li>
        <li><a href="https://linkedin.com/in/djngoma" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.24 8.98h4.51V24H.24zM8.6 8.98h4.31v2.05h.06c.6-1.14 2.06-2.35 4.24-2.35 4.54 0 5.38 2.99 5.38 6.87V24h-4.51v-7.56c0-1.8-.03-4.12-2.51-4.12-2.51 0-2.9 1.96-2.9 3.98V24H8.6z"/></svg></a></li>
        <li><a href="https://x.com/djngoma" target="_blank" rel="noopener noreferrer" aria-label="X"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20.146 2H16.36l-4.28 5.62-3.66-5.62H2.22l6.73 9.63L2 22h3.787l4.356-5.72L14 22h5.908l-7.08-10.21z"/></svg></a></li>
        <li><a href="https://instagram.com/djngoma" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.2c3.2 0 3.584.012 4.85.07 1.17.056 1.97.24 2.43.402a4.92 4.92 0 011.77 1.025c.47.47.843 1.1 1.025 1.77.162.46.346 1.26.402 2.43.058 1.267.07 1.65.07 4.85s-.012 3.584-.07 4.85c-.056 1.17-.24 1.97-.402 2.43a4.92 4.92 0 01-1.025 1.77 4.92 4.92 0 01-1.77 1.025c-.46.162-1.26.346-2.43.402-1.267.058-1.65.07-4.85.07s-3.584-.012-4.85-.07c-1.17-.056-1.97-.24-2.43-.402a4.92 4.92 0 01-1.77-1.025A4.92 4.92 0 012.2 19.65c-.162-.46-.346-1.26-.402-2.43C1.74 15.954 1.728 15.57 1.728 12.37s.012-3.584.07-4.85c.056-1.17.24-1.97.402-2.43a4.92 4.92 0 011.025-1.77A4.92 4.92 0 015.32 2.672c.46-.162 1.26-.346 2.43-.402C8.416 2.212 8.8 2.2 12 2.2zM12 6.838a5.162 5.162 0 100 10.324 5.162 5.162 0 000-10.324zm0 8.324a3.162 3.162 0 110-6.324 3.162 3.162 0 010 6.324zm6.406-8.826a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"/></svg></a></li>
      </ul>
      <p class="footer-copy">© 2026 Daliso Ngoma. <a href="https://github.com/DJNgoma/daliso-website" target="_blank" rel="noopener noreferrer">Source</a></p>
    </div>
  </footer>
  `;
}

function renderFeaturedCard(post) {
  return `
        <article class="blog-card blog-featured-card">
          <p class="blog-card-kicker">Featured essay</p>
          <h3><a href="${escapeHtml(post.canonicalPath)}">${escapeHtml(post.title)}</a></h3>
          <p class="blog-card-description">${escapeHtml(post.description)}</p>
          <div class="blog-meta-list" aria-label="Featured article metadata">
            <span><time datetime="${escapeHtml(post.dateStamp)}">${escapeHtml(post.dateDisplay)}</time></span>
            <span>${escapeHtml(post.readingTime)}</span>
          </div>
          ${renderTagList(post.tags)}
          <a class="btn" href="${escapeHtml(post.canonicalPath)}">Read article</a>
        </article>
  `;
}

function renderPostCard(post) {
  return `
          <article class="blog-card blog-post-card">
            <p class="blog-card-kicker">Post</p>
            <h3><a href="${escapeHtml(post.canonicalPath)}">${escapeHtml(post.title)}</a></h3>
            <p class="blog-card-description">${escapeHtml(post.description)}</p>
            <div class="blog-meta-list" aria-label="Post metadata">
              <span><time datetime="${escapeHtml(post.dateStamp)}">${escapeHtml(post.dateDisplay)}</time></span>
              <span>${escapeHtml(post.readingTime)}</span>
            </div>
            ${renderTagList(post.tags)}
            <a class="blog-inline-link" href="${escapeHtml(post.canonicalPath)}">Read article</a>
          </article>
  `;
}

function renderTagList(tags) {
  if (!tags.length) {
    return "";
  }

  return `
          <ul class="blog-tag-list" aria-label="Tags">
            ${tags.map((tag) => `<li class="blog-tag">${escapeHtml(tag)}</li>`).join("")}
          </ul>
  `;
}

function renderSitemap(posts) {
  const latestDate = posts[0]?.dateStamp ?? getCurrentDateTimeStamp();
  const entries = [
    {
      loc: `${siteUrl}/`,
      changefreq: "monthly",
      priority: "1.0",
    },
    {
      loc: `${siteUrl}/projects/`,
      changefreq: "weekly",
      priority: "0.8",
    },
    {
      loc: `${siteUrl}/blog/`,
      changefreq: "weekly",
      priority: "0.7",
      lastmod: latestDate,
    },
    ...posts.map((post) => ({
      loc: post.url,
      changefreq: "monthly",
      priority: "0.6",
      lastmod: post.dateStamp,
    })),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (entry) => `  <url>
    <loc>${escapeXml(entry.loc)}</loc>
    ${entry.lastmod ? `<lastmod>${escapeXml(entry.lastmod)}</lastmod>\n    ` : ""}<changefreq>${escapeXml(entry.changefreq)}</changefreq>
    <priority>${escapeXml(entry.priority)}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;
}

function parseCommandArgs(args) {
  const parsed = {};

  for (let index = 0; index < args.length; index += 1) {
    const current = args[index];
    if (current === "--title") {
      parsed.title = args[index + 1];
      index += 1;
    }
  }

  return parsed;
}

function getRequiredString(value, fileName, fieldName) {
  const normalized = String(value ?? "").trim();
  if (!normalized) {
    throw new Error(`Missing required "${fieldName}" in "${fileName}".`);
  }

  return normalized;
}

function getOptionalString(value, fallback) {
  const normalized = String(value ?? "").trim();
  return normalized || fallback;
}

function parseDateField(value, fileName) {
  const dateStamp = String(value ?? "").trim();
  if (!dateStamp) {
    throw new Error(`Missing required "date" in "${fileName}".`);
  }

  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStamp)) {
    const [year, month, day] = dateStamp.split("-").map(Number);
    assertValidCalendarDate(year, month, day, fileName);
    return {
      dateStamp,
      dateValue: Date.UTC(year, month - 1, day),
      hasTime: false,
    };
  }

  const match = dateStamp.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(Z|([+-])(\d{2}):(\d{2}))$/
  );

  if (!match) {
    throw new Error(
      `Invalid date in "${fileName}". Expected YYYY-MM-DD or YYYY-MM-DDTHH:MM:SSZ/±HH:MM.`
    );
  }

  const [, yearText, monthText, dayText, hourText, minuteText, secondText, zone, sign, zoneHourText, zoneMinuteText] =
    match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const hour = Number(hourText);
  const minute = Number(minuteText);
  const second = Number(secondText);

  assertValidCalendarDate(year, month, day, fileName);

  if (hour > 23 || minute > 59 || second > 59) {
    throw new Error(`Invalid date in "${fileName}". Expected a real clock time.`);
  }

  const offsetMinutes =
    zone === "Z"
      ? 0
      : (sign === "+" ? 1 : -1) * (Number(zoneHourText) * 60 + Number(zoneMinuteText));

  if (Math.abs(offsetMinutes) > 23 * 60 + 59) {
    throw new Error(`Invalid date in "${fileName}". Expected a valid UTC offset.`);
  }

  const dateValue = Date.UTC(year, month - 1, day, hour, minute, second) - offsetMinutes * 60_000;

  if (!Number.isFinite(dateValue)) {
    throw new Error(`Invalid date in "${fileName}". Expected a real calendar date.`);
  }

  return { dateStamp, dateValue, hasTime: true };
}

function assertValidCalendarDate(year, month, day, fileName) {
  const dateValue = Date.UTC(year, month - 1, day);
  const date = new Date(dateValue);

  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    throw new Error(`Invalid date in "${fileName}". Expected a real calendar date.`);
  }
}

function normalizeTags(value) {
  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag).trim())
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}

function stripLeadingTitleHeading(content, title) {
  const lines = content.split(/\r?\n/);
  let index = 0;

  while (index < lines.length && lines[index].trim() === "") {
    index += 1;
  }

  const match = lines[index]?.match(/^#\s+(.+)$/);
  if (match && normalizeWhitespace(match[1]) === normalizeWhitespace(title)) {
    lines.splice(index, 1);
    if (lines[index]?.trim() === "") {
      lines.splice(index, 1);
    }
  }

  return lines.join("\n").trim();
}

function normalizeWhitespace(value) {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function countWords(content) {
  const matches = content.match(/[A-Za-z0-9\u00C0-\u024F]+/g);
  return matches ? matches.length : 0;
}

function formatReadingTime(wordCount) {
  return `${Math.max(1, Math.ceil(wordCount / 200))} min read`;
}

function formatDisplayDate(dateStamp, hasTime) {
  if (!hasTime) {
    return new Intl.DateTimeFormat("en-ZA", {
      dateStyle: "long",
      timeZone: "UTC",
    }).format(new Date(`${dateStamp}T00:00:00Z`));
  }

  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: siteTimeZone,
  }).format(new Date(dateStamp));
}

function getCurrentDateTimeStamp() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: siteTimeZone,
  });

  const parts = formatter.formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}T${values.hour}:${values.minute}:${values.second}+02:00`;
}

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true });
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeXml(value) {
  return escapeHtml(value);
}

function jsonString(value) {
  return JSON.stringify(String(value));
}
