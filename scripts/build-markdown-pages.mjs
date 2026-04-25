import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, "..");

const pages = [
  { file: "index.html", md: "index.md", title: "Daliso Ngoma" },
  { file: "about/index.html", md: "about/index.md", title: "About | Daliso Ngoma" },
  { file: "work/index.html", md: "work/index.md", title: "Work | Daliso Ngoma" },
  {
    file: "projects/index.html",
    md: "projects/index.md",
    title: "Projects | Daliso Ngoma",
  },
  { file: "media/index.html", md: "media/index.md", title: "Media | Daliso Ngoma" },
  {
    file: "media/coding-with-ai/index.html",
    md: "media/coding-with-ai/index.md",
    title: "Coding with AI | Talks | Daliso Ngoma",
  },
  { file: "blog/index.html", md: "blog/index.md", title: "Blog | Daliso Ngoma" },
  {
    file: "privacy/index.html",
    md: "privacy/index.md",
    title: "Privacy | Daliso Ngoma",
  },
  {
    file: "support/index.html",
    md: "support/index.md",
    title: "Support | Daliso Ngoma",
  },
];

for (const page of pages) {
  const htmlPath = join(siteRoot, page.file);
  if (!existsSync(htmlPath)) continue;
  const html = readFileSync(htmlPath, "utf8");
  const md = htmlToMarkdown(html, page.title);
  const mdPath = join(siteRoot, page.md);
  writeFileSync(mdPath, md, "utf8");
  console.log(`Wrote ${mdPath}`);
}

// Blog posts already have plaintext.txt — generate .md copies that preserve links.
const blogDir = join(siteRoot, "blog");
for (const entry of readdirSync(blogDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  if (["drafts", "posts"].includes(entry.name)) continue;
  const postDir = join(blogDir, entry.name);
  const sourcePath = join(siteRoot, "blog", "posts", `${entry.name}.md`);
  const targetPath = join(postDir, "index.md");
  if (existsSync(sourcePath)) {
    const markdownSource = readFileSync(sourcePath, "utf8");
    const stripped = stripFrontMatter(markdownSource);
    writeFileSync(targetPath, stripped, "utf8");
    console.log(`Wrote ${targetPath}`);
  }
}

function htmlToMarkdown(html, fallbackTitle) {
  const mainMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const body = mainMatch ? mainMatch[1] : html;
  const titleMatch =
    html.match(/<title>([^<]*)<\/title>/i) ||
    html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = titleMatch ? stripTags(titleMatch[1]).trim() : fallbackTitle;
  const descriptionMatch = html.match(
    /<meta\s+name="description"\s+content="([^"]*)"/i
  );
  const description = descriptionMatch ? descriptionMatch[1] : "";
  const canonicalMatch = html.match(
    /<link\s+rel="canonical"\s+href="([^"]*)"/i
  );
  const canonical = canonicalMatch ? canonicalMatch[1] : "";

  const converted = convertHtmlFragment(body);

  const header = [
    `# ${title}`,
    "",
    description ? `> ${description}` : null,
    canonical ? `Canonical: ${canonical}` : null,
    "",
  ]
    .filter((value) => value !== null)
    .join("\n");

  return `${header}\n${converted.trim()}\n`;
}

function convertHtmlFragment(fragment) {
  let out = fragment;

  // Remove script, style, svg, and embedded media blocks.
  out = out.replace(/<(script|style|svg|iframe|noscript)[^>]*>[\s\S]*?<\/\1>/gi, "");

  // Headings.
  out = out.replace(/<h([1-6])[^>]*>([\s\S]*?)<\/h\1>/gi, (_m, level, text) => {
    const prefix = "#".repeat(Number(level));
    return `\n\n${prefix} ${stripTags(text).trim()}\n\n`;
  });

  // Paragraphs and line breaks.
  out = out.replace(/<br\s*\/?>/gi, "\n");
  out = out.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, (_m, text) => {
    return `\n\n${inlineHtmlToMarkdown(text).trim()}\n\n`;
  });

  // Lists.
  out = out.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, (_m, text) => {
    return `- ${inlineHtmlToMarkdown(text).trim()}\n`;
  });
  out = out.replace(/<\/?(ul|ol)[^>]*>/gi, "\n");

  // Blockquotes.
  out = out.replace(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/gi, (_m, text) => {
    return inlineHtmlToMarkdown(text)
      .trim()
      .split(/\n+/)
      .map((line) => `> ${line}`)
      .join("\n");
  });

  // Code blocks.
  out = out.replace(
    /<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi,
    (_m, code) => `\n\n\`\`\`\n${decodeEntities(code)}\n\`\`\`\n\n`
  );

  // Hr.
  out = out.replace(/<hr\s*\/?>/gi, "\n\n---\n\n");

  // Remaining block-level wrappers: section, article, div, header, nav, aside, footer.
  out = out.replace(
    /<\/?(section|article|div|header|nav|aside|footer|main|figure|figcaption|picture|source|button)[^>]*>/gi,
    "\n"
  );

  out = inlineHtmlToMarkdown(out);

  // Collapse whitespace.
  out = out.replace(/\n{3,}/g, "\n\n");

  return decodeEntities(out);
}

function inlineHtmlToMarkdown(text) {
  let out = text;
  out = out.replace(
    /<a\s+[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi,
    (_m, href, label) => {
      const cleanLabel = stripTags(label).trim();
      return cleanLabel ? `[${cleanLabel}](${href})` : href;
    }
  );
  out = out.replace(/<(strong|b)[^>]*>([\s\S]*?)<\/\1>/gi, "**$2**");
  out = out.replace(/<(em|i)[^>]*>([\s\S]*?)<\/\1>/gi, "*$2*");
  out = out.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  out = out.replace(/<img\s+[^>]*alt="([^"]*)"[^>]*src="([^"]*)"[^>]*>/gi, "![$1]($2)");
  out = out.replace(/<img\s+[^>]*src="([^"]*)"[^>]*>/gi, "![]($1)");
  out = out.replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, "$1");
  out = out.replace(/<time[^>]*>([\s\S]*?)<\/time>/gi, "$1");
  out = out.replace(/<ul[^>]*>|<\/ul>|<ol[^>]*>|<\/ol>/gi, "");
  return out;
}

function stripTags(text) {
  return decodeEntities(String(text).replace(/<[^>]+>/g, ""));
}

function decodeEntities(text) {
  return String(text)
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, "—")
    .replace(/&ndash;/g, "–")
    .replace(/&nbsp;/g, " ")
    .replace(/&rarr;/g, "→")
    .replace(/&larr;/g, "←")
    .replace(/&rsquo;/g, "’")
    .replace(/&lsquo;/g, "‘");
}

function stripFrontMatter(source) {
  if (source.startsWith("---")) {
    const end = source.indexOf("\n---", 3);
    if (end !== -1) {
      return source.slice(end + 4).replace(/^\n+/, "");
    }
  }
  return source;
}
