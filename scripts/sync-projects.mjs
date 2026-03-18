import { execFileSync } from "node:child_process";
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, "..");
const workspaceRoot = resolve(process.env.PROJECTS_WORKSPACE_ROOT ?? join(siteRoot, ".."));
const manifestPath = join(siteRoot, "data", "projects-manifest.json");
const outputPath = join(siteRoot, "js", "projects-data.json");

const IGNORED_DIRS = new Set([
  ".git",
  ".next",
  ".wrangler",
  "coverage",
  "dist",
  "logs",
  "node_modules",
  "out",
  "reports",
  "snapshots",
  "test-results",
]);

const RELEVANT_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".csv",
  ".html",
  ".js",
  ".json",
  ".jsx",
  ".md",
  ".mdx",
  ".mjs",
  ".php",
  ".prisma",
  ".py",
  ".scss",
  ".sql",
  ".svg",
  ".toml",
  ".ts",
  ".tsx",
  ".txt",
  ".vue",
  ".yaml",
  ".yml",
]);

main();

function main() {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const workspaceFolders = readdirSync(workspaceRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith("."))
    .map((entry) => entry.name);

  const categories = [...manifest.categories].sort((left, right) => left.order - right.order);
  const categoryIds = new Set(categories.map((category) => category.id));
  const publishedFolders = Object.keys(manifest.projects);
  const missingFolders = publishedFolders.filter((folder) => !workspaceFolders.includes(folder));

  if (missingFolders.length > 0) {
    throw new Error(
      `Published project folders are missing from ${workspaceRoot}: ${missingFolders.join(", ")}`
    );
  }

  const projectCatalog = publishedFolders
    .map((folder) => {
      const config = manifest.projects[folder];
      if (!categoryIds.has(config.category)) {
        throw new Error(`Unknown category "${config.category}" configured for ${folder}`);
      }

      const projectPath = join(workspaceRoot, folder);
      const freshness = getProjectFreshness(projectPath);

      return {
        id: folder,
        folder,
        title: config.title,
        category: config.category,
        status: config.status,
        summary: config.summary,
        order: config.order,
        lastUpdated: freshness.iso,
        freshnessSource: freshness.source,
        links: (config.links ?? []).map((link) => ({
          label: link.label,
          url: link.url,
          kind: link.kind ?? "reference",
        })),
      };
    })
    .sort((left, right) => left.order - right.order || left.title.localeCompare(right.title));

  const output = {
    generatedAt: new Date().toISOString(),
    source: {
      label: "Developer folder",
      scanMode: "top-level",
    },
    projectSections: categories,
    projectCatalog,
  };

  writeFileSync(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");

  console.log(`Synced ${projectCatalog.length} projects from ${workspaceRoot}`);
  console.log(`Manifest: ${manifestPath}`);
  console.log(`Output: ${outputPath}`);
}

function getProjectFreshness(projectPath) {
  const commitDate = execGit(projectPath, ["log", "-1", "--format=%cI"]);
  if (commitDate) {
    return {
      iso: new Date(commitDate).toISOString(),
      source: "git",
    };
  }

  return {
    iso: new Date(findLatestSourceMtime(projectPath)).toISOString(),
    source: "filesystem",
  };
}

function execGit(projectPath, args) {
  if (!existsSync(join(projectPath, ".git"))) {
    return "";
  }

  try {
    return execFileSync("git", ["-C", projectPath, ...args], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch {
    return "";
  }
}

function findLatestSourceMtime(projectPath) {
  let latestMtime = statSync(projectPath).mtimeMs;
  const stack = [projectPath];

  while (stack.length > 0) {
    const currentPath = stack.pop();
    const entries = readdirSync(currentPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }

      const entryPath = join(currentPath, entry.name);

      if (entry.isDirectory()) {
        if (IGNORED_DIRS.has(entry.name)) {
          continue;
        }

        stack.push(entryPath);
        continue;
      }

      if (!entry.isFile() || !isRelevantFile(entry.name)) {
        continue;
      }

      latestMtime = Math.max(latestMtime, statSync(entryPath).mtimeMs);
    }
  }

  return latestMtime;
}

function isRelevantFile(fileName) {
  if (["Dockerfile", "Makefile", "Procfile"].includes(fileName)) {
    return true;
  }

  return RELEVANT_EXTENSIONS.has(extname(fileName).toLowerCase());
}
