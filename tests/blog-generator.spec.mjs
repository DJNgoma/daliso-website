import test from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const testsDir = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(testsDir, "..");
const generatorPath = join(repoRoot, "scripts", "blog-generator.mjs");

test("build generates the blog index, article route, and sitemap entries", (t) => {
  const fixtureRoot = createFixture(t);
  writePublishedPost(
    fixtureRoot,
    "ai-psychosis-and-synthetic-confidence.md",
    `---
title: "AI Psychosis: When Intelligence Becomes Too Convincing"
description: "Why highly persuasive AI can distort judgment and create synthetic certainty."
date: "2026-03-18T20:24:23+02:00"
tags:
  - AI
  - Risk
---

# AI Psychosis: When Intelligence Becomes Too Convincing

Artificial intelligence sounds more confident than it is.

## Final Thought

What if this is wrong?
`
  );

  writeDraftPost(
    fixtureRoot,
    "ignore-me.md",
    `---
title: "Draft"
date: "not-a-date"
---

# Draft
`
  );

  runCli(fixtureRoot, ["build"]);

  const indexHtmlPath = join(fixtureRoot, "blog", "index.html");
  const articleHtmlPath = join(
    fixtureRoot,
    "blog",
    "ai-psychosis-and-synthetic-confidence",
    "index.html"
  );
  const sitemapPath = join(fixtureRoot, "sitemap.xml");

  assert.equal(existsSync(indexHtmlPath), true);
  assert.equal(existsSync(articleHtmlPath), true);
  assert.equal(existsSync(sitemapPath), true);

  const indexHtml = readFileSync(indexHtmlPath, "utf8");
  const articleHtml = readFileSync(articleHtmlPath, "utf8");
  const sitemap = readFileSync(sitemapPath, "utf8");

  assert.match(indexHtml, /Latest article/);
  assert.match(indexHtml, /ai-psychosis-and-synthetic-confidence\//);
  assert.doesNotMatch(indexHtml, /Coming Soon/);
  assert.match(indexHtml, /apple-touch-icon\.png/);
  assert.match(articleHtml, /<meta property="og:type" content="article" \/>/);
  assert.match(articleHtml, /og:site_name" content="Daliso Ngoma"/);
  assert.match(articleHtml, /twitter:image:alt" content="Daliso Ngoma page preview card"/);
  assert.match(articleHtml, /article:published_time" content="2026-03-18T20:24:23\+02:00"/);
  assert.match(articleHtml, /18 March 2026 at 20:24/);
  assert.match(articleHtml, /What if this is wrong\?/);
  assert.doesNotMatch(articleHtml, /<h1>AI Psychosis: When Intelligence Becomes Too Convincing<\/h1>[\s\S]*<h1>/);
  assert.match(sitemap, /https:\/\/daliso\.com\/blog\/ai-psychosis-and-synthetic-confidence\//);
});

test("build generates per-post OG images when fonts are available", (t) => {
  const fixtureRoot = createFixture(t);
  copyFonts(fixtureRoot);
  writePublishedPost(
    fixtureRoot,
    "test-post.md",
    `---
title: "Test Post"
description: "A test post."
date: "2026-03-18"
tags:
  - Testing
---

Body text.
`
  );

  runCli(fixtureRoot, ["build"]);

  const ogImagePath = join(fixtureRoot, "blog", "test-post", "og-image.png");
  assert.equal(existsSync(ogImagePath), true, "OG image should be generated");

  const articleHtml = readFileSync(
    join(fixtureRoot, "blog", "test-post", "index.html"),
    "utf8"
  );
  assert.match(articleHtml, /og:image" content="https:\/\/daliso\.com\/blog\/test-post\/og-image\.png"/);

  const indexHtml = readFileSync(join(fixtureRoot, "blog", "index.html"), "utf8");
  assert.match(indexHtml, /og:image" content="https:\/\/daliso\.com\/assets\/images\/og-image\.png"/);
});

test("build falls back to default OG image when fonts are missing", (t) => {
  const fixtureRoot = createFixture(t);
  writePublishedPost(
    fixtureRoot,
    "no-fonts-post.md",
    `---
title: "No Fonts Post"
description: "Should still build."
date: "2026-03-18"
---

Body text.
`
  );

  runCli(fixtureRoot, ["build"]);

  const ogImagePath = join(fixtureRoot, "blog", "no-fonts-post", "og-image.png");
  assert.equal(existsSync(ogImagePath), false, "No OG image without fonts");

  const articleHtml = readFileSync(
    join(fixtureRoot, "blog", "no-fonts-post", "index.html"),
    "utf8"
  );
  assert.match(articleHtml, /og:image" content="https:\/\/daliso\.com\/assets\/images\/og-image\.png"/);
});

test("build fails when two published posts resolve to the same slug", (t) => {
  const fixtureRoot = createFixture(t);
  writePublishedPost(
    fixtureRoot,
    "first-post.md",
    `---
title: "First Post"
description: "One"
date: "2026-03-18"
slug: "same-post"
---

First body.
`
  );
  writePublishedPost(
    fixtureRoot,
    "second-post.md",
    `---
title: "Second Post"
description: "Two"
date: "2026-03-19"
slug: "same-post"
---

Second body.
`
  );

  const error = runCli(fixtureRoot, ["build"], { expectFailure: true });
  assert.match(getCliOutput(error), /Duplicate post slug detected/);
});

test("build fails on invalid published frontmatter", (t) => {
  const fixtureRoot = createFixture(t);
  writePublishedPost(
    fixtureRoot,
    "broken-post.md",
    `---
title: "Broken Post"
description: "This should fail."
date: "2026-02-31"
---

Broken body.
`
  );

  const error = runCli(fixtureRoot, ["build"], { expectFailure: true });
  assert.match(getCliOutput(error), /Expected a real calendar date/);
});

test("new command creates a draft and refuses collisions", (t) => {
  const fixtureRoot = createFixture(t);

  runCli(fixtureRoot, ["new", "--title", "Example Title"]);

  const draftPath = join(fixtureRoot, "blog", "drafts", "example-title.md");
  assert.equal(existsSync(draftPath), true);

  const draftContent = readFileSync(draftPath, "utf8");
  assert.match(draftContent, /title: "Example Title"/);
  assert.match(draftContent, /slug: "example-title"/);
  assert.match(draftContent, /date: "\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+02:00"/);

  const error = runCli(fixtureRoot, ["new", "--title", "Example Title"], {
    expectFailure: true,
  });
  assert.match(getCliOutput(error), /already exists/);
});

function createFixture(t) {
  const root = mkdtempSync(join(tmpdir(), "daliso-blog-generator-"));
  mkdirSync(join(root, "blog", "posts"), { recursive: true });
  mkdirSync(join(root, "blog", "drafts"), { recursive: true });
  t.after(() => {
    rmSync(root, { recursive: true, force: true });
  });
  return root;
}

function copyFonts(root) {
  const fontsDir = join(root, "assets", "fonts");
  const imagesDir = join(root, "assets", "images");
  mkdirSync(fontsDir, { recursive: true });
  mkdirSync(imagesDir, { recursive: true });
  const repoFontsDir = join(repoRoot, "assets", "fonts");
  for (const name of ["inter-400.ttf", "space-grotesk-700.ttf"]) {
    const src = join(repoFontsDir, name);
    if (existsSync(src)) {
      writeFileSync(join(fontsDir, name), readFileSync(src));
    }
  }
  const heroSrc = join(repoRoot, "assets", "images", "hero-640.jpg");
  if (existsSync(heroSrc)) {
    writeFileSync(join(imagesDir, "hero-640.jpg"), readFileSync(heroSrc));
  }
}

function writePublishedPost(root, fileName, contents) {
  writeFileSync(join(root, "blog", "posts", fileName), contents, "utf8");
}

function writeDraftPost(root, fileName, contents) {
  writeFileSync(join(root, "blog", "drafts", fileName), contents, "utf8");
}

function runCli(root, args, { expectFailure = false } = {}) {
  try {
    const output = execFileSync("node", [generatorPath, ...args], {
      cwd: repoRoot,
      env: {
        ...process.env,
        BLOG_SITE_ROOT: root,
      },
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });

    if (expectFailure) {
      assert.fail(`Expected command to fail: ${args.join(" ")}`);
    }

    return output;
  } catch (error) {
    if (!expectFailure) {
      throw error;
    }

    return error;
  }
}

function getCliOutput(error) {
  return `${error.stdout ?? ""}\n${error.stderr ?? ""}`;
}
