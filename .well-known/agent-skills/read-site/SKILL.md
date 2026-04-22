# Skill: read-site

Ingest the full plain-text content of daliso.com in a single request.

## Endpoint

- `https://daliso.com/llms-full.txt` — concatenated plain-text of every page
- `https://daliso.com/llms.txt` — compact machine-friendly map of the site

## Shape

`llms-full.txt` is a Markdown-flavoured document with a bio section, site map,
feed URLs, and the full body of every published blog post separated by `---`.
It is safe to feed directly into a language model as context.

`llms.txt` follows the llmstxt.org convention: a top-level `# Title`, a
block-quote summary, and sections of Markdown links to core pages and feeds.

## Usage

Use `llms.txt` to decide where to go; use `llms-full.txt` when the agent
needs everything in one shot. Prefer per-post plain-text at
`https://daliso.com/blog/<slug>/plaintext.txt` for single-article work.

## Citation

Any excerpt should link to the specific canonical URL it came from, not to
`llms-full.txt`. Content © Daliso Ngoma.
