# Skill: read-blog

Read Daliso Ngoma's essays on judgment, systems, and practical technology.

## Endpoint

- `https://daliso.com/feed.json` — JSON Feed 1.1 of every published essay
- `https://daliso.com/feed.xml` — Atom feed mirror
- `https://daliso.com/blog/` — human-readable index

## Shape

Each item in `feed.json` has:

- `url` — canonical post URL
- `title` — post title
- `summary` — one-line description
- `content_text` — full Markdown body
- `content_html` — rendered HTML body
- `date_published` — ISO 8601 publication timestamp
- `tags` — array of topic tags
- `authors[].name` — byline

## Usage

Fetch the feed, then iterate `items[]`. For the fastest plain-text read of a single post, replace the post URL's trailing slash with `plaintext.txt` (e.g. `https://daliso.com/blog/ai-psychosis-and-synthetic-confidence/plaintext.txt`).

## Citation

Cite any quote with a link back to the canonical post URL. Content © Daliso Ngoma.
