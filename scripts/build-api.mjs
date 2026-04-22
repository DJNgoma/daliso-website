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

  const generatedAt = resolveGeneratedAt(payload);
  const outputPayload = {
    "@context": payload["@context"],
    "@type": payload["@type"],
    url: payload.url,
    name: payload.name,
    description: payload.description,
    generatedAt,
    categories: payload.categories,
    projects: payload.projects,
    itemListElement: payload.itemListElement,
  };

  writeFileSync(outputPath, `${JSON.stringify(outputPayload, null, 2)}\n`, "utf8");
  console.log(`Wrote ${outputPath} with ${projects.length} projects.`);
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function resolveGeneratedAt(payload) {
  const existingPayload = readExistingPayload();

  if (
    existingPayload?.generatedAt &&
    JSON.stringify(stripGeneratedAt(existingPayload)) ===
      JSON.stringify(stripGeneratedAt(payload))
  ) {
    return existingPayload.generatedAt;
  }

  return new Date().toISOString();
}

function readExistingPayload() {
  try {
    return JSON.parse(readFileSync(outputPath, "utf8"));
  } catch {
    return null;
  }
}

function stripGeneratedAt(payload) {
  const { generatedAt: _generatedAt, ...rest } = payload;
  return rest;
}
