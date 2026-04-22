// WebMCP — expose a few read-only site tools to AI agents running in the browser.
// See https://webmachinelearning.github.io/webmcp/
//
// Silently no-ops when the Model Context API is not available, so nothing
// breaks for humans.

(function setupWebMcp() {
  if (typeof navigator === "undefined") return;
  const mc = navigator.modelContext;
  if (!mc || typeof mc.provideContext !== "function") return;

  const tools = [
    {
      name: "search_blog",
      description:
        "Search Daliso Ngoma's blog posts by keyword. Returns up to five matches with title, URL, and one-line summary.",
      inputSchema: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description: "Keyword or phrase to search for in titles, tags, and body text.",
          },
        },
        required: ["query"],
      },
      execute: async ({ query }) => {
        const feed = await fetch("/feed.json", { headers: { Accept: "application/feed+json" } }).then((r) => r.json());
        const needle = String(query || "").trim().toLowerCase();
        if (!needle) return JSON.stringify([]);
        const hits = (feed.items || [])
          .map((item) => {
            const haystack = `${item.title} ${item.summary || ""} ${(item.tags || []).join(" ")} ${item.content_text || ""}`.toLowerCase();
            return haystack.includes(needle) ? item : null;
          })
          .filter(Boolean)
          .slice(0, 5)
          .map((item) => ({
            title: item.title,
            url: item.url,
            summary: item.summary,
            date: item.date_published,
            tags: item.tags,
          }));
        return JSON.stringify(hits);
      },
    },
    {
      name: "list_projects",
      description:
        "List Daliso Ngoma's projects, optionally filtered by status (Live, Building, Operational, Prototype) or category id.",
      inputSchema: {
        type: "object",
        properties: {
          status: { type: "string", description: "Optional status filter." },
          category: { type: "string", description: "Optional category id filter." },
        },
      },
      execute: async ({ status, category } = {}) => {
        const data = await fetch("/api/projects.json").then((r) => r.json());
        let projects = data.projects || [];
        if (status) projects = projects.filter((p) => p.status === status);
        if (category) projects = projects.filter((p) => p.category === category);
        return JSON.stringify(
          projects.map((p) => ({
            title: p.title,
            status: p.status,
            category: p.categoryTitle,
            summary: p.summary,
            links: p.links,
            url: p.url,
          }))
        );
      },
    },
    {
      name: "get_site_map",
      description:
        "Return the machine-friendly site map (llms.txt) as plain text, with links to every key page and feed.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => {
        return await fetch("/llms.txt", { headers: { Accept: "text/plain" } }).then((r) => r.text());
      },
    },
    {
      name: "get_bio",
      description:
        "Return Daliso Ngoma's short biography and primary contact details.",
      inputSchema: { type: "object", properties: {} },
      execute: async () => {
        return JSON.stringify({
          name: "Daliso Ngoma",
          role: "Founder & Managing Director, African Technopreneurs",
          bio: "Founder building immersive tech, commerce, media, and software products across Africa.",
          site: "https://daliso.com/",
          email: "info@africantechno.com",
          social: {
            x: "https://x.com/djngoma",
            linkedin: "https://linkedin.com/in/djngoma",
            instagram: "https://instagram.com/djngoma",
            github: "https://github.com/DJNgoma",
          },
        });
      },
    },
  ];

  try {
    mc.provideContext({ tools });
  } catch (_error) {
    // No-op. Agents that don't support this call shouldn't break the page.
  }
})();
