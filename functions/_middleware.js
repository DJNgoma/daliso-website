// Cloudflare Pages Function — content negotiation middleware.
//
// Agents can request `Accept: text/markdown` (or append `?format=md`) to get the
// markdown version of any HTML page. Humans continue to receive HTML. Also
// sets a Vary header so intermediaries do not serve the wrong variant.

const htmlCacheControl = "public, max-age=0, must-revalidate, no-transform";
const htmlDiscoveryLinks = [
  '</llms.txt>; rel="describedby"; type="text/plain"',
  '</llms-full.txt>; rel="alternate"; type="text/plain"; title="Full site text"',
  '</sitemap.xml>; rel="sitemap"; type="application/xml"',
  '</feed.xml>; rel="alternate"; type="application/atom+xml"; title="Blog (Atom)"',
  '</feed.json>; rel="alternate"; type="application/feed+json"; title="Blog (JSON Feed)"',
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</.well-known/openapi.yaml>; rel="service-desc"; type="application/yaml"',
  '</.well-known/ai-plugin.json>; rel="service-meta"; type="application/json"',
  '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"',
  '</.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"',
  '</.well-known/oauth-protected-resource>; rel="oauth-protected-resource"; type="application/json"',
  '</privacy/>; rel="privacy-policy"',
  '</.well-known/security.txt>; rel="security"; type="text/plain"',
  '<mailto:info@africantechno.com>; rel="author"',
];

export const onRequest = async (context) => {
  const { request, next, env } = context;
  const url = new URL(request.url);
  const accept = request.headers.get("Accept") || "";
  const queryFormat = url.searchParams.get("format");

  const wantsMarkdown =
    queryFormat === "md" ||
    queryFormat === "markdown" ||
    /\btext\/markdown\b/i.test(accept) ||
    /\btext\/x-markdown\b/i.test(accept);

  const response = await next();

  if (!response) return response;

  // Only override successful HTML responses.
  const contentType = response.headers.get("Content-Type") || "";
  const isHtml = contentType.toLowerCase().includes("text/html");

  if (!wantsMarkdown || !isHtml || response.status !== 200) {
    return isHtml ? withHtmlHeaders(response) : response;
  }

  const mdCandidates = candidateMarkdownPaths(url.pathname);
  for (const candidatePath of mdCandidates) {
    const candidateUrl = new URL(candidatePath, url);
    let mdResponse;
    try {
      // env.ASSETS is the default static-assets binding in Cloudflare Pages.
      mdResponse = env && env.ASSETS
        ? await env.ASSETS.fetch(candidateUrl.toString())
        : await fetch(candidateUrl.toString());
    } catch (error) {
      mdResponse = null;
    }

    if (mdResponse && mdResponse.status === 200) {
      const body = await mdResponse.text();
      const tokenCount = Math.max(1, Math.round(body.length / 4));
      const headers = new Headers({
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "public, max-age=300, must-revalidate",
        "Access-Control-Allow-Origin": "*",
        "X-Markdown-Tokens": String(tokenCount),
        "X-Markdown-Source": candidatePath,
        "Vary": "Accept",
        "Link": `<${url.pathname}>; rel="canonical"`,
      });
      return new Response(body, { status: 200, headers });
    }
  }

  // No markdown variant found — return HTML but still advertise Vary.
  return withHtmlHeaders(response);
};

function withHtmlHeaders(response) {
  const headers = new Headers(response.headers);
  const existingVary = headers.get("Vary") || "";
  const varyValues = existingVary.split(",").map((s) => s.trim().toLowerCase());

  headers.set("Cache-Control", htmlCacheControl);
  headers.set("Link", htmlDiscoveryLinks.join(", "));
  if (!varyValues.includes("accept")) {
    headers.set("Vary", existingVary ? `${existingVary}, Accept` : "Accept");
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function candidateMarkdownPaths(pathname) {
  const clean = pathname.replace(/\/+$/, "") || "";
  const candidates = [];

  if (pathname.endsWith("/")) {
    candidates.push(`${pathname}index.md`);
  } else if (/\.html?$/.test(pathname)) {
    candidates.push(pathname.replace(/\.html?$/, ".md"));
  } else {
    candidates.push(`${pathname}.md`);
    candidates.push(`${pathname}/index.md`);
  }

  if (clean.startsWith("/blog/") && clean !== "/blog") {
    candidates.push(`${clean}/plaintext.txt`);
  }

  return candidates;
}
