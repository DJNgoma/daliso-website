import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, "..");
const manifestPath = join(siteRoot, "data", "projects-manifest.json");
const apiDir = join(siteRoot, "api");
const outputPath = join(apiDir, "projects.json");

buildProjectsApi();

function buildProjectsApi() {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const categoriesById = new Map(
    manifest.categories.map((category) => [category.id, category])
  );

  const categories = [...manifest.categories].sort(
    (left, right) => left.order - right.order
  );

  const projects = Object.entries(manifest.projects)
    .map(([id, config]) => {
      const category = categoriesById.get(config.category);
      return {
        id,
        title: config.title,
        category: config.category,
        categoryTitle: category?.title ?? config.category,
        status: config.status,
        summary: config.summary,
        order: config.order,
        links: (config.links ?? []).map((link) => ({
          label: link.label,
          url: link.url,
          kind: link.kind ?? "reference",
        })),
        url: `https://daliso.com/projects/#${slugify(id)}`,
      };
    })
    .sort(
      (left, right) =>
        left.order - right.order || left.title.localeCompare(right.title)
    );

  mkdirSync(apiDir, { recursive: true });

  const payload = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: "https://daliso.com/projects/",
    name: "Daliso Ngoma — Projects ledger",
    description:
      "Curated portfolio of live and in-progress projects grouped by category.",
    generatedAt: new Date().toISOString(),
    categories,
    projects,
    itemListElement: projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: project.title,
      url: project.url,
      description: project.summary,
    })),
  };

  writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${outputPath} with ${projects.length} projects.`);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
