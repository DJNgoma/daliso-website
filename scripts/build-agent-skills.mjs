import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const siteRoot = resolve(scriptDir, "..");
const skillsRoot = join(siteRoot, ".well-known", "agent-skills");
const outputPath = join(skillsRoot, "index.json");

const skills = [
  {
    name: "read-blog",
    type: "reference",
    description:
      "Read Daliso Ngoma's essays on judgment, systems, and practical technology via Atom or JSON Feed.",
    relativePath: "read-blog/SKILL.md",
    endpoint: "https://daliso.com/feed.json",
  },
  {
    name: "list-projects",
    type: "reference",
    description:
      "Enumerate Daliso Ngoma's portfolio of live, in-progress, and prototype projects.",
    relativePath: "list-projects/SKILL.md",
    endpoint: "https://daliso.com/api/projects.json",
  },
  {
    name: "read-site",
    type: "reference",
    description:
      "Ingest the full plain-text content of daliso.com in a single request.",
    relativePath: "read-site/SKILL.md",
    endpoint: "https://daliso.com/llms-full.txt",
  },
  {
    name: "contact-author",
    type: "reference",
    description:
      "Reach Daliso Ngoma by email for inquiries, collaborations, or app support.",
    relativePath: "contact-author/SKILL.md",
    endpoint: "mailto:info@africantechno.com",
  },
];

function sha256Hex(filePath) {
  const contents = readFileSync(filePath);
  return createHash("sha256").update(contents).digest("hex");
}

const index = {
  $schema:
    "https://raw.githubusercontent.com/cloudflare/agent-skills-discovery-rfc/main/schemas/v0.2.0/index.json",
  version: "0.2.0",
  publisher: {
    name: "Daliso Ngoma",
    url: "https://daliso.com/",
    contact: "mailto:info@africantechno.com",
  },
  skills: skills.map((skill) => {
    const filePath = join(skillsRoot, skill.relativePath);
    return {
      name: skill.name,
      type: skill.type,
      description: skill.description,
      url: `https://daliso.com/.well-known/agent-skills/${skill.relativePath}`,
      endpoint: skill.endpoint,
      sha256: sha256Hex(filePath),
    };
  }),
};

writeFileSync(outputPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
console.log(
  `Wrote ${outputPath} with ${index.skills.length} skills (sha256 digests computed).`
);
