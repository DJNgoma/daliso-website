import { createServer } from "node:http";
import { statSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, resolve, sep } from "node:path";
import { buildCssBundle } from "./build-css.mjs";
import {
  buildBlog,
  getDocument,
  listDocuments,
  publishDocument,
  renderPreview,
  resolveSiteRoot,
  saveDraft,
  scaffoldDraft,
} from "./blog-lib.mjs";

const host = "127.0.0.1";
const port = Number(process.env.PORT ?? "8080");
const siteRoot = resolveSiteRoot();
const allowedTopLevelEntries = new Set([
  "404.html",
  "about",
  "assets",
  "blog",
  "blog-studio",
  "css",
  "index.html",
  "js",
  "manifest.webmanifest",
  "media",
  "privacy",
  "projects",
  "support",
  "work",
  "robots.txt",
  "sitemap.xml",
]);
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

await buildCssBundle();
await buildBlog({ siteRoot });

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? "/", `http://${host}:${port}`);

    if (url.pathname.startsWith("/api/blog/")) {
      await handleApiRequest(request, response, url);
      return;
    }

    await serveStaticFile(response, url.pathname);
  } catch (error) {
    respondJson(response, 500, {
      error: error instanceof Error ? error.message : "Internal server error.",
    });
  }
});

server.listen(port, host, () => {
  console.log(`Local site and blog studio available at http://${host}:${port}`);
});

async function handleApiRequest(request, response, url) {
  try {
    if (request.method === "GET" && url.pathname === "/api/blog/documents") {
      respondJson(response, 200, listDocuments({ siteRoot }));
      return;
    }

    if (request.method === "GET" && url.pathname === "/api/blog/document") {
      const slug = url.searchParams.get("slug");
      const status = url.searchParams.get("status");
      respondJson(response, 200, getDocument({ siteRoot, slug, status }));
      return;
    }

    const body = request.method === "POST" ? await readJsonBody(request) : null;
    const source = body?.source ?? body?.markdown ?? body?.content;

    if (request.method === "POST" && url.pathname === "/api/blog/documents/new") {
      const result = scaffoldDraft({
        siteRoot,
        title: body?.title,
        origin: body?.origin,
        showOriginLabel: body?.showOriginLabel,
      });

      respondJson(response, 201, {
        ...result.document,
        documents: listDocuments({ siteRoot }),
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/blog/drafts/save") {
      const result = saveDraft({
        siteRoot,
        source,
        previousSlug: body?.previousSlug ?? body?.slug,
        previousStatus: body?.previousStatus ?? body?.status,
      });

      respondJson(response, 200, {
        ...result,
        documents: listDocuments({ siteRoot }),
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/blog/publish") {
      const result = await publishDocument({
        siteRoot,
        source,
        previousSlug: body?.previousSlug ?? body?.slug,
        previousStatus: body?.previousStatus ?? body?.status,
      });

      respondJson(response, 200, result);
      return;
    }

    if (request.method === "POST" && url.pathname === "/api/blog/preview") {
      respondJson(response, 200, renderPreview({ source }));
      return;
    }

    respondJson(response, 404, { error: "Unknown blog API route." });
  } catch (error) {
    respondJson(response, 400, {
      error: error instanceof Error ? error.message : "Invalid blog request.",
    });
  }
}

async function serveStaticFile(response, pathname) {
  if (pathname === "/blog-studio") {
    respondRedirect(response, "/blog-studio/");
    return;
  }

  const resolvedPath = resolveStaticPath(pathname);
  if (!resolvedPath) {
    respondNotFound(response);
    return;
  }

  try {
    const fileBuffer = await readFile(resolvedPath.filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(resolvedPath.filePath).toLowerCase()] ?? "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(fileBuffer);
  } catch {
    respondNotFound(response);
  }
}

function resolveStaticPath(pathname) {
  const decodedPath = decodeURIComponent(pathname || "/");
  const normalizedPath = normalize(decodedPath).replace(/\\/g, "/");

  if (normalizedPath.startsWith("/blog/drafts/") || normalizedPath.startsWith("/blog/posts/")) {
    return null;
  }

  const requestPath = normalizedPath === "/" ? "/index.html" : normalizedPath;
  const segments = requestPath.split("/").filter(Boolean);

  if (segments.length === 0) {
    return null;
  }

  if (!allowedTopLevelEntries.has(segments[0])) {
    return null;
  }

  const candidate = resolve(siteRoot, ...segments);
  if (!isWithinSiteRoot(candidate)) {
    return null;
  }

  const filePath = resolveFileCandidate(candidate);
  if (!filePath) {
    return null;
  }

  return { filePath };
}

function resolveFileCandidate(candidate) {
  const attempts = [candidate];

  if (!extname(candidate)) {
    attempts.push(`${candidate}.html`);
    attempts.push(join(candidate, "index.html"));
  }

  for (const attempt of attempts) {
    try {
      const fileStats = statSync(attempt);
      if (fileStats.isFile()) {
        return attempt;
      }
    } catch {
      // Continue through the candidate list.
    }
  }

  return null;
}

function isWithinSiteRoot(candidatePath) {
  return candidatePath === siteRoot || candidatePath.startsWith(`${siteRoot}${sep}`);
}

async function readJsonBody(request) {
  const chunks = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  const rawBody = Buffer.concat(chunks).toString("utf8").trim();
  if (!rawBody) {
    return {};
  }

  try {
    return JSON.parse(rawBody);
  } catch {
    throw new Error("Invalid JSON request body.");
  }
}

function respondJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function respondRedirect(response, location) {
  response.writeHead(307, { Location: location, "Cache-Control": "no-store" });
  response.end();
}

function respondNotFound(response) {
  response.writeHead(404, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end("Not found");
}
